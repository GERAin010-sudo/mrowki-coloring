/* ============================================
   MRÓWKI COLORING CRM — Database Module
   SQLite with better-sqlite3
   Weeek-style pipeline CRM
   ============================================ */

const Database = require('better-sqlite3');
const path = require('path');

/* ===== FUNNEL STAGE DEFINITIONS ===== */
const FUNNELS = {
  sprzedaz: {
    name: 'Продажи — Mrówki Coloring',
    stages: [
      { id: 'nowy_lid', name: 'Nowy lid', icon: '🆕' },
      { id: 'wyslac_oferte', name: 'Wysłać ofertę', icon: '📤' },
      { id: 'tz_zaproszone', name: 'TZ zaproszone', icon: '📋' },
      { id: 'tz_otrzymane', name: 'TZ otrzymane', icon: '📥' },
      { id: 'osmotr_nazn', name: 'Oględziny nazn.', icon: '📅' },
      { id: 'osmotr_prov', name: 'Oględziny / pomiary', icon: '📐' },
      { id: 'oferta_wyslana', name: 'Oferta wysłana', icon: '📨' },
      { id: 'torg', name: 'Negocjacje', icon: '🤝' },
      { id: 'uzgodniono', name: 'Uzgodniono → w pracę ✅', icon: '✅' },
      { id: 'przegrano', name: 'Przegrano ❌', icon: '❌' },
    ]
  },
  wykonanie: {
    name: 'Исполнение — Mrówki Coloring',
    stages: [
      { id: 'zbior', name: 'Zbiór / magazyn', icon: '📦' },
      { id: 'w_trakcie', name: 'Prace w toku', icon: '🔧' },
      { id: 'odbior', name: 'Odbiór / uwagi', icon: '🔍' },
      { id: 'akt_100', name: 'Akt 100% gotowy', icon: '📄' },
      { id: 'fv1_wyst', name: 'FV1 (70-80%) wyst.', icon: '🧾' },
      { id: 'fv1_otrz', name: 'FV1 (70-80%) otrz.', icon: '💰' },
      { id: 'fv2_wyst', name: 'FV2 (20-30%) wyst.', icon: '🧾' },
      { id: 'fv2_otrz', name: 'FV2 (20-30%) otrz.', icon: '💰' },
      { id: 'zaplacono', name: 'Zapłacono / zamkn. ✅', icon: '✅' },
    ]
  }
};

