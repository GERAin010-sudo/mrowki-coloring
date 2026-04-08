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
    name: { pl: 'Sprzedaż — Mrówki Coloring', ua: 'Продажі — Mrówki Coloring', ru: 'Продажи — Mrówki Coloring' },
    stages: [
      { id: 'nowy_lid', name: { pl: 'Nowy lid', ua: 'Новий лід', ru: 'Новый лид' }, icon: '🆕' },
      { id: 'wyslac_oferte', name: { pl: 'Wysłać ofertę', ua: 'Надіслати пропозицію', ru: 'Отправить предложение' }, icon: '📤' },
      { id: 'tz_zaproszone', name: { pl: 'TZ zaproszone', ua: 'ТЗ запрошено', ru: 'ТЗ запрошено' }, icon: '📋' },
      { id: 'tz_otrzymane', name: { pl: 'TZ otrzymane', ua: 'ТЗ отримано', ru: 'ТЗ получено' }, icon: '📥' },
      { id: 'osmotr_nazn', name: { pl: 'Oględziny nazn.', ua: 'Огляд признач.', ru: 'Осмотр назнач.' }, icon: '📅' },
      { id: 'osmotr_prov', name: { pl: 'Oględziny / pomiary', ua: 'Огляд / заміри', ru: 'Осмотр / замеры' }, icon: '📐' },
      { id: 'oferta_wyslana', name: { pl: 'Oferta wysłana', ua: 'Пропозицію надіслано', ru: 'Предложение отправлено' }, icon: '📨' },
      { id: 'torg', name: { pl: 'Negocjacje', ua: 'Переговори', ru: 'Переговоры' }, icon: '🤝' },
      { id: 'uzgodniono', name: { pl: 'Uzgodniono → w pracę', ua: 'Узгоджено → в роботу', ru: 'Согласовано → в работу' }, icon: '✅' },
      { id: 'przegrano', name: { pl: 'Przegrano', ua: 'Програно', ru: 'Проиграно' }, icon: '❌' },
    ]
  },
  wykonanie: {
    name: { pl: 'Wykonanie — Mrówki Coloring', ua: 'Виконання — Mrówki Coloring', ru: 'Исполнение — Mrówki Coloring' },
    stages: [
      { id: 'przedplata', name: { pl: 'Przedpłata', ua: 'Передоплата', ru: 'Предоплата' }, icon: '💳' },
      { id: 'zbior', name: { pl: 'Zbiór / magazyn', ua: 'Збір / склад', ru: 'Сбор / склад' }, icon: '📦' },
      { id: 'w_trakcie', name: { pl: 'Prace w toku', ua: 'Роботи в процесі', ru: 'Работы в процессе' }, icon: '🔧' },
      { id: 'odbior', name: { pl: 'Odbiór / uwagi', ua: 'Приймання / зауваження', ru: 'Приёмка / замечания' }, icon: '🔍' },
      { id: 'akt_100', name: { pl: 'Akt 100% gotowy', ua: 'Акт 100% готовий', ru: 'Акт 100% готов' }, icon: '📄' },
      { id: 'fv_wyst', name: { pl: 'Faktura wystawiona', ua: 'Фактуру виставлено', ru: 'Счёт выставлен' }, icon: '🧾' },
      { id: 'fv_otrz', name: { pl: 'Faktura opłacona', ua: 'Фактуру сплачено', ru: 'Счёт оплачен' }, icon: '💰' },
      { id: 'zaplacono', name: { pl: 'Zapłacono / zamkn.', ua: 'Сплачено / закр.', ru: 'Оплачено / закр.' }, icon: '✅' },
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
        lat REAL,
        lng REAL,
        priorytet TEXT DEFAULT 'normalny',
        data_rozpoczecia DATE,
        data_zakonczenia DATE,
        schemat_platnosci TEXT DEFAULT '100',
        przedplata_wymagana INTEGER DEFAULT 0,
        przedplata_kwota REAL DEFAULT 0,
        przedplata_fv_data TEXT,
        przedplata_oplacona_data TEXT,
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
        opis TEXT,
        wykonane INTEGER DEFAULT 0,
        przypisany_id INTEGER REFERENCES uzytkownicy(id) ON DELETE SET NULL,
        termin DATE,
        adres TEXT,
        lat REAL,
        lng REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Subtasks per task
      CREATE TABLE IF NOT EXISTS podzadania (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zadanie_id INTEGER NOT NULL REFERENCES zadania(id) ON DELETE CASCADE,
        tresc TEXT NOT NULL,
        wykonane INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- File attachments per task
      CREATE TABLE IF NOT EXISTS zadania_pliki (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zadanie_id INTEGER NOT NULL REFERENCES zadania(id) ON DELETE CASCADE,
        plik TEXT NOT NULL,
        nazwa TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Comments per task
      CREATE TABLE IF NOT EXISTS zadania_komentarze (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zadanie_id INTEGER NOT NULL REFERENCES zadania(id) ON DELETE CASCADE,
        autor_id INTEGER REFERENCES uzytkownicy(id),
        tresc TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Task history / audit log
      CREATE TABLE IF NOT EXISTS zadania_historia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zadanie_id INTEGER NOT NULL REFERENCES zadania(id) ON DELETE CASCADE,
        akcja TEXT NOT NULL,
        opis TEXT,
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

      -- Deal costs (labor, transport, other)
      CREATE TABLE IF NOT EXISTS koszty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transakcja_id INTEGER NOT NULL REFERENCES transakcje(id) ON DELETE CASCADE,
        typ TEXT NOT NULL DEFAULT 'praca',
        opis TEXT NOT NULL,
        kwota REAL NOT NULL DEFAULT 0,
        wykonawca_id INTEGER REFERENCES uzytkownicy(id) ON DELETE SET NULL,
        data_kosztu DATE DEFAULT CURRENT_DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Purchase invoice files
      CREATE TABLE IF NOT EXISTS zakupy_pliki (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transakcja_id INTEGER REFERENCES transakcje(id) ON DELETE CASCADE,
        plik TEXT NOT NULL,
        nazwa TEXT,
        pozycje TEXT,
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
        rola TEXT DEFAULT 'wykonawca',
        kolor TEXT DEFAULT '#4A8EFF',
        aktywny INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrations
    const migrations = [
      `ALTER TABLE transakcje ADD COLUMN schemat_platnosci TEXT DEFAULT '100'`,
      `ALTER TABLE transakcje ADD COLUMN lat REAL`,
      `ALTER TABLE transakcje ADD COLUMN lng REAL`,
      `ALTER TABLE transakcje ADD COLUMN przedplata_wymagana INTEGER DEFAULT 0`,
      `ALTER TABLE transakcje ADD COLUMN przedplata_kwota REAL DEFAULT 0`,
      `ALTER TABLE transakcje ADD COLUMN przedplata_fv_data TEXT`,
      `ALTER TABLE transakcje ADD COLUMN przedplata_oplacona_data TEXT`,
      `ALTER TABLE zadania ADD COLUMN przypisany_id INTEGER REFERENCES uzytkownicy(id) ON DELETE SET NULL`,
      `ALTER TABLE zadania ADD COLUMN termin DATE`,
      `ALTER TABLE uzytkownicy ADD COLUMN kolor TEXT DEFAULT '#4A8EFF'`,
      `ALTER TABLE zadania ADD COLUMN opis TEXT`,
      `ALTER TABLE zadania ADD COLUMN adres TEXT`,
      `ALTER TABLE zadania ADD COLUMN lat REAL`,
      `ALTER TABLE zadania ADD COLUMN lng REAL`,
      `ALTER TABLE zadania ADD COLUMN priorytet TEXT DEFAULT 'normalny'`,
      `ALTER TABLE zadania ADD COLUMN tagi TEXT`,
      `ALTER TABLE zadania ADD COLUMN czas_szacowany REAL`,
      `ALTER TABLE zadania ADD COLUMN czas_spedzony REAL DEFAULT 0`,
      `ALTER TABLE zadania ADD COLUMN timer_start TEXT`,
      `ALTER TABLE zakupy ADD COLUMN transakcja_id INTEGER REFERENCES transakcje(id) ON DELETE SET NULL`,
      `ALTER TABLE zakupy ADD COLUMN dostawca TEXT`,
    ];
    for (const sql of migrations) {
      try { this.db.exec(sql); } catch(e) { /* column already exists */ }
    }

    // Migrate old 'pracownik' role to 'wykonawca'
    this.db.prepare("UPDATE uzytkownicy SET rola = 'wykonawca' WHERE rola = 'pracownik'").run();

    // Fix FK: rebuild zadania table to reference uzytkownicy instead of zespol
    try {
      const hasOldFK = this.db.prepare("SELECT sql FROM sqlite_master WHERE name='zadania'").get();
      if (hasOldFK && hasOldFK.sql && hasOldFK.sql.includes('zespol')) {
        this.db.exec(`
          CREATE TABLE zadania_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transakcja_id INTEGER NOT NULL REFERENCES transakcje(id) ON DELETE CASCADE,
            tresc TEXT NOT NULL,
            wykonane INTEGER DEFAULT 0,
            przypisany_id INTEGER REFERENCES uzytkownicy(id) ON DELETE SET NULL,
            termin DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          INSERT INTO zadania_new SELECT id, transakcja_id, tresc, wykonane, przypisany_id, termin, created_at FROM zadania;
          DROP TABLE zadania;
          ALTER TABLE zadania_new RENAME TO zadania;
        `);
      }
    } catch(e) { console.warn('zadania FK migration:', e.message); }
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
      INSERT INTO transakcje (nazwa, kwota, waluta, voronka, etap, kontakt_id, kompania_id, typ_uslugi, opis, adres_realizacji, lat, lng, priorytet, schemat_platnosci, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.nazwa, data.kwota || 0, data.waluta || 'PLN',
      data.voronka || 'sprzedaz', data.etap || 'nowy_lid',
      data.kontakt_id || null, data.kompania_id || null,
      data.typ_uslugi, data.opis, data.adres_realizacji,
      data.lat || null, data.lng || null,
      data.priorytet || 'normalny', data.schemat_platnosci || '100', data.created_by
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
    deal.zadania = this.db.prepare('SELECT z.*, zs.imie as przypisany_imie, zs.kolor as przypisany_kolor FROM zadania z LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id WHERE z.transakcja_id = ? ORDER BY z.wykonane ASC, z.termin IS NULL, z.termin ASC, z.created_at ASC').all(id);
    deal.pliki = this.db.prepare('SELECT * FROM pliki WHERE transakcja_id = ? ORDER BY created_at DESC').all(id);
    deal.historia = this.db.prepare('SELECT * FROM historia WHERE transakcja_id = ? ORDER BY created_at DESC').all(id);
    deal.zuzycie = this.db.prepare(`
      SELECT z.*, m.nazwa as material_nazwa, m.jednostka
      FROM zuzycie z JOIN magazyn m ON z.magazyn_id = m.id
      WHERE z.transakcja_id = ? ORDER BY z.created_at DESC
    `).all(id);
    deal.koszty = this.db.prepare(`
      SELECT k.*, u.imie as wykonawca_imie, u.kolor as wykonawca_kolor
      FROM koszty k LEFT JOIN uzytkownicy u ON k.wykonawca_id = u.id
      WHERE k.transakcja_id = ? ORDER BY k.data_kosztu DESC
    `).all(id);
    deal.zakupy_pliki = this.db.prepare('SELECT * FROM zakupy_pliki WHERE transakcja_id = ? ORDER BY created_at DESC').all(id);
    deal.zakupy_deal = this.db.prepare(`
      SELECT zk.*, m.nazwa as material_nazwa, m.jednostka
      FROM zakupy zk JOIN magazyn m ON zk.magazyn_id = m.id
      WHERE zk.transakcja_id = ? ORDER BY zk.created_at DESC
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
        typ_uslugi=?, opis=?, adres_realizacji=?, lat=?, lng=?, priorytet=?, schemat_platnosci=?, wynik=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);
    return stmt.run(
      data.nazwa, data.kwota, data.waluta || 'PLN', data.voronka, data.etap,
      data.kontakt_id || null, data.kompania_id || null,
      data.typ_uslugi, data.opis, data.adres_realizacji, data.lat || null, data.lng || null,
      data.priorytet || 'normalny', data.schemat_platnosci || '100', data.wynik || 'otwarty', id
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

  /* ===== TEAM (from bot users) ===== */
  getTeam() {
    return this.db.prepare('SELECT * FROM uzytkownicy WHERE aktywny = 1 ORDER BY imie').all();
  }
  getAllUsers() {
    return this.db.prepare('SELECT * FROM uzytkownicy ORDER BY imie').all();
  }
  getUserById(id) {
    return this.db.prepare('SELECT * FROM uzytkownicy WHERE id = ?').get(id);
  }
  updateMemberColor(id, kolor) {
    return this.db.prepare('UPDATE uzytkownicy SET kolor = ? WHERE id = ?').run(kolor, id);
  }
  updateMemberRole(id, rola) {
    return this.db.prepare('UPDATE uzytkownicy SET rola = ? WHERE id = ?').run(rola, id);
  }

  /* ===== ROLE-BASED DATA ACCESS ===== */
  // Get deal IDs where user is involved (tasks assigned, costs, or deal creator)
  getUserDealIds(userId) {
    const fromTasks = this.db.prepare('SELECT DISTINCT transakcja_id FROM zadania WHERE przypisany_id = ?').all(userId).map(r => r.transakcja_id);
    const fromCosts = this.db.prepare('SELECT DISTINCT transakcja_id FROM koszty WHERE wykonawca_id = ?').all(userId).map(r => r.transakcja_id);
    return [...new Set([...fromTasks, ...fromCosts])];
  }

  getDealsByFunnelFiltered(voronka, userId) {
    const dealIds = this.getUserDealIds(userId);
    if (!dealIds.length) return [];
    return this.db.prepare(`
      SELECT t.*, ko.nazwa as kompania_nazwa, kt.imie || ' ' || COALESCE(kt.nazwisko,'') as kontakt_nazwa
      FROM transakcje t
      LEFT JOIN kompanie ko ON t.kompania_id = ko.id
      LEFT JOIN kontakty kt ON t.kontakt_id = kt.id
      WHERE t.voronka = ? AND t.id IN (${dealIds.join(',')})
      ORDER BY t.updated_at DESC
    `).all(voronka);
  }

  getAllTasksFiltered(filter, userId) {
    let sql = `SELECT z.*, t.nazwa as deal_nazwa, t.voronka, t.etap, zs.imie as przypisany_imie, zs.kolor as przypisany_kolor
      FROM zadania z
      JOIN transakcje t ON z.transakcja_id = t.id
      LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id
      WHERE z.przypisany_id = ?`;
    const params = [userId];
    if (filter?.status === 'open') { sql += ' AND z.wykonane = 0'; }
    if (filter?.status === 'done') { sql += ' AND z.wykonane = 1'; }
    sql += ' ORDER BY z.wykonane ASC, z.termin IS NULL, z.termin ASC, z.created_at DESC';
    return this.db.prepare(sql).all(...params);
  }

  getStatsFiltered(userId) {
    const dealIds = this.getUserDealIds(userId);
    if (!dealIds.length) return { deals: 0, revenue: 0, tasks: 0, overdue: 0 };
    const idList = dealIds.join(',');
    const deals = this.db.prepare(`SELECT COUNT(*) as cnt FROM transakcje WHERE id IN (${idList})`).get().cnt;
    const revenue = this.db.prepare(`SELECT COALESCE(SUM(kwota),0) as total FROM transakcje WHERE id IN (${idList})`).get().total;
    const tasks = this.db.prepare(`SELECT COUNT(*) as cnt FROM zadania WHERE przypisany_id = ? AND wykonane = 0`).get(userId).cnt;
    const today = new Date().toISOString().split('T')[0];
    const overdue = this.db.prepare(`SELECT COUNT(*) as cnt FROM zadania WHERE przypisany_id = ? AND wykonane = 0 AND termin < ?`).get(userId, today).cnt;
    return { deals, revenue, tasks, overdue };
  }

  /* ===== TASKS ===== */
  addTask(transakcjaId, tresc, przypisanyId, termin) {
    return this.db.prepare('INSERT INTO zadania (transakcja_id, tresc, przypisany_id, termin) VALUES (?, ?, ?, ?)').run(transakcjaId, tresc, przypisanyId || null, termin || null);
  }

  getTaskDetail(id) {
    const task = this.db.prepare(`SELECT z.*, t.nazwa as deal_nazwa, t.id as deal_id, t.voronka, zs.imie as przypisany_imie, zs.kolor as przypisany_kolor
      FROM zadania z JOIN transakcje t ON z.transakcja_id = t.id
      LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id WHERE z.id = ?`).get(id);
    if (!task) return null;
    task.podzadania = this.db.prepare('SELECT * FROM podzadania WHERE zadanie_id = ? ORDER BY created_at ASC').all(id);
    task.pliki = this.db.prepare('SELECT * FROM zadania_pliki WHERE zadanie_id = ? ORDER BY created_at DESC').all(id);
    task.komentarze = this.db.prepare(`SELECT k.*, u.imie as autor_imie, u.kolor as autor_kolor
      FROM zadania_komentarze k LEFT JOIN uzytkownicy u ON k.autor_id = u.id
      WHERE k.zadanie_id = ? ORDER BY k.created_at ASC`).all(id);
    task.historia = this.db.prepare('SELECT * FROM zadania_historia WHERE zadanie_id = ? ORDER BY created_at DESC LIMIT 20').all(id);
    return task;
  }

  updateTaskFull(id, data) {
    return this.db.prepare(`UPDATE zadania SET tresc=?, opis=?, przypisany_id=?, termin=?, adres=?, lat=?, lng=?,
      priorytet=?, tagi=?, czas_szacowany=? WHERE id=?`)
      .run(data.tresc, data.opis || null, data.przypisany_id || null, data.termin || null,
        data.adres || null, data.lat || null, data.lng || null,
        data.priorytet || 'normalny', data.tagi || null, data.czas_szacowany || null, id);
  }

  addTaskHistory(zadanieId, opis) {
    this.db.prepare('INSERT INTO zadania_historia (zadanie_id, akcja, opis) VALUES (?, ?, ?)').run(zadanieId, 'zmiana', opis);
  }

  startTaskTimer(id) {
    this.db.prepare('UPDATE zadania SET timer_start = ? WHERE id = ?').run(new Date().toISOString(), id);
  }
  stopTaskTimer(id) {
    const task = this.db.prepare('SELECT timer_start, czas_spedzony FROM zadania WHERE id = ?').get(id);
    if (!task?.timer_start) return;
    const elapsed = (Date.now() - new Date(task.timer_start).getTime()) / 3600000; // hours
    this.db.prepare('UPDATE zadania SET czas_spedzony = ?, timer_start = NULL WHERE id = ?').run((task.czas_spedzony || 0) + elapsed, id);
  }

  toggleTask(id) {
    return this.db.prepare('UPDATE zadania SET wykonane = CASE WHEN wykonane = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
  }

  /* ===== SUBTASKS ===== */
  addSubtask(zadanieId, tresc) {
    return this.db.prepare('INSERT INTO podzadania (zadanie_id, tresc) VALUES (?, ?)').run(zadanieId, tresc);
  }
  toggleSubtask(id) {
    return this.db.prepare('UPDATE podzadania SET wykonane = CASE WHEN wykonane = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
  }
  deleteSubtask(id) {
    return this.db.prepare('DELETE FROM podzadania WHERE id = ?').run(id);
  }

  /* ===== TASK FILES ===== */
  addTaskFile(zadanieId, plik, nazwa) {
    return this.db.prepare('INSERT INTO zadania_pliki (zadanie_id, plik, nazwa) VALUES (?, ?, ?)').run(zadanieId, plik, nazwa);
  }
  getTaskFile(id) {
    return this.db.prepare('SELECT * FROM zadania_pliki WHERE id = ?').get(id);
  }
  deleteTaskFile(id) {
    return this.db.prepare('DELETE FROM zadania_pliki WHERE id = ?').run(id);
  }

  /* ===== TASK COMMENTS ===== */
  addTaskComment(zadanieId, autorId, tresc) {
    return this.db.prepare('INSERT INTO zadania_komentarze (zadanie_id, autor_id, tresc) VALUES (?, ?, ?)').run(zadanieId, autorId || null, tresc);
  }
  deleteTaskComment(id) {
    return this.db.prepare('DELETE FROM zadania_komentarze WHERE id = ?').run(id);
  }

  deleteTask(id) {
    return this.db.prepare('DELETE FROM zadania WHERE id = ?').run(id);
  }

  getAllTasks(filter) {
    let sql = `SELECT z.*, t.nazwa as deal_nazwa, t.voronka, t.etap, zs.imie as przypisany_imie, zs.kolor as przypisany_kolor
      FROM zadania z
      JOIN transakcje t ON z.transakcja_id = t.id
      LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id
      WHERE 1=1`;
    const params = [];
    if (filter?.assignee) { sql += ' AND z.przypisany_id = ?'; params.push(filter.assignee); }
    if (filter?.status === 'open') { sql += ' AND z.wykonane = 0'; }
    if (filter?.status === 'done') { sql += ' AND z.wykonane = 1'; }
    sql += ' ORDER BY z.wykonane ASC, z.termin IS NULL, z.termin ASC, z.created_at DESC';
    return this.db.prepare(sql).all(...params);
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
    item.zakupy = this.db.prepare(`
      SELECT zk.*, t.nazwa as transakcja_nazwa
      FROM zakupy zk LEFT JOIN transakcje t ON zk.transakcja_id = t.id
      WHERE zk.magazyn_id = ? ORDER BY zk.data_zakupu DESC
    `).all(id);
    item.zuzycie = this.db.prepare(`
      SELECT z.*, t.nazwa as transakcja_nazwa
      FROM zuzycie z LEFT JOIN transakcje t ON z.transakcja_id = t.id
      WHERE z.magazyn_id = ? ORDER BY z.data_zuzycia DESC
    `).all(id);
    // Totals
    item.total_purchased = item.zakupy.reduce((s, z) => s + z.ilosc, 0);
    item.total_spent = item.zakupy.reduce((s, z) => s + (z.cena || 0), 0);
    item.total_consumed = item.zuzycie.reduce((s, z) => s + z.ilosc, 0);
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
    const stmt = this.db.prepare('INSERT INTO zakupy (magazyn_id, ilosc, cena, faktura, notatki, data_zakupu, dostawca, transakcja_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(data.magazyn_id, data.ilosc, data.cena || 0, data.faktura, data.notatki, data.data_zakupu || new Date().toISOString().split('T')[0], data.dostawca || null, data.transakcja_id || null);
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

  /* ===== DEAL COSTS ===== */
  addCost(data) {
    return this.db.prepare('INSERT INTO koszty (transakcja_id, typ, opis, kwota, wykonawca_id, data_kosztu) VALUES (?, ?, ?, ?, ?, ?)')
      .run(data.transakcja_id, data.typ || 'praca', data.opis, data.kwota || 0, data.wykonawca_id || null, data.data_kosztu || new Date().toISOString().split('T')[0]);
  }
  deleteCost(id) {
    return this.db.prepare('DELETE FROM koszty WHERE id = ?').run(id);
  }

  /* ===== PURCHASE INVOICES (per deal) ===== */
  addPurchaseInvoice(transakcjaId, plik, nazwa) {
    return this.db.prepare('INSERT INTO zakupy_pliki (transakcja_id, plik, nazwa) VALUES (?, ?, ?)').run(transakcjaId, plik, nazwa);
  }
  updatePurchaseInvoiceItems(id, pozycje) {
    return this.db.prepare('UPDATE zakupy_pliki SET pozycje = ? WHERE id = ?').run(JSON.stringify(pozycje), id);
  }
  getPurchaseInvoice(id) {
    return this.db.prepare('SELECT * FROM zakupy_pliki WHERE id = ?').get(id);
  }
  deletePurchaseInvoice(id) {
    return this.db.prepare('DELETE FROM zakupy_pliki WHERE id = ?').run(id);
  }

  // Purchase linked to a deal (adds to stock + records deal link)
  addPurchaseForDeal(data) {
    const stmt = this.db.prepare('INSERT INTO zakupy (magazyn_id, ilosc, cena, faktura, notatki, data_zakupu, transakcja_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(data.magazyn_id, data.ilosc, data.cena || 0, data.faktura, data.notatki, data.data_zakupu || new Date().toISOString().split('T')[0], data.transakcja_id || null);
    this.db.prepare('UPDATE magazyn SET ilosc = ilosc + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(data.ilosc, data.magazyn_id);
    return result;
  }

  // Create stock item + immediately consume for deal
  addAndConsumeForDeal(data) {
    // Create new stock item
    const createResult = this.db.prepare('INSERT INTO magazyn (nazwa, kategoria, jednostka, ilosc, cena_jedn) VALUES (?, ?, ?, 0, ?)').run(
      data.nazwa, data.kategoria || 'material', data.jednostka || 'szt', data.cena_jedn || 0
    );
    const magazynId = createResult.lastInsertRowid;
    // Add purchase
    this.db.prepare('INSERT INTO zakupy (magazyn_id, ilosc, cena, transakcja_id, data_zakupu) VALUES (?, ?, ?, ?, ?)').run(
      magazynId, data.ilosc, data.cena || 0, data.transakcja_id, new Date().toISOString().split('T')[0]
    );
    this.db.prepare('UPDATE magazyn SET ilosc = ilosc + ? WHERE id = ?').run(data.ilosc, magazynId);
    // Consume for deal
    this.db.prepare('INSERT INTO zuzycie (magazyn_id, transakcja_id, ilosc, data_zuzycia) VALUES (?, ?, ?, ?)').run(
      magazynId, data.transakcja_id, data.ilosc, new Date().toISOString().split('T')[0]
    );
    this.db.prepare('UPDATE magazyn SET ilosc = ilosc - ? WHERE id = ?').run(data.ilosc, magazynId);
    return { magazyn_id: magazynId };
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

  createUser(telegramId, imie, rola = 'wykonawca') {
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
