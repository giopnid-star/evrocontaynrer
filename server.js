require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TO_EMAIL = process.env.TO_EMAIL || 'tigran.amarhanyan@gmail.com';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'db.sqlite');

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// Open SQLite DB and create table if needed
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error('❌ Failed to open DB:', err);
  console.log('✅ SQLite database opened');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at TEXT,
    sent INTEGER DEFAULT 0,
    message_id TEXT
  )`);
});

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// POST: Send email
app.post('/send', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Не заполнены обязательные поля' });

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ error: 'Сервер не настроен для отправки почты. Установите SMTP_HOST, SMTP_USER и SMTP_PASS.' });
  }

  let contactId = null;
  try {
    const createdAt = new Date().toISOString();
    const insert = await runSql(`INSERT INTO contacts (name,email,message,created_at,sent) VALUES (?,?,?,?,0)`, [name, email, message, createdAt]);
    contactId = insert.lastID;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
      secure: SMTP_PORT == 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const mailOptions = {
      from: `${name} <${email}>`,
      to: TO_EMAIL,
      subject: `Сообщение с сайта от ${name}`,
      text: `Имя: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Имя:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g,'<br>')}</p>`
    };

    const info = await transporter.sendMail(mailOptions);

    // mark as sent
    await runSql(`UPDATE contacts SET sent=1, message_id=? WHERE id=?`, [info.messageId || '', contactId]);
    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('Error sending mail or saving to DB:', err);
    try {
      if (contactId) {
        await runSql(`UPDATE contacts SET sent=0 WHERE id=?`, [contactId]);
      }
    } catch (uerr) {
      console.error('Failed to update contact status:', uerr);
    }
    return res.status(500).json({ error: 'Ошибка отправки письма: ' + err.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// GET: List contacts
app.get('/api/contacts', (req, res) => {
  const q = (req.query.q || '').trim();
  const sent = req.query.sent;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;

  let where = '1=1';
  const params = [];
  if (sent === '0' || sent === '1') { where += ' AND sent = ?'; params.push(parseInt(sent,10)); }
  if (q) { where += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }

  db.get(`SELECT COUNT(*) as cnt FROM contacts WHERE ${where}`, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = row ? row.cnt : 0;
    db.all(`SELECT id,name,email,message,created_at,sent,message_id FROM contacts WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, params.concat([limit, offset]), (e, rows) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ total, contacts: rows });
    });
  });
});

// GET: Export CSV
app.get('/api/contacts/export', (req, res) => {
  const q = (req.query.q || '').trim();
  const sent = req.query.sent;
  let where = '1=1';
  const params = [];
  if (sent === '0' || sent === '1') { where += ' AND sent = ?'; params.push(parseInt(sent,10)); }
  if (q) { where += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }

  db.all(`SELECT id,name,email,message,created_at,sent FROM contacts WHERE ${where} ORDER BY id DESC`, params, (err, rows) => {
    if (err) return res.status(500).send('DB error: '+err.message);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-${Date.now()}.csv"`);
    res.write('id,name,email,message,created_at,sent\n');
    for (const r of rows) {
      const line = [r.id, escapeCsv(r.name), escapeCsv(r.email), escapeCsv(r.message), r.created_at, r.sent].join(',') + '\n';
      res.write(line);
    }
    res.end();
  });
});

function escapeCsv(s){ if (s==null) return ''; return '"'+String(s).replace(/"/g,'""')+'"'; }

// POST: Create backup
app.post('/api/backup', async (req, res) => {
  try {
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const backupDir = path.join(__dirname, 'data', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const dest = path.join(backupDir, `db-backup-${ts}.sqlite`);
    fs.copyFileSync(DB_PATH, dest);
    return res.json({ ok: true, file: dest });
  } catch (err) {
    console.error('Backup error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mail & DB server listening on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite @ ${DB_PATH}`);
  console.log(`📋 Admin panel: http://localhost:${PORT}/admin.html`);
});
