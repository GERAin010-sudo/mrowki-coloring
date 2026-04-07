/* ============================================
   MRÓWKI COLORING CRM — Main Server
   Express API + Telegram Bot
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const CRMDatabase = require('./database');
const BotCommands = require('./bot/commands');

const app = express();
const PORT = process.env.PORT || 3000;

// Uploads directory
const UPLOADS_DIR = path.join(__dirname, '..', 'assets', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer config for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `realizacja-${Date.now()}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Dozwolone formaty: JPG, PNG, WEBP, GIF'));
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'admin')));
// Serve uploaded images for the frontend website
app.use('/uploads', express.static(UPLOADS_DIR));

// Initialize Database
const db = new CRMDatabase();
console.log('✅ Database initialized');

// Initialize Telegram Bot (only if token provided)
let bot = null;
let botCommands = null;

if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
  const TelegramBot = require('node-telegram-bot-api');
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  botCommands = new BotCommands(bot, db);
  console.log('✅ Telegram bot started');

  // Set admin IDs
  if (process.env.ADMIN_TELEGRAM_IDS) {
    const adminIds = process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => id.trim());
    adminIds.forEach(id => {
      if (id) db.createUser(id, 'Admin', 'admin');
    });
  }
} else {
  console.log('⚠️  No Telegram bot token provided. Bot is disabled.');
  console.log('   Set TELEGRAM_BOT_TOKEN in .env to enable the bot.');
}

/* ===== REST API ===== */

// --- Dashboard ---
app.get('/api/stats', (req, res) => {
  try {
    res.json(db.getStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Clients ---
app.get('/api/klienci', (req, res) => {
  try {
    const { search } = req.query;
    const clients = search ? db.searchClients(search) : db.getAllClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/klienci/:id', (req, res) => {
  try {
    const client = db.getClient(req.params.id);
    if (!client) return res.status(404).json({ error: 'Klient nie znaleziony' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/klienci', (req, res) => {
  try {
    const result = db.createClient(req.body);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Klient dodany' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/klienci/:id', (req, res) => {
  try {
    db.updateClient(req.params.id, req.body);
    res.json({ message: 'Klient zaktualizowany' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Orders ---
app.get('/api/zlecenia', (req, res) => {
  try {
    const { active } = req.query;
    const orders = active === 'true' ? db.getActiveOrders() : db.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/zlecenia/:id', (req, res) => {
  try {
    const order = db.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Zlecenie nie znalezione' });
    const history = db.getOrderHistory(req.params.id);
    res.json({ ...order, historia: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/zlecenia', (req, res) => {
  try {
    const result = db.createOrder(req.body);
    res.status(201).json({ id: result.lastInsertRowid, numer: result.numer, message: 'Zlecenie utworzone' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/zlecenia/:id/status', (req, res) => {
  try {
    const { status, user } = req.body;
    db.updateOrderStatus(req.params.id, status, user || 'Admin Panel');
    res.json({ message: 'Status zaktualizowany' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/zlecenia/:id', (req, res) => {
  try {
    db.updateOrder(req.params.id, req.body);
    res.json({ message: 'Zlecenie zaktualizowane' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- History ---
app.get('/api/historia/:zlecenieId', (req, res) => {
  try {
    const history = db.getOrderHistory(req.params.zlecenieId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Realizacje (Portfolio) ---
// Public: only visible photos
app.get('/api/realizacje', (req, res) => {
  try {
    res.json(db.getAllRealizacje());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: all photos including hidden
app.get('/api/realizacje/admin', (req, res) => {
  try {
    res.json(db.getAllRealizacjeAdmin());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload new photo
app.post('/api/realizacje', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });
    const result = db.createRealizacja({
      tytul: req.body.tytul || 'Realizacja',
      opis: req.body.opis || '',
      kategoria: req.body.kategoria || 'inne',
      plik: req.file.filename
    });
    res.status(201).json({ id: result.lastInsertRowid, plik: req.file.filename, message: 'Zdjęcie dodane' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update photo metadata
app.put('/api/realizacje/:id', (req, res) => {
  try {
    db.updateRealizacja(req.params.id, req.body);
    res.json({ message: 'Realizacja zaktualizowana' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete photo
app.delete('/api/realizacje/:id', (req, res) => {
  try {
    // Get file info before deleting
    const item = db.db.prepare('SELECT plik FROM realizacje WHERE id = ?').get(req.params.id);
    if (item) {
      const filePath = path.join(UPLOADS_DIR, item.plik);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.deleteRealizacja(req.params.id);
    res.json({ message: 'Realizacja usunięta' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin panel route ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏗️  Mrówki Coloring CRM Server`);
  console.log(`   Admin panel: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Bot: ${bot ? 'Active' : 'Disabled'}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  db.close();
  if (bot) bot.stopPolling();
  process.exit(0);
});
