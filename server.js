require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
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

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent BOOLEAN DEFAULT false,
        message_id TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        verified BOOLEAN DEFAULT false,
        verification_token TEXT,
        session_token TEXT,
        session_expires TIMESTAMP
      )
    `);

    console.log('✅ PostgreSQL database initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    client.release();
  }
}

initDatabase();

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

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    const passwordHash = hashPassword(password);
    const verificationToken = generateToken();
    
    const result = await client.query(
      'INSERT INTO users (email, password_hash, name, verification_token, verified) VALUES ($1, $2, $3, $4, true) RETURNING id',
      [email, passwordHash, name, verificationToken]
    );

    const userId = result.rows[0].id;

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
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await client.query(
      'UPDATE users SET session_token = $1, session_expires = $2 WHERE id = $3',
      [sessionToken, sessionExpires, userId]
    );

    res.json({ ok: true, userId, sessionToken, user: { id: userId, email, name } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Ошибка регистрации: ' + err.message });
  } finally {
    client.release();
  }
});

// POST: User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const sessionToken = generateToken();
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await client.query(
      'UPDATE users SET session_token = $1, session_expires = $2, last_login = CURRENT_TIMESTAMP WHERE id = $3',
      [sessionToken, sessionExpires, user.id]
    );

    res.json({ ok: true, userId: user.id, sessionToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка входа: ' + err.message });
  } finally {
    client.release();
  }
});

// POST: User Logout
app.post('/api/logout', async (req, res) => {
  const { sessionToken } = req.body || {};
  if (!sessionToken) return res.status(400).json({ error: 'sessionToken обязателен' });

  const client = await pool.connect();
  try {
    await client.query('UPDATE users SET session_token = NULL, session_expires = NULL WHERE session_token = $1', [sessionToken]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST: Verify Session
app.post('/api/verify-session', async (req, res) => {
  const { sessionToken } = req.body || {};
  if (!sessionToken) return res.status(401).json({ ok: false });

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, email, name, session_expires FROM users WHERE session_token = $1',
      [sessionToken]
    );
    if (result.rows.length === 0) return res.status(401).json({ ok: false });

    const user = result.rows[0];
    const now = new Date();
    if (new Date(user.session_expires) < now) {
      await client.query('UPDATE users SET session_token = NULL WHERE id = $1', [user.id]);
      return res.status(401).json({ ok: false, expired: true });
    }

    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
});

// GET: List all users (for admin)
app.get('/api/users', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, email, name, created_at, last_login, verified FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
  const client = await pool.connect();
  try {
    const insert = await client.query(
      'INSERT INTO contacts (name, email, message, sent) VALUES ($1, $2, $3, false) RETURNING id',
      [name, email, message]
    );
    contactId = insert.rows[0].id;

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
    await client.query(
      'UPDATE contacts SET sent = true, message_id = $1 WHERE id = $2',
      [info.messageId || '', contactId]
    );
    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('Error sending mail or saving to DB:', err);
    try {
      if (contactId) {
        await client.query('UPDATE contacts SET sent = false WHERE id = $1', [contactId]);
      }
    } catch (uerr) {
      console.error('Failed to update contact status:', uerr);
    }
    return res.status(500).json({ error: 'Ошибка отправки письма: ' + err.message });
  } finally {
    client.release();
  }
});

// GET: List contacts
app.get('/api/contacts', async (req, res) => {
  const q = (req.query.q || '').trim();
  const sent = req.query.sent;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;

  let whereConditions = [];
  const params = [];
  let paramIndex = 1;

  if (sent === '0') { 
    whereConditions.push(`sent = false`);
  } else if (sent === '1') {
    whereConditions.push(`sent = true`);
  }

  if (q) {
    whereConditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex + 1} OR message ILIKE $${paramIndex + 2})`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    paramIndex += 3;
  }

  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

  const client = await pool.connect();
  try {
    const countResult = await client.query(`SELECT COUNT(*) as cnt FROM contacts ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].cnt);

    params.push(limit, offset);
    const contactsResult = await client.query(
      `SELECT id, name, email, message, created_at, sent, message_id FROM contacts ${whereClause} ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    res.json({ total, contacts: contactsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET: Export CSV
app.get('/api/contacts/export', async (req, res) => {
  const q = (req.query.q || '').trim();
  const sent = req.query.sent;

  let whereConditions = [];
  const params = [];
  let paramIndex = 1;

  if (sent === '0') { 
    whereConditions.push(`sent = false`);
  } else if (sent === '1') {
    whereConditions.push(`sent = true`);
  }

  if (q) {
    whereConditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex + 1} OR message ILIKE $${paramIndex + 2})`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, name, email, message, created_at, sent FROM contacts ${whereClause} ORDER BY id DESC`,
      params
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-${Date.now()}.csv"`);
    res.write('id,name,email,message,created_at,sent\n');
    
    for (const r of result.rows) {
      const line = [r.id, escapeCsv(r.name), escapeCsv(r.email), escapeCsv(r.message), r.created_at, r.sent].join(',') + '\n';
      res.write(line);
    }
    res.end();
  } catch (err) {
    res.status(500).send('DB error: ' + err.message);
  } finally {
    client.release();
  }
});

function escapeCsv(s) { 
  if (s == null) return ''; 
  return '"' + String(s).replace(/"/g, '""') + '"'; 
}

// POST: Create backup (Note: Railway PostgreSQL has automatic backups)
app.post('/api/backup', async (req, res) => {
  try {
    // For PostgreSQL on Railway, backups are automatic
    // This endpoint can trigger a manual database dump if needed
    res.json({ 
      ok: true, 
      message: 'Railway PostgreSQL автоматически создаёт бэкапы. Управление через Railway Dashboard → Database → Backups' 
    });
  } catch (err) {
    console.error('Backup info error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Serve static files (MUST be last, after all API endpoints)
app.use(express.static(path.join(__dirname), {
  skip: (req) => req.path.startsWith('/api')
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'PostgreSQL', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mail & DB server listening on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL (Railway)`);
  console.log(`📋 Admin panel: http://localhost:${PORT}/admin/index.html`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
