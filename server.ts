import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import ping from 'ping';
import nodemailer from 'nodemailer';
import https from 'https';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'netscaler-secret-key-123';

app.use(cors());
app.use(express.json());

let db: Database;

// Initialize Database
async function initDb() {
  db = await open({
    filename: './data/database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      company TEXT,
      check_443 BOOLEAN,
      check_80 BOOLEAN,
      check_ping BOOLEAN,
      status_443 TEXT DEFAULT 'unknown',
      status_80 TEXT DEFAULT 'unknown',
      status_ping TEXT DEFAULT 'unknown',
      last_checked DATETIME
    );
  `);

  // Create default admin if not exists
  const admin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!admin) {
    const hash = await bcrypt.hash('admin', 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash]);
  }

  // Default email settings
  const emailSetting = await db.get('SELECT * FROM settings WHERE key = ?', ['email_config']);
  if (!emailSetting) {
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [
      'email_config',
      JSON.stringify({
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        to: 'bennyd@integrity-software.co.il'
      })
    ]);
  }
}

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.put('/api/admin/password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const hash = await bcrypt.hash(newPassword, 10);
  await db.run('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin']);
  res.json({ success: true });
});

app.get('/api/urls', authenticateToken, async (req, res) => {
  const urls = await db.all('SELECT * FROM urls');
  res.json(urls);
});

app.post('/api/urls', authenticateToken, async (req, res) => {
  const { url, company, check_443, check_80, check_ping } = req.body;
  const result = await db.run(
    'INSERT INTO urls (url, company, check_443, check_80, check_ping) VALUES (?, ?, ?, ?, ?)',
    [url, company, check_443, check_80, check_ping]
  );
  res.json({ id: result.lastID });
});

app.put('/api/urls/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { url, company, check_443, check_80, check_ping } = req.body;
  await db.run(
    'UPDATE urls SET url = ?, company = ?, check_443 = ?, check_80 = ?, check_ping = ? WHERE id = ?',
    [url, company, check_443, check_80, check_ping, id]
  );
  res.json({ success: true });
});

app.delete('/api/urls/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await db.run('DELETE FROM urls WHERE id = ?', [id]);
  res.json({ success: true });
});

app.get('/api/settings/email', authenticateToken, async (req, res) => {
  const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['email_config']);
  res.json(JSON.parse(setting.value));
});

app.put('/api/settings/email', authenticateToken, async (req, res) => {
  await db.run('UPDATE settings SET value = ? WHERE key = ?', [JSON.stringify(req.body), 'email_config']);
  res.json({ success: true });
});

// Polling Logic
async function sendEmailNotification(subject: string, text: string) {
  try {
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['email_config']);
    const config = JSON.parse(setting.value);
    
    if (!config.host || !config.user || !config.pass) return;

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    await transporter.sendMail({
      from: config.user,
      to: config.to,
      subject,
      text
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

async function checkUrls() {
  const urls = await db.all('SELECT * FROM urls');
  
  for (const item of urls) {
    let status_443 = item.status_443;
    let status_80 = item.status_80;
    let status_ping = item.status_ping;

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    if (item.check_443) {
      try {
        await axios.get(`https://${item.url}`, { timeout: 5000, httpsAgent });
        status_443 = 'UP';
      } catch (e) {
        status_443 = 'DOWN';
      }
    }

    if (item.check_80) {
      try {
        await axios.get(`http://${item.url}`, { timeout: 5000 });
        status_80 = 'UP';
      } catch (e) {
        status_80 = 'DOWN';
      }
    }

    if (item.check_ping) {
      try {
        const res = await ping.promise.probe(item.url, { timeout: 5 });
        status_ping = res.alive ? 'UP' : 'DOWN';
      } catch (e) {
        status_ping = 'DOWN';
      }
    }

    // Check for state changes to send notifications
    if (item.check_443 && item.status_443 !== 'unknown' && item.status_443 !== status_443) {
      sendEmailNotification(`Service ${item.url} (443) is ${status_443}`, `The HTTPS service for ${item.company} (${item.url}) is now ${status_443}.`);
    }
    if (item.check_80 && item.status_80 !== 'unknown' && item.status_80 !== status_80) {
      sendEmailNotification(`Service ${item.url} (80) is ${status_80}`, `The HTTP service for ${item.company} (${item.url}) is now ${status_80}.`);
    }
    if (item.check_ping && item.status_ping !== 'unknown' && item.status_ping !== status_ping) {
      sendEmailNotification(`Service ${item.url} (Ping) is ${status_ping}`, `The Ping service for ${item.company} (${item.url}) is now ${status_ping}.`);
    }

    await db.run(
      'UPDATE urls SET status_443 = ?, status_80 = ?, status_ping = ?, last_checked = CURRENT_TIMESTAMP WHERE id = ?',
      [status_443, status_80, status_ping, item.id]
    );
  }
}

async function startServer() {
  await initDb();
  
  // Start polling every minute
  setInterval(checkUrls, 60000);
  // Initial check
  checkUrls();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
