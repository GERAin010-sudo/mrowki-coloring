/* ============================================
   MRÓWKI COLORING CRM — Database Module
   SQLite with better-sqlite3
   ============================================ */

const Database = require('better-sqlite3');
const path = require('path');

class CRMDatabase {
  constructor(dbPath = path.join(__dirname, 'crm.db')) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.init();
  }

  init() {
    this.db.exec(`
      -- Users (bot users / team members)
      CREATE TABLE IF NOT EXISTS uzytkownicy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE NOT NULL,
        imie TEXT NOT NULL,
        rola TEXT DEFAULT 'pracownik' CHECK(rola IN ('admin', 'pracownik')),
        aktywny INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Clients
      CREATE TABLE IF NOT EXISTS klienci (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nazwa TEXT NOT NULL,
        typ TEXT CHECK(typ IN ('deweloper', 'wykonawca', 'producent', 'architekt', 'montazysta', 'administrator', 'inny')),
        osoba_kontaktowa TEXT,
        telefon TEXT,
        email TEXT,
        adres TEXT,
        notatki TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Orders / Jobs
      CREATE TABLE IF NOT EXISTS zlecenia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        klient_id INTEGER REFERENCES klienci(id),
        numer TEXT UNIQUE,
        typ_uslugi TEXT CHECK(typ_uslugi IN ('okna', 'drzwi', 'fasady', 'bramy_windy', 'parapety', 'poprawki', 'inne')),
        opis TEXT,
        adres_realizacji TEXT,
        status TEXT DEFAULT 'nowe' CHECK(status IN ('nowe', 'wycena', 'zaakceptowane', 'w_trakcie', 'zakonczone', 'anulowane')),
        priorytet TEXT DEFAULT 'normalny' CHECK(priorytet IN ('niski', 'normalny', 'wysoki', 'pilny')),
        data_rozpoczecia DATE,
        data_zakonczenia DATE,
        kwota REAL,
        waluta TEXT DEFAULT 'PLN',
        notatki TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Action history / audit log
      CREATE TABLE IF NOT EXISTS historia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zlecenie_id INTEGER REFERENCES zlecenia(id),
        klient_id INTEGER REFERENCES klienci(id),
        uzytkownik TEXT,
        akcja TEXT NOT NULL,
        opis TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Telegram conversation state (for multi-step commands)
      CREATE TABLE IF NOT EXISTS konwersacje (
        telegram_id TEXT PRIMARY KEY,
        stan TEXT,
        dane TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /* ===== USERS ===== */
  getUser(telegramId) {
    return this.db.prepare('SELECT * FROM uzytkownicy WHERE telegram_id = ?').get(String(telegramId));
  }

  createUser(telegramId, imie, rola = 'pracownik') {
    const stmt = this.db.prepare('INSERT OR IGNORE INTO uzytkownicy (telegram_id, imie, rola) VALUES (?, ?, ?)');
    return stmt.run(String(telegramId), imie, rola);
  }

  getAllUsers() {
    return this.db.prepare('SELECT * FROM uzytkownicy WHERE aktywny = 1').all();
  }

  /* ===== CLIENTS ===== */
  createClient(data) {
    const stmt = this.db.prepare(`
      INSERT INTO klienci (nazwa, typ, osoba_kontaktowa, telefon, email, adres, notatki)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.nazwa, data.typ, data.osoba_kontaktowa, data.telefon, data.email, data.adres, data.notatki);
    this.addHistory(null, result.lastInsertRowid, data.created_by, 'dodano_klienta', `Dodano klienta: ${data.nazwa}`);
    return result;
  }

  getClient(id) {
    return this.db.prepare('SELECT * FROM klienci WHERE id = ?').get(id);
  }

  getAllClients() {
    return this.db.prepare('SELECT * FROM klienci ORDER BY created_at DESC').all();
  }

  searchClients(query) {
    return this.db.prepare('SELECT * FROM klienci WHERE nazwa LIKE ? OR telefon LIKE ? OR email LIKE ?')
      .all(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  updateClient(id, data) {
    const stmt = this.db.prepare(`
      UPDATE klienci SET nazwa=?, typ=?, osoba_kontaktowa=?, telefon=?, email=?, adres=?, notatki=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);
    return stmt.run(data.nazwa, data.typ, data.osoba_kontaktowa, data.telefon, data.email, data.adres, data.notatki, id);
  }

  /* ===== ORDERS ===== */
  generateOrderNumber() {
    const year = new Date().getFullYear();
    const count = this.db.prepare("SELECT COUNT(*) as cnt FROM zlecenia WHERE numer LIKE ?").get(`MC-${year}-%`);
    const num = (count.cnt + 1).toString().padStart(4, '0');
    return `MC-${year}-${num}`;
  }

  createOrder(data) {
    const numer = this.generateOrderNumber();
    const stmt = this.db.prepare(`
      INSERT INTO zlecenia (klient_id, numer, typ_uslugi, opis, adres_realizacji, status, priorytet, kwota, notatki, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.klient_id, numer, data.typ_uslugi, data.opis, 
      data.adres_realizacji, data.status || 'nowe', data.priorytet || 'normalny',
      data.kwota, data.notatki, data.created_by
    );
    this.addHistory(result.lastInsertRowid, data.klient_id, data.created_by, 'nowe_zlecenie', `Utworzono zlecenie ${numer}`);
    return { ...result, numer };
  }

  getOrder(id) {
    return this.db.prepare(`
      SELECT z.*, k.nazwa as klient_nazwa, k.telefon as klient_telefon 
      FROM zlecenia z LEFT JOIN klienci k ON z.klient_id = k.id 
      WHERE z.id = ?
    `).get(id);
  }

  getOrderByNumber(numer) {
    return this.db.prepare(`
      SELECT z.*, k.nazwa as klient_nazwa, k.telefon as klient_telefon 
      FROM zlecenia z LEFT JOIN klienci k ON z.klient_id = k.id 
      WHERE z.numer = ?
    `).get(numer);
  }

  getActiveOrders() {
    return this.db.prepare(`
      SELECT z.*, k.nazwa as klient_nazwa 
      FROM zlecenia z LEFT JOIN klienci k ON z.klient_id = k.id 
      WHERE z.status NOT IN ('zakonczone', 'anulowane')
      ORDER BY 
        CASE z.priorytet WHEN 'pilny' THEN 1 WHEN 'wysoki' THEN 2 WHEN 'normalny' THEN 3 ELSE 4 END,
        z.created_at DESC
    `).all();
  }

  getAllOrders(limit = 50) {
    return this.db.prepare(`
      SELECT z.*, k.nazwa as klient_nazwa 
      FROM zlecenia z LEFT JOIN klienci k ON z.klient_id = k.id 
      ORDER BY z.created_at DESC LIMIT ?
    `).all(limit);
  }

  getOrdersByClient(klientId) {
    return this.db.prepare(`
      SELECT * FROM zlecenia WHERE klient_id = ? ORDER BY created_at DESC
    `).all(klientId);
  }

  updateOrderStatus(id, newStatus, userId) {
    const order = this.getOrder(id);
    if (!order) return null;

    const stmt = this.db.prepare('UPDATE zlecenia SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(newStatus, id);

    const statusLabels = {
      nowe: 'Nowe', wycena: 'Wycena', zaakceptowane: 'Zaakceptowane',
      w_trakcie: 'W trakcie', zakonczone: 'Zakończone', anulowane: 'Anulowane'
    };
    this.addHistory(id, order.klient_id, userId, 'zmiana_statusu', 
      `Status zmieniony na: ${statusLabels[newStatus] || newStatus}`);
    return result;
  }

  updateOrder(id, data) {
    const stmt = this.db.prepare(`
      UPDATE zlecenia SET typ_uslugi=?, opis=?, adres_realizacji=?, priorytet=?, kwota=?, notatki=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);
    return stmt.run(data.typ_uslugi, data.opis, data.adres_realizacji, data.priorytet, data.kwota, data.notatki, id);
  }

  /* ===== HISTORY ===== */
  addHistory(zlecenieId, klientId, uzytkownik, akcja, opis) {
    const stmt = this.db.prepare('INSERT INTO historia (zlecenie_id, klient_id, uzytkownik, akcja, opis) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(zlecenieId, klientId, uzytkownik, akcja, opis);
  }

  getOrderHistory(zlecenieId) {
    return this.db.prepare('SELECT * FROM historia WHERE zlecenie_id = ? ORDER BY created_at DESC').all(zlecenieId);
  }

  /* ===== CONVERSATION STATE ===== */
  getConversation(telegramId) {
    const row = this.db.prepare('SELECT * FROM konwersacje WHERE telegram_id = ?').get(String(telegramId));
    if (row && row.dane) {
      try { row.dane = JSON.parse(row.dane); } catch(e) { row.dane = {}; }
    }
    return row;
  }

  setConversation(telegramId, stan, dane = {}) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO konwersacje (telegram_id, stan, dane, updated_at) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(String(telegramId), stan, JSON.stringify(dane));
  }

  clearConversation(telegramId) {
    return this.db.prepare('DELETE FROM konwersacje WHERE telegram_id = ?').run(String(telegramId));
  }

  /* ===== REPORTS ===== */
  getStats() {
    const totalOrders = this.db.prepare('SELECT COUNT(*) as cnt FROM zlecenia').get().cnt;
    const activeOrders = this.db.prepare("SELECT COUNT(*) as cnt FROM zlecenia WHERE status NOT IN ('zakonczone', 'anulowane')").get().cnt;
    const completedOrders = this.db.prepare("SELECT COUNT(*) as cnt FROM zlecenia WHERE status = 'zakonczone'").get().cnt;
    const totalClients = this.db.prepare('SELECT COUNT(*) as cnt FROM klienci').get().cnt;
    const totalRevenue = this.db.prepare("SELECT COALESCE(SUM(kwota), 0) as total FROM zlecenia WHERE status = 'zakonczone'").get().total;
    
    const byStatus = this.db.prepare("SELECT status, COUNT(*) as cnt FROM zlecenia GROUP BY status").all();
    const byType = this.db.prepare("SELECT typ_uslugi, COUNT(*) as cnt FROM zlecenia GROUP BY typ_uslugi").all();

    return { totalOrders, activeOrders, completedOrders, totalClients, totalRevenue, byStatus, byType };
  }

  close() {
    this.db.close();
  }
}

module.exports = CRMDatabase;
