require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const crypto = require('crypto'); // Оставляем для токенов
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5501;
const TO_EMAIL = process.env.TO_EMAIL || 'tigran.amarhanyan@gmail.com';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// --- SECURITY: Rate Limiters ---
// Ограничитель для API (100 запросов за 15 минут)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
// Строгий ограничитель для логина и отправки писем (5 попыток за час)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10, 
  message: { error: 'Слишком много попыток, попробуйте позже' }
});

app.use('/api/', apiLimiter);

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ОШИБКА: DATABASE_URL не установлена!');
  console.error('');
  console.error('На Railway выполните:');
  console.error('1. В вашем проекте нажмите "New"');
  console.error('2. Выберите "Database" → "Add PostgreSQL"');
  console.error('3. Railway автоматически создаст DATABASE_URL');
  console.error('4. Приложение перезапустится автоматически');
  console.error('');
  console.error('Для локальной разработки создайте .env файл:');
  console.error('DATABASE_URL=postgresql://user:password@localhost:5432/evrocontayner');
  process.exit(1);
}

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

    // Create indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_sent ON contacts(sent)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token)`);

    console.log('✅ PostgreSQL database initialized with indexes');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    console.error('Проверьте подключение к базе данных');
    process.exit(1);
  } finally {
    client.release();
  }
}