class CRMDatabase {
  constructor(dbPath = path.join(__dirname, 'crm.db')) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.init();
  }

  init() {
    this.db.exec(`
      -- Companies
      CREATE TABLE IF NOT EXISTS kompanie (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nazwa TEXT NOT NULL,
        email TEXT,
        telefon TEXT,
        adres TEXT,
        nip TEXT,
        email_faktury TEXT,
        odpowiedzialny TEXT,
        tagi TEXT,
        notatki TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Contacts (linked to company)
      CREATE TABLE IF NOT EXISTS kontakty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imie TEXT NOT NULL,
        nazwisko TEXT,
        email TEXT,
        telefon TEXT,
        kompania_id INTEGER REFERENCES kompanie(id) ON DELETE SET NULL,
        stanowisko TEXT,
        tagi TEXT,
        notatki TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Deals / Transactions (linked to company + contact)
      CREATE TABLE IF NOT EXISTS transakcje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nazwa TEXT NOT NULL,
        kwota REAL DEFAULT 0,
        waluta TEXT DEFAULT 'PLN',
        voronka TEXT NOT NULL DEFAULT 'sprzedaz',
        etap TEXT NOT NULL DEFAULT 'nowy_lid',
        kontakt_id INTEGER REFERENCES kontakty(id) ON DELETE SET NULL,
        kompania_id INTEGER REFERENCES kompanie(id) ON DELETE SET NULL,
        typ_uslugi TEXT,
        opis TEXT,
        adres_realizacji TEXT,
        priorytet TEXT DEFAULT 'normalny',
        data_rozpoczecia DATE,
        data_zakonczenia DATE,
        wynik TEXT DEFAULT 'otwarty',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tasks per deal
      CREATE TABLE IF NOT EXISTS zadania (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transakcja_id INTEGER NOT NULL REFERENCES transakcje(id) ON DELETE CASCADE,
        tresc TEXT NOT NULL,
        wykonane INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- File attachments per deal
      CREATE TABLE IF NOT EXISTS pliki (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transakcja_id INTEGER NOT NULL REFERENCES transakcje(id) ON DELETE CASCADE,
        plik TEXT NOT NULL,
        nazwa TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Action history / audit log
      CREATE TABLE IF NOT EXISTS historia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transakcja_id INTEGER REFERENCES transakcje(id) ON DELETE CASCADE,
        uzytkownik TEXT,
        akcja TEXT NOT NULL,
        opis TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Warehouse / Stock (Magazyn)
      CREATE TABLE IF NOT EXISTS magazyn (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nazwa TEXT NOT NULL,
        kategoria TEXT DEFAULT 'material',
        jednostka TEXT DEFAULT 'szt',
        ilosc REAL DEFAULT 0,
        cena_jedn REAL DEFAULT 0,
        dostawca TEXT,
        notatki TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Stock purchases (incoming)
      CREATE TABLE IF NOT EXISTS zakupy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        magazyn_id INTEGER NOT NULL REFERENCES magazyn(id) ON DELETE CASCADE,
        ilosc REAL NOT NULL,
        cena REAL DEFAULT 0,
        faktura TEXT,
        notatki TEXT,
        data_zakupu DATE DEFAULT CURRENT_DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Stock consumption per deal (outgoing)
      CREATE TABLE IF NOT EXISTS zuzycie (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        magazyn_id INTEGER NOT NULL REFERENCES magazyn(id) ON DELETE CASCADE,
        transakcja_id INTEGER REFERENCES transakcje(id) ON DELETE SET NULL,
        ilosc REAL NOT NULL,
        notatki TEXT,
        data_zuzycia DATE DEFAULT CURRENT_DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Telegram conversation state
      CREATE TABLE IF NOT EXISTS konwersacje (
        telegram_id TEXT PRIMARY KEY,
        stan TEXT,
        dane TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Portfolio / Realizacje gallery (preserved)
      CREATE TABLE IF NOT EXISTS realizacje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tytul TEXT NOT NULL,
        opis TEXT,
        kategoria TEXT DEFAULT 'inne',
        plik TEXT NOT NULL,
        kolejnosc INTEGER DEFAULT 0,
        widoczny INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Users (bot users / team)
      CREATE TABLE IF NOT EXISTS uzytkownicy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE NOT NULL,
        imie TEXT NOT NULL,
        rola TEXT DEFAULT 'pracownik',
        aktywny INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /* ===== COMPANIES ===== */
  createCompany(data) {
    const stmt = this.db.prepare(`
      INSERT INTO kompanie (nazwa, email, telefon, adres, nip, email_faktury, odpowiedzialny, tagi, notatki)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.nazwa, data.email, data.telefon, data.adres, data.nip, data.email_faktury, data.odpowiedzialny, data.tagi, data.notatki);
  }

  getCompany(id) {
    const company = this.db.prepare('SELECT * FROM kompanie WHERE id = ?').get(id);
    if (!company) return null;
    company.kontakty = this.db.prepare('SELECT * FROM kontakty WHERE kompania_id = ?').all(id);
    company.transakcje = this.db.prepare(`
      SELECT t.*, ko.imie || ' ' || COALESCE(ko.nazwisko,'') as kontakt_nazwa
      FROM transakcje t LEFT JOIN kontakty ko ON t.kontakt_id = ko.id
      WHERE t.kompania_id = ? ORDER BY t.created_at DESC
    `).all(id);
    return company;
  }

  getAllCompanies() {
    return this.db.prepare('SELECT * FROM kompanie ORDER BY nazwa ASC').all();
  }

  updateCompany(id, data) {
    const stmt = this.db.prepare(`
      UPDATE kompanie SET nazwa=?, email=?, telefon=?, adres=?, nip=?, email_faktury=?, odpowiedzialny=?, tagi=?, notatki=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);
    return stmt.run(data.nazwa, data.email, data.telefon, data.adres, data.nip, data.email_faktury, data.odpowiedzialny, data.tagi, data.notatki, id);
  }

  deleteCompany(id) {
    return this.db.prepare('DELETE FROM kompanie WHERE id = ?').run(id);
  }

  /* ===== CONTACTS ===== */
  createContact(data) {
    const stmt = this.db.prepare(`
      INSERT INTO kontakty (imie, nazwisko, email, telefon, kompania_id, stanowisko, tagi, notatki)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.imie, data.nazwisko, data.email, data.telefon, data.kompania_id || null, data.stanowisko, data.tagi, data.notatki);
  }

  getContact(id) {
    const contact = this.db.prepare(`
      SELECT k.*, ko.nazwa as kompania_nazwa
      FROM kontakty k LEFT JOIN kompanie ko ON k.kompania_id = ko.id
      WHERE k.id = ?
    `).get(id);
    if (!contact) return null;
    contact.transakcje = this.db.prepare(`
      SELECT t.* FROM transakcje t WHERE t.kontakt_id = ? ORDER BY t.created_at DESC
    `).all(id);
    return contact;
  }

  getAllContacts() {
    return this.db.prepare(`
      SELECT k.*, ko.nazwa as kompania_nazwa
      FROM kontakty k LEFT JOIN kompanie ko ON k.kompania_id = ko.id
      ORDER BY k.imie ASC
    `).all();
  }

  updateContact(id, data) {
    const stmt = this.db.prepare(`
      UPDATE kontakty SET imie=?, nazwisko=?, email=?, telefon=?, kompania_id=?, stanowisko=?, tagi=?, notatki=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);
    return stmt.run(data.imie, data.nazwisko, data.email, data.telefon, data.kompania_id || null, data.stanowisko, data.tagi, data.notatki, id);
  }

  deleteContact(id) {
    return this.db.prepare('DELETE FROM kontakty WHERE id = ?').run(id);
  }

  /* ===== DEALS / TRANSACTIONS ===== */
  createDeal(data) {
    const stmt = this.db.prepare(`
      INSERT INTO transakcje (nazwa, kwota, waluta, voronka, etap, kontakt_id, kompania_id, typ_uslugi, opis, adres_realizacji, priorytet, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.nazwa, data.kwota || 0, data.waluta || 'PLN',
      data.voronka || 'sprzedaz', data.etap || 'nowy_lid',
      data.kontakt_id || null, data.kompania_id || null,
      data.typ_uslugi, data.opis, data.adres_realizacji,
      data.priorytet || 'normalny', data.created_by
    );
    this.addHistory(result.lastInsertRowid, data.created_by, 'utworzono', `Utworzono transakcję: ${data.nazwa}`);
    return result;
  }

  getDeal(id) {
    const deal = this.db.prepare(`
      SELECT t.*,
        ko.nazwa as kompania_nazwa, ko.telefon as kompania_telefon,
        kt.imie || ' ' || COALESCE(kt.nazwisko,'') as kontakt_nazwa,
        kt.email as kontakt_email, kt.telefon as kontakt_telefon
      FROM transakcje t
      LEFT JOIN kompanie ko ON t.kompania_id = ko.id
      LEFT JOIN kontakty kt ON t.kontakt_id = kt.id
      WHERE t.id = ?
    `).get(id);
    if (!deal) return null;
    deal.zadania = this.db.prepare('SELECT * FROM zadania WHERE transakcja_id = ? ORDER BY created_at ASC').all(id);
    deal.pliki = this.db.prepare('SELECT * FROM pliki WHERE transakcja_id = ? ORDER BY created_at DESC').all(id);
    deal.historia = this.db.prepare('SELECT * FROM historia WHERE transakcja_id = ? ORDER BY created_at DESC').all(id);
    deal.zuzycie = this.db.prepare(`
      SELECT z.*, m.nazwa as material_nazwa, m.jednostka
      FROM zuzycie z JOIN magazyn m ON z.magazyn_id = m.id
      WHERE z.transakcja_id = ? ORDER BY z.created_at DESC
    `).all(id);
    return deal;
  }

  getDealsByFunnel(voronka) {
    return this.db.prepare(`
      SELECT t.*,
        ko.nazwa as kompania_nazwa,
        kt.imie || ' ' || COALESCE(kt.nazwisko,'') as kontakt_nazwa
      FROM transakcje t
      LEFT JOIN kompanie ko ON t.kompania_id = ko.id
      LEFT JOIN kontakty kt ON t.kontakt_id = kt.id
      WHERE t.voronka = ?
      ORDER BY t.updated_at DESC
    `).all(voronka);
  }

  updateDeal(id, data) {
    const stmt = this.db.prepare(`
      UPDATE transakcje SET nazwa=?, kwota=?, waluta=?, voronka=?, etap=?, kontakt_id=?, kompania_id=?,
        typ_uslugi=?, opis=?, adres_realizacji=?, priorytet=?, wynik=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);
    return stmt.run(
      data.nazwa, data.kwota, data.waluta || 'PLN', data.voronka, data.etap,
      data.kontakt_id || null, data.kompania_id || null,
      data.typ_uslugi, data.opis, data.adres_realizacji, data.priorytet || 'normalny',
      data.wynik || 'otwarty', id
    );
  }

  moveDeal(id, etap, userId) {
    const deal = this.db.prepare('SELECT * FROM transakcje WHERE id = ?').get(id);
    if (!deal) return null;
    this.db.prepare('UPDATE transakcje SET etap = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(etap, id);
    this.addHistory(id, userId, 'przeniesiono', `Etap zmieniony na: ${etap}`);
    return { success: true };
  }

  deleteDeal(id) {
    return this.db.prepare('DELETE FROM transakcje WHERE id = ?').run(id);
  }

  /* ===== TASKS ===== */
  addTask(transakcjaId, tresc) {
    return this.db.prepare('INSERT INTO zadania (transakcja_id, tresc) VALUES (?, ?)').run(transakcjaId, tresc);
  }

  toggleTask(id) {
    return this.db.prepare('UPDATE zadania SET wykonane = CASE WHEN wykonane = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
  }

  deleteTask(id) {
    return this.db.prepare('DELETE FROM zadania WHERE id = ?').run(id);
  }

  /* ===== FILES ===== */
  addFile(transakcjaId, plik, nazwa) {
    return this.db.prepare('INSERT INTO pliki (transakcja_id, plik, nazwa) VALUES (?, ?, ?)').run(transakcjaId, plik, nazwa);
  }

  deleteFile(id) {
    return this.db.prepare('DELETE FROM pliki WHERE id = ?').run(id);
  }

  /* ===== HISTORY ===== */
  addHistory(transakcjaId, uzytkownik, akcja, opis) {
    return this.db.prepare('INSERT INTO historia (transakcja_id, uzytkownik, akcja, opis) VALUES (?, ?, ?, ?)').run(transakcjaId, uzytkownik, akcja, opis);
  }

  /* ===== WAREHOUSE / STOCK ===== */
  createStockItem(data) {
    const stmt = this.db.prepare(`
      INSERT INTO magazyn (nazwa, kategoria, jednostka, ilosc, cena_jedn, dostawca, notatki)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.nazwa, data.kategoria || 'material', data.jednostka || 'szt', data.ilosc || 0, data.cena_jedn || 0, data.dostawca, data.notatki);
  }

  getAllStock() {
    return this.db.prepare('SELECT * FROM magazyn ORDER BY kategoria, nazwa ASC').all();
  }

  getStockItem(id) {
    const item = this.db.prepare('SELECT * FROM magazyn WHERE id = ?').get(id);
    if (!item) return null;
    item.zakupy = this.db.prepare('SELECT * FROM zakupy WHERE magazyn_id = ? ORDER BY data_zakupu DESC').all(id);
    item.zuzycie = this.db.prepare(`
      SELECT z.*, t.nazwa as transakcja_nazwa
      FROM zuzycie z LEFT JOIN transakcje t ON z.transakcja_id = t.id
      WHERE z.magazyn_id = ? ORDER BY z.data_zuzycia DESC
    `).all(id);
    return item;
  }

  updateStockItem(id, data) {
    const stmt = this.db.prepare('UPDATE magazyn SET nazwa=?, kategoria=?, jednostka=?, cena_jedn=?, dostawca=?, notatki=?, updated_at=CURRENT_TIMESTAMP WHERE id=?');
    return stmt.run(data.nazwa, data.kategoria, data.jednostka, data.cena_jedn, data.dostawca, data.notatki, id);
  }

  deleteStockItem(id) {
    return this.db.prepare('DELETE FROM magazyn WHERE id = ?').run(id);
  }

  // Purchase (add stock)
  addPurchase(data) {
    const stmt = this.db.prepare('INSERT INTO zakupy (magazyn_id, ilosc, cena, faktura, notatki, data_zakupu) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(data.magazyn_id, data.ilosc, data.cena || 0, data.faktura, data.notatki, data.data_zakupu || new Date().toISOString().split('T')[0]);
    // Update stock quantity
    this.db.prepare('UPDATE magazyn SET ilosc = ilosc + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(data.ilosc, data.magazyn_id);
    return result;
  }

  // Consume stock (deduct for a deal)
  consumeStock(data) {
    const stmt = this.db.prepare('INSERT INTO zuzycie (magazyn_id, transakcja_id, ilosc, notatki, data_zuzycia) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(data.magazyn_id, data.transakcja_id || null, data.ilosc, data.notatki, data.data_zuzycia || new Date().toISOString().split('T')[0]);
    // Deduct stock quantity
    this.db.prepare('UPDATE magazyn SET ilosc = ilosc - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(data.ilosc, data.magazyn_id);
    return result;
  }

  /* ===== REALIZACJE (Portfolio) — PRESERVED ===== */
  createRealizacja(data) {
    const maxOrder = this.db.prepare('SELECT COALESCE(MAX(kolejnosc), 0) as mx FROM realizacje').get().mx;
    const stmt = this.db.prepare('INSERT INTO realizacje (tytul, opis, kategoria, plik, kolejnosc) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(data.tytul, data.opis || '', data.kategoria || 'inne', data.plik, maxOrder + 1);
  }

  getAllRealizacje() {
    return this.db.prepare('SELECT * FROM realizacje WHERE widoczny = 1 ORDER BY kolejnosc ASC, created_at DESC').all();
  }

  getAllRealizacjeAdmin() {
    return this.db.prepare('SELECT * FROM realizacje ORDER BY kolejnosc ASC, created_at DESC').all();
  }

  updateRealizacja(id, data) {
    return this.db.prepare('UPDATE realizacje SET tytul=?, opis=?, kategoria=?, widoczny=? WHERE id=?')
      .run(data.tytul, data.opis, data.kategoria, data.widoczny ? 1 : 0, id);
  }

  deleteRealizacja(id) {
    return this.db.prepare('DELETE FROM realizacje WHERE id = ?').run(id);
  }

  /* ===== CONVERSATION STATE ===== */
  getConversation(telegramId) {
    const row = this.db.prepare('SELECT * FROM konwersacje WHERE telegram_id = ?').get(String(telegramId));
    if (row && row.dane) { try { row.dane = JSON.parse(row.dane); } catch(e) { row.dane = {}; } }
    return row;
  }

  setConversation(telegramId, stan, dane = {}) {
    return this.db.prepare('INSERT OR REPLACE INTO konwersacje (telegram_id, stan, dane, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
      .run(String(telegramId), stan, JSON.stringify(dane));
  }

  clearConversation(telegramId) {
    return this.db.prepare('DELETE FROM konwersacje WHERE telegram_id = ?').run(String(telegramId));
  }

  /* ===== USERS ===== */
  getUser(telegramId) {
    return this.db.prepare('SELECT * FROM uzytkownicy WHERE telegram_id = ?').get(String(telegramId));
  }

  createUser(telegramId, imie, rola = 'pracownik') {
    return this.db.prepare('INSERT OR IGNORE INTO uzytkownicy (telegram_id, imie, rola) VALUES (?, ?, ?)').run(String(telegramId), imie, rola);
  }

  /* ===== STATS ===== */
  getStats() {
    const totalDeals = this.db.prepare('SELECT COUNT(*) as cnt FROM transakcje').get().cnt;
    const salesDeals = this.db.prepare("SELECT COUNT(*) as cnt FROM transakcje WHERE voronka = 'sprzedaz'").get().cnt;
    const execDeals = this.db.prepare("SELECT COUNT(*) as cnt FROM transakcje WHERE voronka = 'wykonanie'").get().cnt;
    const totalCompanies = this.db.prepare('SELECT COUNT(*) as cnt FROM kompanie').get().cnt;
    const totalContacts = this.db.prepare('SELECT COUNT(*) as cnt FROM kontakty').get().cnt;
    const totalPhotos = this.db.prepare('SELECT COUNT(*) as cnt FROM realizacje').get().cnt;
    const totalRevenue = this.db.prepare("SELECT COALESCE(SUM(kwota), 0) as total FROM transakcje WHERE wynik = 'wygrano'").get().total;
    const salesSum = this.db.prepare("SELECT COALESCE(SUM(kwota), 0) as total FROM transakcje WHERE voronka = 'sprzedaz'").get().total;
    const execSum = this.db.prepare("SELECT COALESCE(SUM(kwota), 0) as total FROM transakcje WHERE voronka = 'wykonanie'").get().total;
    const stockItems = this.db.prepare('SELECT COUNT(*) as cnt FROM magazyn').get().cnt;
    const stockValue = this.db.prepare('SELECT COALESCE(SUM(ilosc * cena_jedn), 0) as total FROM magazyn').get().total;

    return { totalDeals, salesDeals, execDeals, totalCompanies, totalContacts, totalPhotos, totalRevenue, salesSum, execSum, stockItems, stockValue };
  }

  close() {
    this.db.close();
  }
}

module.exports = CRMDatabase;
module.exports.FUNNELS = FUNNELS;
