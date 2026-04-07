/* ============================================
   MRÓWKI COLORING CRM — Main Server
   Express API + Telegram Bot
   Weeek-style pipeline CRM
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const CRMDatabase = require('./database');
const { FUNNELS } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Uploads directory
const UPLOADS_DIR = path.join(__dirname, '..', 'assets', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = req.path.includes('realizacje') ? 'realizacja' : 'file';
    cb(null, `${prefix}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|xls|xlsx)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Niedozwolony format pliku'));
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Init Database
const db = new CRMDatabase();
console.log('✅ Database initialized');

// Init Telegram Bot (optional)
let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
  try {
    const TelegramBot = require('node-telegram-bot-api');
    const BotCommands = require('./bot/commands');
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    new BotCommands(bot, db);
    console.log('✅ Telegram bot started');
    if (process.env.ADMIN_TELEGRAM_IDS) {
      process.env.ADMIN_TELEGRAM_IDS.split(',').forEach(id => {
        if (id.trim()) db.createUser(id.trim(), 'Admin', 'admin');
      });
    }
  } catch(e) {
    console.log('⚠️  Telegram bot error:', e.message);
  }
} else {
  console.log('⚠️  No Telegram bot token. Bot disabled.');
}

/* ===== REST API ===== */

// --- Funnels config ---
app.get('/api/funnels', (req, res) => res.json(FUNNELS));

// --- Dashboard Stats ---
app.get('/api/stats', (req, res) => {
  try { res.json(db.getStats()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Companies ---
app.get('/api/kompanie', (req, res) => {
  try { res.json(db.getAllCompanies()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/kompanie/:id', (req, res) => {
  try {
    const c = db.getCompany(req.params.id);
    if (!c) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/kompanie', (req, res) => {
  try {
    const r = db.createCompany(req.body);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/kompanie/:id', (req, res) => {
  try { db.updateCompany(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/kompanie/:id', (req, res) => {
  try { db.deleteCompany(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Contacts ---
app.get('/api/kontakty', (req, res) => {
  try { res.json(db.getAllContacts()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/kontakty/:id', (req, res) => {
  try {
    const c = db.getContact(req.params.id);
    if (!c) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/kontakty', (req, res) => {
  try {
    const r = db.createContact(req.body);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/kontakty/:id', (req, res) => {
  try { db.updateContact(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/kontakty/:id', (req, res) => {
  try { db.deleteContact(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Deals / Transactions ---
app.get('/api/transakcje', (req, res) => {
  try {
    const { voronka } = req.query;
    const deals = voronka ? db.getDealsByFunnel(voronka) : db.getDealsByFunnel('sprzedaz');
    res.json(deals);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/transakcje/:id', (req, res) => {
  try {
    const d = db.getDeal(req.params.id);
    if (!d) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(d);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/transakcje', (req, res) => {
  try {
    const r = db.createDeal(req.body);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/transakcje/:id', (req, res) => {
  try { db.updateDeal(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/transakcje/:id/move', (req, res) => {
  try {
    db.moveDeal(req.params.id, req.body.etap, req.body.user || 'Admin');
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/transakcje/:id', (req, res) => {
  try { db.deleteDeal(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Tasks ---
app.post('/api/transakcje/:id/zadania', (req, res) => {
  try {
    const r = db.addTask(req.params.id, req.body.tresc);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/zadania/:id/toggle', (req, res) => {
  try { db.toggleTask(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/zadania/:id', (req, res) => {
  try { db.deleteTask(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Files ---
app.post('/api/transakcje/:id/pliki', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });
    const r = db.addFile(req.params.id, req.file.filename, req.file.originalname);
    res.status(201).json({ id: r.lastInsertRowid, plik: req.file.filename });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/pliki/:id', (req, res) => {
  try {
    const file = db.db.prepare('SELECT plik FROM pliki WHERE id = ?').get(req.params.id);
    if (file) {
      const fp = path.join(UPLOADS_DIR, file.plik);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    db.deleteFile(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Warehouse / Stock ---
app.get('/api/magazyn', (req, res) => {
  try { res.json(db.getAllStock()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/magazyn/:id', (req, res) => {
  try {
    const item = db.getStockItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/magazyn', (req, res) => {
  try {
    const r = db.createStockItem(req.body);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/magazyn/:id', (req, res) => {
  try { db.updateStockItem(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/magazyn/:id', (req, res) => {
  try { db.deleteStockItem(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/magazyn/:id/zakup', (req, res) => {
  try {
    const r = db.addPurchase({ magazyn_id: req.params.id, ...req.body });
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/magazyn/:id/zuzycie', (req, res) => {
  try {
    const r = db.consumeStock({ magazyn_id: req.params.id, ...req.body });
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Realizacje (Portfolio) --- preserved
app.get('/api/realizacje', (req, res) => {
  try { res.json(db.getAllRealizacje()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/realizacje/admin', (req, res) => {
  try { res.json(db.getAllRealizacjeAdmin()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/realizacje', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });
    const r = db.createRealizacja({ tytul: req.body.tytul || 'Realizacja', opis: req.body.opis || '', kategoria: req.body.kategoria || 'inne', plik: req.file.filename });
    res.status(201).json({ id: r.lastInsertRowid, plik: req.file.filename });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/realizacje/:id', (req, res) => {
  try { db.updateRealizacja(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/realizacje/:id', (req, res) => {
  try {
    const item = db.db.prepare('SELECT plik FROM realizacje WHERE id = ?').get(req.params.id);
    if (item) { const fp = path.join(UPLOADS_DIR, item.plik); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
    db.deleteRealizacja(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Admin panel ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));

// Start
app.listen(PORT, () => {
  console.log(`\n🏗️  Mrówki Coloring CRM Server`);
  console.log(`   Admin panel: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Bot: ${bot ? 'Active' : 'Disabled'}\n`);
});

process.on('SIGINT', () => { db.close(); if (bot) bot.stopPolling(); process.exit(0); });
