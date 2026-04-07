/* ============================================
   MRÓWKI COLORING CRM — Main Server
   Express API + Telegram Bot
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const CRMDatabase = require('./database');
const BotCommands = require('./bot/commands');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'admin')));

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