// Test database connection before initializing
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Не удалось подключиться к PostgreSQL:', err.message);
    console.error('Убедитесь что PostgreSQL база добавлена в Railway проект');
    process.exit(1);
  }
  console.log('✅ PostgreSQL подключение успешно');
  initDatabase();
});

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// POST: User Registration
app.post('/api/register', async (req, res) => {
  const { email, password, name, rememberMe } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, пароль и имя обязательны' });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
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
    // 90 дней if remember me, otherwise 30 days
    const sessionDays = rememberMe ? 90 : 30;
    const sessionExpires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
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
app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password, rememberMe } = req.body || {};
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
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const sessionToken = generateToken();
    // 90 дней if remember me, otherwise 30 days
    const sessionDays = rememberMe ? 90 : 30;
    const sessionExpires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
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
app.post('/send', authLimiter, async (req, res) => {
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

// GET: Dynamic Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://evrocontayner.kz';
  const today = new Date().toISOString().split('T')[0];

  const pages = [
    { url: '/', priority: 1.0, freq: 'weekly' },
    { url: '/products/', priority: 0.9, freq: 'weekly' },
    { url: '/services/', priority: 0.9, freq: 'weekly' },
    { url: '/kiosks/', priority: 0.8, freq: 'weekly' },
    { url: '/pavilions/', priority: 0.8, freq: 'weekly' },
    { url: '/containers/', priority: 0.8, freq: 'weekly' },
    { url: '/about/', priority: 0.7, freq: 'monthly' },
    { url: '/contact/', priority: 0.7, freq: 'monthly' },
    { url: '/gallery/', priority: 0.6, freq: 'monthly' },
    { url: '/kiosk-karaganda/', priority: 0.7, freq: 'monthly' },
    { url: '/terms/', priority: 0.3, freq: 'yearly' }
  ];

  const cities = [
    'almaty', 'astana', 'shymkent', 'karaganda', 'aktobe', 
    'taraz', 'pavlodar', 'ust-kamenogorsk', 'semey', 'atyrau', 
    'kostanay', 'kyzylorda', 'aktau', 'oral', 'turkistan', 
    'kokshetau', 'taldykorgan', 'petropavl', 'ekibastuz', 'zhezkazgan'
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.freq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  cities.forEach(city => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/city/${city}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// GET: Cities Sitemap
app.get('/sitemap-cities.xml', (req, res) => {
  const baseUrl = 'https://evrocontayner.kz';
  const today = new Date().toISOString().split('T')[0];

  const cities = [
    { slug: 'almaty', name: 'Алматы' },
    { slug: 'astana', name: 'Астана' },
    { slug: 'shymkent', name: 'Шымкент' },
    { slug: 'karaganda', name: 'Караганда' },
    { slug: 'aktobe', name: 'Актобе' },
    { slug: 'taraz', name: 'Тараз' },
    { slug: 'pavlodar', name: 'Павлодар' },
    { slug: 'ust-kamenogorsk', name: 'Усть-Каменогорск' },
    { slug: 'semey', name: 'Семей' },
    { slug: 'atyrau', name: 'Атырау' },
    { slug: 'kostanay', name: 'Костанай' },
    { slug: 'kyzylorda', name: 'Кызылорда' },
    { slug: 'aktau', name: 'Актау' },
    { slug: 'oral', name: 'Орал' },
    { slug: 'turkistan', name: 'Туркестан' },
    { slug: 'kokshetau', name: 'Кокшетау' },
    { slug: 'taldykorgan', name: 'Талдыкорган' },
    { slug: 'petropavl', name: 'Петропавловск' },
    { slug: 'ekibastuz', name: 'Экибастуз' },
    { slug: 'zhezkazgan', name: 'Жезказган' }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
  xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  cities.forEach(city => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/city/${city.slug}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="ru-KZ" href="${baseUrl}/city/${city.slug}/"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="kk-KZ" href="${baseUrl}/city/${city.slug}/"/>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// GET: Images Sitemap
app.get('/sitemap-images.xml', (req, res) => {
  const baseUrl = 'https://evrocontayner.kz';
  const today = new Date().toISOString().split('T')[0];

  const imagePages = [
    {
      pageUrl: '/',
      images: [
        { url: '/images/images_previef/1.jpg', title: 'Киоск Evrocontayner - вид 1', caption: 'Производство киосков и контейнеров Evrocontayner' },
        { url: '/images/images_previef/2.jpeg', title: 'Киоск Evrocontayner - вид 2', caption: 'Модульные киоски для бизнеса в Казахстане' },
        { url: '/images/images_previef/3.jpg', title: 'Киоск Evrocontayner - вид 3', caption: 'Торговые павильоны под ключ' },
        { url: '/images/images_previef/4.jpg', title: 'Киоск Evrocontayner - вид 4', caption: 'Контейнеры и киоски с доставкой по Казахстану' }
      ]
    },
    {
      pageUrl: '/gallery/',
      images: [
        { url: '/images/contayner/contayner1/photo_2026-02-13_00-11-36.jpg', title: '40ф контейнер кухня столовая', caption: 'Переоборудованный 40-футовый контейнер под кухню и столовую' },
        { url: '/images/contayner/contayner2/photo_2026-02-13_00-07-41.jpg', title: '40ф контейнер раздевалка склад', caption: 'Контейнер под раздевалку и склад' },
        { url: '/images/contayner/contayner3/photo_2026-02-13_00-15-05.jpg', title: '40ф контейнер жилой с санузлом', caption: 'Жилой контейнер с кухней и санитарным узлом' },
        { url: '/images/contayner/contayner4/photo_2026-02-13_00-09-46.jpg', title: '20ф контейнер склад', caption: '20-футовый контейнер под склад' },
        { url: '/images/kiosks/recycling-kiosk/photo_1_2026-02-13_00-15-45.jpg', title: 'Киоск вторсырья 4000х7000мм', caption: 'Специализированный киоск для приёма вторичных материалов' },
        { url: '/images/kiosks/kiosk1/photo_2026-02-19_16-02-11.jpg', title: 'Киоск 3000x7000мм', caption: 'Торговый киоск с витражной зоной' }
      ]
    }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
  xml += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  imagePages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.pageUrl}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    page.images.forEach(img => {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${baseUrl}${img.url}</image:loc>\n`;
      xml += `      <image:title>${img.title}</image:title>\n`;
      xml += `      <image:caption>${img.caption}</image:caption>\n`;
      xml += '    </image:image>\n';
    });
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Health check endpoint (MUST be before static files)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'PostgreSQL', timestamp: new Date().toISOString() });
});

// Deployment version endpoint (useful to verify Railway serves latest commit)
app.get('/version', (req, res) => {
  res.json({
    commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown',
    deployedAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Prevent stale HTML pages after deploys
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const isHtmlRequest = req.path === '/' || ext === '.html' || ext === '';

  if (isHtmlRequest) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  next();
});

// Serve static files from root directory (HTML, CSS, JS, images)
app.use(express.static(__dirname, {
  index: 'index.html',
  etag: false,
  lastModified: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 Mail & DB server listening on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL (Railway)`);
  console.log(`📋 Admin panel: http://localhost:${PORT}/admin/index.html`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
