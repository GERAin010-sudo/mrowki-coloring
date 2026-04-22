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

/* ===== AUTH ===== */

// Login — returns user info by ID
app.post('/api/login', (req, res) => {
  try {
    const user = db.getUserById(req.body.user_id);
    if (!user || !user.aktywny) return res.status(401).json({ error: 'User not found or inactive' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all users (for login picker)
app.get('/api/users', (req, res) => {
  try { res.json(db.getTeam()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Auth helper — extracts current user from X-User-Id header
function getCurrentUser(req) {
  const userId = req.headers['x-user-id'];
  if (!userId) return null;
  return db.getUserById(parseInt(userId));
}

function requireAuth(req, res, next) {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  req.currentUser = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  if (user.rola !== 'admin') return res.status(403).json({ error: 'Admin only' });
  req.currentUser = user;
  next();
}

// Update user role (admin only)
app.put('/api/users/:id/rola', requireAdmin, (req, res) => {
  try {
    db.updateMemberRole(req.params.id, req.body.rola);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ===== REST API ===== */

// --- Frontend config (non-sensitive) ---
app.get('/api/config', (req, res) => res.json({
  googleMapsKey: process.env.GOOGLE_MAPS_API_KEY || ''
}));

// --- Funnels config ---
app.get('/api/funnels', (req, res) => res.json(FUNNELS));

// --- Dashboard Stats ---
app.get('/api/stats', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (user && user.rola === 'wykonawca') {
      res.json(db.getStatsFiltered(user.id));
    } else {
      res.json(db.getStats());
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
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
    const user = getCurrentUser(req);
    const funnel = voronka || 'sprzedaz';
    if (user && user.rola === 'wykonawca') {
      res.json(db.getDealsByFunnelFiltered(funnel, user.id));
    } else {
      res.json(db.getDealsByFunnel(funnel));
    }
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

app.put('/api/transakcje/:id/przedplata', (req, res) => {
  try {
    const { przedplata_wymagana, przedplata_kwota, przedplata_fv_data, przedplata_oplacona_data } = req.body;
    db.db.prepare(`UPDATE transakcje SET przedplata_wymagana=?, przedplata_kwota=?, przedplata_fv_data=?, przedplata_oplacona_data=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(przedplata_wymagana ? 1 : 0, przedplata_kwota || 0, przedplata_fv_data || null, przedplata_oplacona_data || null, req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
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

// --- Team (bot users) ---
app.get('/api/zespol', (req, res) => {
  try { res.json(db.getTeam()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/zespol/:id/kolor', (req, res) => {
  try { db.updateMemberColor(req.params.id, req.body.kolor); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Statuses ---
app.get('/api/task-statusy', (req, res) => {
  try { res.json(db.getTaskStatuses()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/task-statusy', (req, res) => {
  try { const r = db.createTaskStatus(req.body); res.status(201).json({ id: r.lastInsertRowid }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/task-statusy/:id', (req, res) => {
  try { db.updateTaskStatus(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/task-statusy/:id', (req, res) => {
  try { db.deleteTaskStatus(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Categories ---
app.get('/api/task-kategorie', (req, res) => {
  try { res.json(db.getTaskCategories()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/task-kategorie', (req, res) => {
  try { const r = db.createTaskCategory(req.body); res.status(201).json({ id: r.lastInsertRowid }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/task-kategorie/:id', (req, res) => {
  try { db.updateTaskCategory(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/task-kategorie/:id', (req, res) => {
  try { db.deleteTaskCategory(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Templates ---
app.get('/api/task-szablony', (req, res) => {
  try { res.json(db.getTaskTemplates()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/task-szablony', (req, res) => {
  try { const r = db.createTaskTemplate(req.body); res.status(201).json({ id: r.lastInsertRowid }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/task-szablony/:id', (req, res) => {
  try { db.updateTaskTemplate(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/task-szablony/:id', (req, res) => {
  try { db.deleteTaskTemplate(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/task-szablony/:id/create', (req, res) => {
  try {
    const r = db.createTaskFromTemplate(req.params.id, req.body.transakcja_id, req.body.przypisany_id);
    if (!r) return res.status(404).json({ error: 'Template not found' });
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Relations ---
app.post('/api/zadania/:id/relacje', (req, res) => {
  try {
    const r = db.addTaskRelation(req.params.id, req.body.powiazane_id, req.body.typ);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/task-relacje/:id', (req, res) => {
  try { db.deleteTaskRelation(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Assignees (multiple) ---
app.post('/api/zadania/:id/przypisani', (req, res) => {
  try {
    db.addTaskAssignee(req.params.id, req.body.user_id);
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/zadania/:id/przypisani/:userId', (req, res) => {
  try { db.removeTaskAssignee(req.params.id, req.params.userId); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task search (for relations) ---
app.get('/api/zadania-search', (req, res) => {
  try { res.json(db.searchTasks(req.query.q || '')); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Tasks ---
app.get('/api/zadania', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (user && user.rola === 'wykonawca') {
      const filter = { status: req.query.status };
      res.json(db.getAllTasksFiltered(filter, user.id));
    } else {
      const filter = {};
      if (req.query.assignee) filter.assignee = req.query.assignee;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.status_id) filter.status_id = req.query.status_id;
      if (req.query.kategoria_id) filter.kategoria_id = req.query.kategoria_id;
      if (req.query.standalone === '1') filter.standalone = true;
      res.json(db.getAllTasks(filter));
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create standalone task (no deal required)
app.post('/api/zadania', (req, res) => {
  try {
    const r = db.addStandaloneTask(req.body);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/transakcje/:id/zadania', (req, res) => {
  try {
    const r = db.addTask(req.params.id, req.body.tresc, req.body.przypisany_id, req.body.termin);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/zadania/:id', (req, res) => {
  try {
    const task = db.getTaskDetail(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/zadania/:id', (req, res) => {
  try { db.updateTaskFull(req.params.id, req.body); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/zadania/:id/toggle', (req, res) => {
  try { db.toggleTask(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/zadania/:id', (req, res) => {
  try { db.deleteTask(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Timer ---
app.put('/api/zadania/:id/timer/start', (req, res) => {
  try { db.startTaskTimer(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/zadania/:id/timer/stop', (req, res) => {
  try { db.stopTaskTimer(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Subtasks ---
app.post('/api/zadania/:id/podzadania', (req, res) => {
  try {
    const r = db.addSubtask(req.params.id, req.body.tresc);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/podzadania/:id/toggle', (req, res) => {
  try { db.toggleSubtask(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/podzadania/:id', (req, res) => {
  try { db.deleteSubtask(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Files ---
app.post('/api/zadania/:id/pliki', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const r = db.addTaskFile(req.params.id, req.file.filename, req.file.originalname);
    res.status(201).json({ id: r.lastInsertRowid, plik: req.file.filename });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/zadania_pliki/:id', (req, res) => {
  try {
    const file = db.getTaskFile(req.params.id);
    if (file) { try { fs.unlinkSync(path.join(UPLOADS_DIR, file.plik)); } catch(e) {} }
    db.deleteTaskFile(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Task Comments ---
app.post('/api/zadania/:id/komentarze', (req, res) => {
  try {
    const r = db.addTaskComment(req.params.id, req.body.autor_id, req.body.tresc);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/zadania_komentarze/:id', (req, res) => {
  try { db.deleteTaskComment(req.params.id); res.json({ ok: true }); }
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

// --- Deal costs (labor, transport, other) ---
app.post('/api/transakcje/:id/koszty', (req, res) => {
  try {
    const r = db.addCost({ transakcja_id: req.params.id, ...req.body });
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/koszty/:id', (req, res) => {
  try { db.deleteCost(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Deal materials: consume from stock ---
app.post('/api/transakcje/:id/zuzycie', (req, res) => {
  try {
    const r = db.consumeStock({ magazyn_id: req.body.magazyn_id, transakcja_id: req.params.id, ilosc: req.body.ilosc, notatki: req.body.notatki });
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Deal materials: purchase + add to stock for deal ---
app.post('/api/transakcje/:id/zakup', (req, res) => {
  try {
    const r = db.addPurchaseForDeal({ ...req.body, transakcja_id: req.params.id });
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Deal materials: create new stock item + purchase + consume for deal ---
app.post('/api/transakcje/:id/material-nowy', (req, res) => {
  try {
    const r = db.addAndConsumeForDeal({ ...req.body, transakcja_id: parseInt(req.params.id) });
    res.status(201).json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Purchase invoice upload ---
app.post('/api/transakcje/:id/faktura', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const r = db.addPurchaseInvoice(req.params.id, req.file.filename, req.file.originalname);
    res.status(201).json({ id: r.lastInsertRowid, plik: req.file.filename });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/zakupy_pliki/:id', (req, res) => {
  try {
    const item = db.getPurchaseInvoice(req.params.id);
    if (item) { const fp = path.join(UPLOADS_DIR, item.plik); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
    db.deletePurchaseInvoice(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- AI Invoice parsing (Claude Vision) ---
app.post('/api/faktura/:id/parse', async (req, res) => {
  try {
    const invoice = db.getPurchaseInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'ANTHROPIC_API_KEY not set in .env' });

    const filePath = path.join(UPLOADS_DIR, invoice.plik);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    const imageData = fs.readFileSync(filePath);
    const base64 = imageData.toString('base64');
    const ext = path.extname(invoice.plik).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf' };
    const mediaType = mimeMap[ext] || 'image/jpeg';

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: mediaType === 'application/pdf' ? 'document' : 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 }
            },
            {
              type: 'text',
              text: `Analyze this purchase invoice/receipt image. Extract all line items (products/materials purchased).
Return ONLY a valid JSON array of objects with these fields:
- "nazwa" (product name in original language)
- "ilosc" (quantity as number)
- "jednostka" (unit: szt/kg/l/m/m2/opak etc.)
- "cena" (price per unit as number)
- "suma" (total for this item as number)
- "kategoria" (guess category: farba/grunt/narzedzie/material/chemia/inne)

Example: [{"nazwa":"Farba Dulux 10L","ilosc":2,"jednostka":"szt","cena":189.99,"suma":379.98,"kategoria":"farba"}]
If you cannot read the invoice clearly, return an empty array [].`
            }
          ]
        }]
      })
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(500).json({ error: `AI API error: ${anthropicRes.status}`, details: errText });
    }

    const aiResult = await anthropicRes.json();
    const textContent = aiResult.content?.find(c => c.type === 'text')?.text || '[]';

    // Extract JSON from response (may be wrapped in markdown code block)
    let items = [];
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { items = JSON.parse(jsonMatch[0]); } catch(e) { items = []; }
    }

    // Save parsed items to the invoice record
    db.updatePurchaseInvoiceItems(req.params.id, items);

    res.json({ items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Add parsed invoice items to warehouse ---
app.post('/api/faktura/:id/apply', (req, res) => {
  try {
    const invoice = db.getPurchaseInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const items = req.body.items || [];
    const results = [];
    for (const item of items) {
      const r = db.addAndConsumeForDeal({
        nazwa: item.nazwa,
        kategoria: item.kategoria || 'material',
        jednostka: item.jednostka || 'szt',
        ilosc: item.ilosc || 1,
        cena_jedn: item.cena || 0,
        cena: (item.cena || 0) * (item.ilosc || 1),
        transakcja_id: invoice.transakcja_id
      });
      results.push(r);
    }
    res.json({ ok: true, count: results.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* =========================================
   TASK MODULE API (/api/tm/*)
   ========================================= */
app.get('/api/tm/bootstrap', (req, res) => {
  try { res.json(db.tmGetBootstrap()); }
  catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.put('/api/tm/tasks/bulk', (req, res) => {
  try {
    const tasks = Array.isArray(req.body) ? req.body : (req.body.tasks || []);
    res.json(db.tmSaveTasksBulk(tasks));
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.put('/api/tm/projects/bulk', (req, res) => {
  try {
    const projects = Array.isArray(req.body) ? req.body : (req.body.projects || []);
    res.json(db.tmSaveProjectsBulk(projects));
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
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
