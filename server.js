require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5501;
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

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT,
    last_login TEXT,
    verified INTEGER DEFAULT 0,
    verification_token TEXT,
    session_token TEXT,
    session_expires TEXT
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

function getSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function getAllSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'salt_evrocontayner').digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// POST: User Registration
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, пароль и имя обязательны' });
  }

  try {
    const existing = await getSql('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    const passwordHash = hashPassword(password);
    const createdAt = new Date().toISOString();
    const verificationToken = generateToken();
    
    const result = await runSql(
      'INSERT INTO users (email, password_hash, name, created_at, verification_token, verified) VALUES (?, ?, ?, ?, ?, 1)',
      [email, passwordHash, name, createdAt, verificationToken]
    );

    // Send welcome email
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT == 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Добро пожаловать на Evrocontayner! 🎉',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f7f9fc;border-radius:8px;">
            <h2 style="color:#0f172a;margin-bottom:16px;">Добро пожаловать, ${name}!</h2>
            <p style="color:#475569;font-size:16px;margin-bottom:12px;">Ваш аккаунт успешно создан на сайте <strong>Evrocontayner</strong>.</p>
            <div style="background:#ffffff;padding:16px;border-radius:6px;margin:20px 0;border-left:4px solid #e8d661;">
              <p style="margin:0;color:#0f172a;"><strong>Email:</strong> ${email}</p>
              <p style="margin:8px 0 0 0;color:#475569;font-size:14px;">Вы можете авторизоваться и начать использовать сервис.</p>
            </div>
            <p style="color:#7c8a9d;font-size:14px;margin-top:24px;">С уважением,<br/>Команда Evrocontayner</p>
          </div>
        `
      });
    }

    const sessionToken = generateToken();
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await runSql(
      'UPDATE users SET session_token = ?, session_expires = ? WHERE id = ?',
      [sessionToken, sessionExpires, result.lastID]
    );

    res.json({ ok: true, userId: result.lastID, sessionToken, user: { id: result.lastID, email, name } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Ошибка регистрации: ' + err.message });
  }
});

// POST: User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const user = await getSql('SELECT id, email, name, password_hash FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const sessionToken = generateToken();
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await runSql(
      'UPDATE users SET session_token = ?, session_expires = ?, last_login = ? WHERE id = ?',
      [sessionToken, sessionExpires, new Date().toISOString(), user.id]
    );

    res.json({ ok: true, userId: user.id, sessionToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка входа: ' + err.message });
  }
});

// POST: User Logout
app.post('/api/logout', async (req, res) => {
  const { sessionToken } = req.body || {};
  if (!sessionToken) return res.status(400).json({ error: 'sessionToken обязателен' });

  try {
    await runSql('UPDATE users SET session_token = NULL, session_expires = NULL WHERE session_token = ?', [sessionToken]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Verify Session
app.post('/api/verify-session', async (req, res) => {
  const { sessionToken } = req.body || {};
  if (!sessionToken) return res.status(401).json({ ok: false });

  try {
    const user = await getSql(
      'SELECT id, email, name, session_expires FROM users WHERE session_token = ?',
      [sessionToken]
    );
    if (!user) return res.status(401).json({ ok: false });

    const now = new Date();
    if (new Date(user.session_expires) < now) {
      await runSql('UPDATE users SET session_token = NULL WHERE id = ?', [user.id]);
      return res.status(401).json({ ok: false, expired: true });
    }

    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET: List all users (for admin)
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllSql(
      'SELECT id, email, name, created_at, last_login, verified FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// Serve static files (MUST be last, after all API endpoints)
// Skip /api routes and non-GET requests to directories
app.use(express.static(path.join(__dirname), {
  skip: (req, res) => req.path.startsWith('/api')
}));

app.listen(PORT, () => {
  console.log(`🚀 Mail & DB server listening on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite @ ${DB_PATH}`);
  console.log(`📋 Admin panel: http://localhost:${PORT}/admin.html`);
});
