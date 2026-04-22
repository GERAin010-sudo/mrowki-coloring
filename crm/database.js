/* ============================================
   MRÓWKI COLORING CRM — Database Module
   SQLite with better-sqlite3
   Weeek-style pipeline CRM
   ============================================ */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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
  constructor(dbPath = process.env.DB_PATH || path.join(__dirname, 'crm.db')) {
    // Ensure directory exists (for volume-mounted paths)
    const dir = path.dirname(dbPath);
    try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch(e) {}
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

      -- Task statuses (colored)
      CREATE TABLE IF NOT EXISTS task_statusy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nazwa TEXT NOT NULL,
        kolor TEXT NOT NULL DEFAULT '#999999',
        ikona TEXT DEFAULT '',
        kolejnosc INTEGER DEFAULT 0,
        domyslny INTEGER DEFAULT 0
      );

      -- Task categories
      CREATE TABLE IF NOT EXISTS task_kategorie (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nazwa TEXT NOT NULL,
        kolor TEXT NOT NULL DEFAULT '#999999',
        ikona TEXT DEFAULT '',
        kolejnosc INTEGER DEFAULT 0
      );

      -- Task templates
      CREATE TABLE IF NOT EXISTS task_szablony (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nazwa TEXT NOT NULL,
        opis TEXT,
        kategoria_id INTEGER REFERENCES task_kategorie(id) ON DELETE SET NULL,
        priorytet TEXT DEFAULT 'normalny',
        podzadania_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tasks (transakcja_id nullable = standalone tasks)
      CREATE TABLE IF NOT EXISTS zadania (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transakcja_id INTEGER REFERENCES transakcje(id) ON DELETE CASCADE,
        tresc TEXT NOT NULL,
        opis TEXT,
        wykonane INTEGER DEFAULT 0,
        status_id INTEGER REFERENCES task_statusy(id) ON DELETE SET NULL,
        kategoria_id INTEGER REFERENCES task_kategorie(id) ON DELETE SET NULL,
        przypisany_id INTEGER REFERENCES uzytkownicy(id) ON DELETE SET NULL,
        termin DATE,
        adres TEXT,
        lat REAL,
        lng REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Task multiple assignees (pivot)
      CREATE TABLE IF NOT EXISTS task_przypisani (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zadanie_id INTEGER NOT NULL REFERENCES zadania(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES uzytkownicy(id) ON DELETE CASCADE,
        UNIQUE(zadanie_id, user_id)
      );

      -- Task relations
      CREATE TABLE IF NOT EXISTS task_relacje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zadanie_id INTEGER NOT NULL REFERENCES zadania(id) ON DELETE CASCADE,
        powiazane_id INTEGER NOT NULL REFERENCES zadania(id) ON DELETE CASCADE,
        typ TEXT NOT NULL DEFAULT 'related',
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
        login TEXT UNIQUE,
        password_hash TEXT,
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Sessions (cookie-based auth)
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES uzytkownicy(id) ON DELETE CASCADE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

      -- ===== TASK MODULE (tm_*) =====
      CREATE TABLE IF NOT EXISTS tm_users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        role TEXT,
        avatar TEXT,
        color TEXT,
        access_level TEXT DEFAULT 'employee'
      );

      CREATE TABLE IF NOT EXISTS tm_departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT
      );

      CREATE TABLE IF NOT EXISTS tm_department_members (
        dept_id TEXT NOT NULL REFERENCES tm_departments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        PRIMARY KEY (dept_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS tm_projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        type TEXT,
        color TEXT,
        creator_id INTEGER,
        coordinator_id INTEGER,
        contractor_name TEXT,
        contractor_id INTEGER,
        archived_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tm_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'new',
        priority TEXT DEFAULT 'medium',
        category TEXT,
        assignee_id INTEGER,
        assignee_type TEXT DEFAULT 'single',
        creator_id INTEGER,
        project_id TEXT,
        deadline TEXT,
        linked_entity_json TEXT,
        reminder_minutes INTEGER DEFAULT 0,
        reminder_channels TEXT,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tm_task_assignees (
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        PRIMARY KEY (task_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS tm_task_departments (
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        dept_id TEXT NOT NULL,
        PRIMARY KEY (task_id, dept_id)
      );

      CREATE TABLE IF NOT EXISTS tm_task_watchers (
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        PRIMARY KEY (task_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS tm_task_subtasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        done INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tm_task_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        user_id INTEGER,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tm_task_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT,
        size TEXT,
        url TEXT,
        added_by INTEGER,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tm_task_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        title TEXT,
        url TEXT NOT NULL,
        added_by INTEGER,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tm_task_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        name TEXT,
        phone TEXT,
        email TEXT,
        role TEXT
      );

      CREATE TABLE IF NOT EXISTS tm_task_tags (
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        tag TEXT NOT NULL,
        PRIMARY KEY (task_id, tag)
      );

      CREATE TABLE IF NOT EXISTS tm_task_relations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        target_id INTEGER NOT NULL,
        type TEXT NOT NULL DEFAULT 'related'
      );

      CREATE TABLE IF NOT EXISTS tm_task_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        field TEXT,
        old_value TEXT,
        new_value TEXT,
        user_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tm_task_time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tm_tasks(id) ON DELETE CASCADE,
        user_id INTEGER,
        minutes INTEGER DEFAULT 0,
        description TEXT,
        date DATE
      );

      CREATE TABLE IF NOT EXISTS tm_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        tasks_json TEXT
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
      `ALTER TABLE uzytkownicy ADD COLUMN login TEXT`,
      `ALTER TABLE uzytkownicy ADD COLUMN password_hash TEXT`,
      `ALTER TABLE uzytkownicy ADD COLUMN last_login_at DATETIME`,
      `ALTER TABLE uzytkownicy ADD COLUMN avatar TEXT`,
      `ALTER TABLE uzytkownicy ADD COLUMN jezyk TEXT DEFAULT 'pl'`,
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
      `ALTER TABLE realizacje ADD COLUMN transakcja_id INTEGER REFERENCES transakcje(id) ON DELETE SET NULL`,
      `ALTER TABLE uzytkownicy ADD COLUMN jezyk TEXT DEFAULT 'pl'`,
      // Task system migrations
      `ALTER TABLE zadania ADD COLUMN status_id INTEGER REFERENCES task_statusy(id) ON DELETE SET NULL`,
      `ALTER TABLE zadania ADD COLUMN kategoria_id INTEGER REFERENCES task_kategorie(id) ON DELETE SET NULL`,
    ];
    for (const sql of migrations) {
      try { this.db.exec(sql); } catch(e) { /* column already exists */ }
    }

    // Migrate old 'pracownik' role to 'wykonawca'
    this.db.prepare("UPDATE uzytkownicy SET rola = 'wykonawca' WHERE rola = 'pracownik'").run();

    // Make transakcja_id nullable (rebuild if NOT NULL)
    try {
      const schema = this.db.prepare("SELECT sql FROM sqlite_master WHERE name='zadania'").get();
      if (schema && schema.sql && schema.sql.includes('transakcja_id INTEGER NOT NULL')) {
        const cols = 'id, transakcja_id, tresc, opis, wykonane, status_id, kategoria_id, przypisany_id, termin, adres, lat, lng, priorytet, tagi, czas_szacowany, czas_spedzony, timer_start, created_at';
        this.db.exec(`
          CREATE TABLE zadania_nullable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transakcja_id INTEGER REFERENCES transakcje(id) ON DELETE CASCADE,
            tresc TEXT NOT NULL, opis TEXT, wykonane INTEGER DEFAULT 0,
            status_id INTEGER REFERENCES task_statusy(id) ON DELETE SET NULL,
            kategoria_id INTEGER REFERENCES task_kategorie(id) ON DELETE SET NULL,
            przypisany_id INTEGER REFERENCES uzytkownicy(id) ON DELETE SET NULL,
            termin DATE, adres TEXT, lat REAL, lng REAL,
            priorytet TEXT DEFAULT 'normalny', tagi TEXT,
            czas_szacowany REAL, czas_spedzony REAL DEFAULT 0, timer_start TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          INSERT INTO zadania_nullable (${cols}) SELECT ${cols} FROM zadania;
          DROP TABLE zadania;
          ALTER TABLE zadania_nullable RENAME TO zadania;
        `);
      }
    } catch(e) { console.warn('zadania nullable migration:', e.message); }

    // Seed default task statuses
    const statusCount = this.db.prepare('SELECT COUNT(*) as cnt FROM task_statusy').get().cnt;
    if (statusCount === 0) {
      const statuses = [
        { nazwa: 'Nowe', kolor: '#4A90D9', ikona: '🆕', kolejnosc: 1, domyslny: 1 },
        { nazwa: 'W trakcie', kolor: '#F5A623', ikona: '🔧', kolejnosc: 2, domyslny: 0 },
        { nazwa: 'Przegląd', kolor: '#9B59B6', ikona: '🔍', kolejnosc: 3, domyslny: 0 },
        { nazwa: 'Gotowe', kolor: '#27AE60', ikona: '✅', kolejnosc: 4, domyslny: 0 },
        { nazwa: 'Wstrzymane', kolor: '#95A5A6', ikona: '⏸', kolejnosc: 5, domyslny: 0 },
      ];
      const ins = this.db.prepare('INSERT INTO task_statusy (nazwa, kolor, ikona, kolejnosc, domyslny) VALUES (?, ?, ?, ?, ?)');
      for (const s of statuses) ins.run(s.nazwa, s.kolor, s.ikona, s.kolejnosc, s.domyslny);
    }

    // Seed default task categories
    const catCount = this.db.prepare('SELECT COUNT(*) as cnt FROM task_kategorie').get().cnt;
    if (catCount === 0) {
      const cats = [
        { nazwa: 'Malowanie', kolor: '#E74C3C', ikona: '🎨', kolejnosc: 1 },
        { nazwa: 'Przygotowanie', kolor: '#3498DB', ikona: '🔨', kolejnosc: 2 },
        { nazwa: 'Transport', kolor: '#F39C12', ikona: '🚚', kolejnosc: 3 },
        { nazwa: 'Zakupy', kolor: '#2ECC71', ikona: '🛒', kolejnosc: 4 },
        { nazwa: 'Dokumenty', kolor: '#9B59B6', ikona: '📄', kolejnosc: 5 },
        { nazwa: 'Spotkanie', kolor: '#1ABC9C', ikona: '🤝', kolejnosc: 6 },
        { nazwa: 'Inne', kolor: '#95A5A6', ikona: '📌', kolejnosc: 7 },
      ];
      const ins = this.db.prepare('INSERT INTO task_kategorie (nazwa, kolor, ikona, kolejnosc) VALUES (?, ?, ?, ?)');
      for (const c of cats) ins.run(c.nazwa, c.kolor, c.ikona, c.kolejnosc);
    }

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

    // Seed task module data on first run
    try { this.tmSeedIfEmpty(); } catch(e) { console.warn('tm seed:', e.message); }
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
    deal.zadania = this.db.prepare(`SELECT z.*, zs.imie as przypisany_imie, zs.kolor as przypisany_kolor,
      ts.nazwa as status_nazwa, ts.kolor as status_kolor, ts.ikona as status_ikona,
      tk.nazwa as kategoria_nazwa, tk.kolor as kategoria_kolor
      FROM zadania z LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id
      LEFT JOIN task_statusy ts ON z.status_id = ts.id
      LEFT JOIN task_kategorie tk ON z.kategoria_id = tk.id
      WHERE z.transakcja_id = ? ORDER BY z.wykonane ASC, z.termin IS NULL, z.termin ASC, z.created_at ASC`).all(id);
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
    let sql = `SELECT z.*, t.nazwa as deal_nazwa, t.voronka, t.etap,
      zs.imie as przypisany_imie, zs.kolor as przypisany_kolor,
      ts.nazwa as status_nazwa, ts.kolor as status_kolor, ts.ikona as status_ikona,
      tk.nazwa as kategoria_nazwa, tk.kolor as kategoria_kolor, tk.ikona as kategoria_ikona
      FROM zadania z
      LEFT JOIN transakcje t ON z.transakcja_id = t.id
      LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id
      LEFT JOIN task_statusy ts ON z.status_id = ts.id
      LEFT JOIN task_kategorie tk ON z.kategoria_id = tk.id
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

  /* ===== TASK STATUSES ===== */
  getTaskStatuses() {
    return this.db.prepare('SELECT * FROM task_statusy ORDER BY kolejnosc ASC').all();
  }
  createTaskStatus(data) {
    return this.db.prepare('INSERT INTO task_statusy (nazwa, kolor, ikona, kolejnosc) VALUES (?, ?, ?, ?)').run(data.nazwa, data.kolor || '#999', data.ikona || '', data.kolejnosc || 0);
  }
  updateTaskStatus(id, data) {
    return this.db.prepare('UPDATE task_statusy SET nazwa=?, kolor=?, ikona=?, kolejnosc=? WHERE id=?').run(data.nazwa, data.kolor, data.ikona || '', data.kolejnosc || 0, id);
  }
  deleteTaskStatus(id) {
    this.db.prepare('UPDATE zadania SET status_id = NULL WHERE status_id = ?').run(id);
    return this.db.prepare('DELETE FROM task_statusy WHERE id = ?').run(id);
  }

  /* ===== TASK CATEGORIES ===== */
  getTaskCategories() {
    return this.db.prepare('SELECT * FROM task_kategorie ORDER BY kolejnosc ASC').all();
  }
  createTaskCategory(data) {
    return this.db.prepare('INSERT INTO task_kategorie (nazwa, kolor, ikona, kolejnosc) VALUES (?, ?, ?, ?)').run(data.nazwa, data.kolor || '#999', data.ikona || '', data.kolejnosc || 0);
  }
  updateTaskCategory(id, data) {
    return this.db.prepare('UPDATE task_kategorie SET nazwa=?, kolor=?, ikona=?, kolejnosc=? WHERE id=?').run(data.nazwa, data.kolor, data.ikona || '', data.kolejnosc || 0, id);
  }
  deleteTaskCategory(id) {
    this.db.prepare('UPDATE zadania SET kategoria_id = NULL WHERE kategoria_id = ?').run(id);
    return this.db.prepare('DELETE FROM task_kategorie WHERE id = ?').run(id);
  }

  /* ===== TASK TEMPLATES ===== */
  getTaskTemplates() {
    return this.db.prepare('SELECT s.*, k.nazwa as kategoria_nazwa, k.kolor as kategoria_kolor FROM task_szablony s LEFT JOIN task_kategorie k ON s.kategoria_id = k.id ORDER BY s.nazwa ASC').all();
  }
  createTaskTemplate(data) {
    return this.db.prepare('INSERT INTO task_szablony (nazwa, opis, kategoria_id, priorytet, podzadania_json) VALUES (?, ?, ?, ?, ?)').run(
      data.nazwa, data.opis || null, data.kategoria_id || null, data.priorytet || 'normalny', data.podzadania_json || '[]');
  }
  updateTaskTemplate(id, data) {
    return this.db.prepare('UPDATE task_szablony SET nazwa=?, opis=?, kategoria_id=?, priorytet=?, podzadania_json=? WHERE id=?').run(
      data.nazwa, data.opis || null, data.kategoria_id || null, data.priorytet || 'normalny', data.podzadania_json || '[]', id);
  }
  deleteTaskTemplate(id) {
    return this.db.prepare('DELETE FROM task_szablony WHERE id = ?').run(id);
  }
  createTaskFromTemplate(templateId, transakcjaId, przypisanyId) {
    const tmpl = this.db.prepare('SELECT * FROM task_szablony WHERE id = ?').get(templateId);
    if (!tmpl) return null;
    const defaultStatus = this.db.prepare('SELECT id FROM task_statusy WHERE domyslny = 1').get();
    const result = this.db.prepare('INSERT INTO zadania (transakcja_id, tresc, opis, status_id, kategoria_id, priorytet, przypisany_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      transakcjaId || null, tmpl.nazwa, tmpl.opis || null, defaultStatus?.id || null, tmpl.kategoria_id || null, tmpl.priorytet || 'normalny', przypisanyId || null);
    try {
      const subs = JSON.parse(tmpl.podzadania_json || '[]');
      const subIns = this.db.prepare('INSERT INTO podzadania (zadanie_id, tresc) VALUES (?, ?)');
      for (const s of subs) subIns.run(result.lastInsertRowid, s);
    } catch(e) {}
    return result;
  }

  /* ===== TASK RELATIONS ===== */
  getTaskRelations(zadanieId) {
    return this.db.prepare(`
      SELECT r.*, z.tresc as powiazane_tresc, z.wykonane as powiazane_wykonane
      FROM task_relacje r JOIN zadania z ON r.powiazane_id = z.id
      WHERE r.zadanie_id = ?
      UNION ALL
      SELECT r.id, r.powiazane_id as zadanie_id, r.zadanie_id as powiazane_id,
        CASE r.typ WHEN 'blocks' THEN 'blocked_by' WHEN 'blocked_by' THEN 'blocks' ELSE r.typ END as typ,
        r.created_at, z.tresc as powiazane_tresc, z.wykonane as powiazane_wykonane
      FROM task_relacje r JOIN zadania z ON r.zadanie_id = z.id
      WHERE r.powiazane_id = ?
    `).all(zadanieId, zadanieId);
  }
  addTaskRelation(zadanieId, powiazaneId, typ) {
    return this.db.prepare('INSERT INTO task_relacje (zadanie_id, powiazane_id, typ) VALUES (?, ?, ?)').run(zadanieId, powiazaneId, typ || 'related');
  }
  deleteTaskRelation(id) {
    return this.db.prepare('DELETE FROM task_relacje WHERE id = ?').run(id);
  }

  /* ===== TASK ASSIGNEES (multiple) ===== */
  getTaskAssignees(zadanieId) {
    return this.db.prepare('SELECT tp.*, u.imie, u.kolor FROM task_przypisani tp JOIN uzytkownicy u ON tp.user_id = u.id WHERE tp.zadanie_id = ?').all(zadanieId);
  }
  addTaskAssignee(zadanieId, userId) {
    try { return this.db.prepare('INSERT INTO task_przypisani (zadanie_id, user_id) VALUES (?, ?)').run(zadanieId, userId); }
    catch(e) { return null; }
  }
  removeTaskAssignee(zadanieId, userId) {
    return this.db.prepare('DELETE FROM task_przypisani WHERE zadanie_id = ? AND user_id = ?').run(zadanieId, userId);
  }

  /* ===== TASKS ===== */
  addTask(transakcjaId, tresc, przypisanyId, termin) {
    const defaultStatus = this.db.prepare('SELECT id FROM task_statusy WHERE domyslny = 1').get();
    return this.db.prepare('INSERT INTO zadania (transakcja_id, tresc, przypisany_id, termin, status_id) VALUES (?, ?, ?, ?, ?)').run(transakcjaId || null, tresc, przypisanyId || null, termin || null, defaultStatus?.id || null);
  }

  addStandaloneTask(data) {
    const defaultStatus = this.db.prepare('SELECT id FROM task_statusy WHERE domyslny = 1').get();
    const result = this.db.prepare('INSERT INTO zadania (transakcja_id, tresc, opis, status_id, kategoria_id, priorytet, przypisany_id, termin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      data.transakcja_id || null, data.tresc, data.opis || null,
      data.status_id || defaultStatus?.id || null, data.kategoria_id || null,
      data.priorytet || 'normalny', data.przypisany_id || null, data.termin || null);
    if (data.assignee_ids?.length) {
      const ins = this.db.prepare('INSERT OR IGNORE INTO task_przypisani (zadanie_id, user_id) VALUES (?, ?)');
      for (const uid of data.assignee_ids) ins.run(result.lastInsertRowid, uid);
    }
    return result;
  }

  getTaskDetail(id) {
    const task = this.db.prepare(`SELECT z.*,
      t.nazwa as deal_nazwa, t.id as deal_id, t.voronka,
      zs.imie as przypisany_imie, zs.kolor as przypisany_kolor,
      ts.nazwa as status_nazwa, ts.kolor as status_kolor, ts.ikona as status_ikona,
      tk.nazwa as kategoria_nazwa, tk.kolor as kategoria_kolor, tk.ikona as kategoria_ikona
      FROM zadania z
      LEFT JOIN transakcje t ON z.transakcja_id = t.id
      LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id
      LEFT JOIN task_statusy ts ON z.status_id = ts.id
      LEFT JOIN task_kategorie tk ON z.kategoria_id = tk.id
      WHERE z.id = ?`).get(id);
    if (!task) return null;
    task.podzadania = this.db.prepare('SELECT * FROM podzadania WHERE zadanie_id = ? ORDER BY created_at ASC').all(id);
    task.pliki = this.db.prepare('SELECT * FROM zadania_pliki WHERE zadanie_id = ? ORDER BY created_at DESC').all(id);
    task.komentarze = this.db.prepare(`SELECT k.*, u.imie as autor_imie, u.kolor as autor_kolor
      FROM zadania_komentarze k LEFT JOIN uzytkownicy u ON k.autor_id = u.id
      WHERE k.zadanie_id = ? ORDER BY k.created_at ASC`).all(id);
    task.historia = this.db.prepare('SELECT * FROM zadania_historia WHERE zadanie_id = ? ORDER BY created_at DESC LIMIT 20').all(id);
    task.przypisani = this.getTaskAssignees(id);
    task.relacje = this.getTaskRelations(id);
    return task;
  }

  updateTaskFull(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['tresc','opis','przypisany_id','termin','adres','lat','lng','priorytet','tagi','czas_szacowany','status_id','kategoria_id','transakcja_id'];
    for (const key of allowed) {
      if (key in data) { fields.push(`${key}=?`); values.push(data[key] || null); }
    }
    if (fields.length === 0) return;
    values.push(id);
    return this.db.prepare(`UPDATE zadania SET ${fields.join(', ')} WHERE id=?`).run(...values);
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
    let sql = `SELECT z.*, t.nazwa as deal_nazwa, t.voronka, t.etap,
      zs.imie as przypisany_imie, zs.kolor as przypisany_kolor,
      ts.nazwa as status_nazwa, ts.kolor as status_kolor, ts.ikona as status_ikona,
      tk.nazwa as kategoria_nazwa, tk.kolor as kategoria_kolor, tk.ikona as kategoria_ikona
      FROM zadania z
      LEFT JOIN transakcje t ON z.transakcja_id = t.id
      LEFT JOIN uzytkownicy zs ON z.przypisany_id = zs.id
      LEFT JOIN task_statusy ts ON z.status_id = ts.id
      LEFT JOIN task_kategorie tk ON z.kategoria_id = tk.id
      WHERE 1=1`;
    const params = [];
    if (filter?.assignee) { sql += ' AND z.przypisany_id = ?'; params.push(filter.assignee); }
    if (filter?.status === 'open') { sql += ' AND z.wykonane = 0'; }
    if (filter?.status === 'done') { sql += ' AND z.wykonane = 1'; }
    if (filter?.status_id) { sql += ' AND z.status_id = ?'; params.push(filter.status_id); }
    if (filter?.kategoria_id) { sql += ' AND z.kategoria_id = ?'; params.push(filter.kategoria_id); }
    if (filter?.standalone) { sql += ' AND z.transakcja_id IS NULL'; }
    sql += ' ORDER BY z.wykonane ASC, z.termin IS NULL, z.termin ASC, z.created_at DESC';
    return this.db.prepare(sql).all(...params);
  }

  searchTasks(query) {
    return this.db.prepare('SELECT z.id, z.tresc, z.wykonane FROM zadania z WHERE z.tresc LIKE ? ORDER BY z.created_at DESC LIMIT 20').all(`%${query}%`);
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

  /* ========== TASK MODULE (tm_*) ========== */

  tmSeedIfEmpty() {
    const hasUsers = this.db.prepare('SELECT COUNT(*) as c FROM tm_users').get().c;
    if (hasUsers > 0) return false;
    const fs = require('fs');
    const path = require('path');
    const seedPath = path.join(__dirname, 'tm_seed.json');
    if (!fs.existsSync(seedPath)) return false;
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    const insUser = this.db.prepare('INSERT INTO tm_users (id, name, email, role, avatar, color, access_level) VALUES (?,?,?,?,?,?,?)');
    seed.users.forEach(u => insUser.run(u.id, u.name, u.email, u.role, u.avatar, u.color, u.accessLevel));

    const insDept = this.db.prepare('INSERT INTO tm_departments (id, name, color) VALUES (?,?,?)');
    const insDeptM = this.db.prepare('INSERT INTO tm_department_members (dept_id, user_id) VALUES (?,?)');
    seed.departments.forEach(d => {
      insDept.run(d.id, d.name, d.color);
      (d.memberIds || []).forEach(uid => insDeptM.run(d.id, uid));
    });

    const insProj = this.db.prepare(`INSERT INTO tm_projects (id, name, description, status, type, color, creator_id, coordinator_id, contractor_name, contractor_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    seed.projects.forEach(p => insProj.run(p.id, p.name, p.description, p.status, p.type, p.color, p.creatorId, p.coordinatorId, p.contractorName, p.contractorId, p.createdAt));

    const insTpl = this.db.prepare('INSERT INTO tm_templates (id, name, description, icon, color, tasks_json) VALUES (?,?,?,?,?,?)');
    seed.templates.forEach(t => insTpl.run(t.id, t.name, t.description, t.icon, t.color, JSON.stringify(t.tasks || [])));

    const insTask = this.db.prepare(`INSERT INTO tm_tasks (id, title, description, status, priority, category, assignee_id, assignee_type, creator_id, project_id, deadline, linked_entity_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const insAsg = this.db.prepare('INSERT INTO tm_task_assignees (task_id, user_id) VALUES (?,?)');
    const insDep = this.db.prepare('INSERT OR IGNORE INTO tm_task_departments (task_id, dept_id) VALUES (?,?)');
    const insW = this.db.prepare('INSERT OR IGNORE INTO tm_task_watchers (task_id, user_id) VALUES (?,?)');
    const insSub = this.db.prepare('INSERT INTO tm_task_subtasks (task_id, text, done, position) VALUES (?,?,?,?)');
    const insCm = this.db.prepare('INSERT INTO tm_task_comments (task_id, user_id, text, created_at) VALUES (?,?,?,?)');
    const insAtt = this.db.prepare('INSERT INTO tm_task_attachments (task_id, name, type, size, added_by, added_at) VALUES (?,?,?,?,?,?)');
    const insLnk = this.db.prepare('INSERT INTO tm_task_links (task_id, title, url, added_by) VALUES (?,?,?,?)');
    const insCt = this.db.prepare('INSERT INTO tm_task_contacts (task_id, name, phone, email, role) VALUES (?,?,?,?,?)');
    const insTag = this.db.prepare('INSERT OR IGNORE INTO tm_task_tags (task_id, tag) VALUES (?,?)');
    const insRel = this.db.prepare('INSERT INTO tm_task_relations (task_id, target_id, type) VALUES (?,?,?)');
    const insHist = this.db.prepare('INSERT INTO tm_task_history (task_id, field, old_value, new_value, user_id, timestamp) VALUES (?,?,?,?,?,?)');
    const insTE = this.db.prepare('INSERT INTO tm_task_time_entries (task_id, user_id, minutes, description, date) VALUES (?,?,?,?,?)');

    seed.tasks.forEach(t => {
      insTask.run(t.id, t.title, t.description, t.status, t.priority, t.category, t.assigneeId || null, t.assigneeType || 'single', t.creatorId, t.projectId, t.deadline, JSON.stringify(t.linkedEntity || null), t.createdAt, t.updatedAt);
      (t.assigneeIds || []).forEach(uid => insAsg.run(t.id, uid));
      (t.departmentIds || []).forEach(did => insDep.run(t.id, did));
      (t.watcherIds || []).forEach(uid => insW.run(t.id, uid));
      (t.subtasks || []).forEach((s, i) => insSub.run(t.id, s.text, s.done ? 1 : 0, i));
      (t.comments || []).forEach(c => insCm.run(t.id, c.userId, c.text, c.createdAt));
      (t.attachments || []).forEach(a => insAtt.run(t.id, a.name, a.type, a.size, a.addedBy, a.addedAt));
      (t.links || []).forEach(l => insLnk.run(t.id, l.title, l.url, l.addedBy));
      (t.contacts || []).forEach(c => insCt.run(t.id, c.name, c.phone, c.email, c.role));
      (t.tags || []).forEach(tag => insTag.run(t.id, tag));
      (t.relations || []).forEach(r => insRel.run(t.id, r.taskId, r.type));
      (t.history || []).forEach(h => insHist.run(t.id, h.field, h.oldValue, h.newValue, h.userId, h.timestamp));
      (t.timeEntries || []).forEach(e => insTE.run(t.id, e.userId, e.minutes, e.description, e.date));
    });

    console.log(`✅ tm_* seeded: ${seed.users.length} users, ${seed.departments.length} depts, ${seed.projects.length} projects, ${seed.tasks.length} tasks, ${seed.templates.length} templates`);
    return true;
  }

  tmGetBootstrap() {
    // Read users directly from uzytkownicy (always fresh — color, avatar, name)
    const rawUsers = this.db.prepare('SELECT id, imie, rola, kolor, avatar FROM uzytkownicy WHERE aktywny=1').all();
    const accessFromRola = r => r === 'admin' ? 'director' : r === 'wlasciciel' ? 'manager' : 'employee';
    const users = rawUsers.map(u => {
      const isImage = u.avatar && /^(\/uploads\/|https?:\/\/)/.test(u.avatar);
      return {
        id: u.id,
        name: u.imie,
        email: null,
        role: u.rola,
        avatar: isImage ? null : (u.avatar || (u.imie || '?').substring(0, 2).toUpperCase()),
        avatarUrl: isImage ? u.avatar : null,
        color: u.kolor || '#4A8EFF',
        accessLevel: accessFromRola(u.rola),
      };
    });
    const departments = this.db.prepare('SELECT * FROM tm_departments').all().map(d => ({
      ...d,
      memberIds: this.db.prepare('SELECT user_id FROM tm_department_members WHERE dept_id = ?').all(d.id).map(r => r.user_id)
    }));
    const projects = this.db.prepare('SELECT * FROM tm_projects').all().map(p => ({
      id: p.id, name: p.name, description: p.description, status: p.status, type: p.type, color: p.color,
      creatorId: p.creator_id, coordinatorId: p.coordinator_id, contractorName: p.contractor_name, contractorId: p.contractor_id,
      createdAt: p.created_at, archivedAt: p.archived_at
    }));
    const templates = this.db.prepare('SELECT * FROM tm_templates').all().map(t => ({
      id: t.id, name: t.name, description: t.description, icon: t.icon, color: t.color,
      tasks: JSON.parse(t.tasks_json || '[]')
    }));
    const tasks = this.db.prepare('SELECT * FROM tm_tasks').all().map(t => this._tmHydrateTask(t));
    return { users, departments, projects, tasks, templates };
  }

  _tmHydrateTask(row) {
    const id = row.id;
    return {
      id, title: row.title, description: row.description, status: row.status, priority: row.priority,
      category: row.category, assigneeId: row.assignee_id, assigneeType: row.assignee_type,
      creatorId: row.creator_id, projectId: row.project_id, deadline: row.deadline,
      linkedEntity: row.linked_entity_json ? JSON.parse(row.linked_entity_json) : null,
      reminderMinutes: row.reminder_minutes, reminderChannels: row.reminder_channels ? JSON.parse(row.reminder_channels) : [],
      completedAt: row.completed_at, createdAt: row.created_at, updatedAt: row.updated_at,
      assigneeIds: this.db.prepare('SELECT user_id FROM tm_task_assignees WHERE task_id = ?').all(id).map(r => r.user_id),
      departmentIds: this.db.prepare('SELECT dept_id FROM tm_task_departments WHERE task_id = ?').all(id).map(r => r.dept_id),
      watcherIds: this.db.prepare('SELECT user_id FROM tm_task_watchers WHERE task_id = ?').all(id).map(r => r.user_id),
      subtasks: this.db.prepare('SELECT * FROM tm_task_subtasks WHERE task_id = ? ORDER BY position').all(id).map(s => ({ id: s.id, text: s.text, done: !!s.done })),
      comments: this.db.prepare('SELECT * FROM tm_task_comments WHERE task_id = ? ORDER BY created_at').all(id).map(c => ({ id: c.id, userId: c.user_id, text: c.text, createdAt: c.created_at })),
      attachments: this.db.prepare('SELECT * FROM tm_task_attachments WHERE task_id = ?').all(id).map(a => ({ id: a.id, name: a.name, type: a.type, size: a.size, url: a.url, addedBy: a.added_by, addedAt: a.added_at })),
      links: this.db.prepare('SELECT * FROM tm_task_links WHERE task_id = ?').all(id).map(l => ({ id: l.id, title: l.title, url: l.url, addedBy: l.added_by })),
      contacts: this.db.prepare('SELECT * FROM tm_task_contacts WHERE task_id = ?').all(id).map(c => ({ id: c.id, name: c.name, phone: c.phone, email: c.email, role: c.role })),
      tags: this.db.prepare('SELECT tag FROM tm_task_tags WHERE task_id = ?').all(id).map(r => r.tag),
      relations: this.db.prepare('SELECT * FROM tm_task_relations WHERE task_id = ?').all(id).map(r => ({ taskId: r.target_id, type: r.type })),
      history: this.db.prepare('SELECT * FROM tm_task_history WHERE task_id = ? ORDER BY timestamp').all(id).map(h => ({ field: h.field, oldValue: h.old_value, newValue: h.new_value, userId: h.user_id, timestamp: h.timestamp })),
      timeEntries: this.db.prepare('SELECT * FROM tm_task_time_entries WHERE task_id = ? ORDER BY date').all(id).map(e => ({ id: e.id, userId: e.user_id, minutes: e.minutes, description: e.description, date: e.date })),
    };
  }

  tmSaveTasksBulk(tasks) {
    const trx = this.db.transaction((list) => {
      this.db.prepare('DELETE FROM tm_tasks').run();
      const insT = this.db.prepare(`INSERT INTO tm_tasks (id, title, description, status, priority, category, assignee_id, assignee_type, creator_id, project_id, deadline, linked_entity_json, reminder_minutes, reminder_channels, completed_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
      const insA = this.db.prepare('INSERT INTO tm_task_assignees (task_id, user_id) VALUES (?,?)');
      const insD = this.db.prepare('INSERT OR IGNORE INTO tm_task_departments (task_id, dept_id) VALUES (?,?)');
      const insW = this.db.prepare('INSERT OR IGNORE INTO tm_task_watchers (task_id, user_id) VALUES (?,?)');
      const insS = this.db.prepare('INSERT INTO tm_task_subtasks (task_id, text, done, position) VALUES (?,?,?,?)');
      const insC = this.db.prepare('INSERT INTO tm_task_comments (task_id, user_id, text, created_at) VALUES (?,?,?,?)');
      const insAt = this.db.prepare('INSERT INTO tm_task_attachments (task_id, name, type, size, url, added_by, added_at) VALUES (?,?,?,?,?,?,?)');
      const insL = this.db.prepare('INSERT INTO tm_task_links (task_id, title, url, added_by) VALUES (?,?,?,?)');
      const insCt = this.db.prepare('INSERT INTO tm_task_contacts (task_id, name, phone, email, role) VALUES (?,?,?,?,?)');
      const insTg = this.db.prepare('INSERT OR IGNORE INTO tm_task_tags (task_id, tag) VALUES (?,?)');
      const insR = this.db.prepare('INSERT INTO tm_task_relations (task_id, target_id, type) VALUES (?,?,?)');
      const insH = this.db.prepare('INSERT INTO tm_task_history (task_id, field, old_value, new_value, user_id, timestamp) VALUES (?,?,?,?,?,?)');
      const insTE = this.db.prepare('INSERT INTO tm_task_time_entries (task_id, user_id, minutes, description, date) VALUES (?,?,?,?,?)');

      list.forEach(t => {
        insT.run(t.id, t.title, t.description || null, t.status || 'new', t.priority || 'medium', t.category || null,
          t.assigneeId || null, t.assigneeType || 'single', t.creatorId || null, t.projectId || null, t.deadline || null,
          t.linkedEntity ? JSON.stringify(t.linkedEntity) : null,
          t.reminderMinutes || 0, t.reminderChannels ? JSON.stringify(t.reminderChannels) : null,
          t.completedAt || null, t.createdAt || new Date().toISOString(), t.updatedAt || new Date().toISOString());
        (t.assigneeIds || []).forEach(uid => insA.run(t.id, uid));
        (t.departmentIds || []).forEach(did => insD.run(t.id, did));
        (t.watcherIds || []).forEach(uid => insW.run(t.id, uid));
        (t.subtasks || []).forEach((s, i) => insS.run(t.id, s.text, s.done ? 1 : 0, i));
        (t.comments || []).forEach(c => insC.run(t.id, c.userId || null, c.text, c.createdAt || new Date().toISOString()));
        (t.attachments || []).forEach(a => insAt.run(t.id, a.name, a.type, a.size, a.url, a.addedBy, a.addedAt));
        (t.links || []).forEach(l => insL.run(t.id, l.title, l.url, l.addedBy));
        (t.contacts || []).forEach(c => insCt.run(t.id, c.name, c.phone, c.email, c.role));
        (t.tags || []).forEach(tag => insTg.run(t.id, tag));
        (t.relations || []).forEach(r => insR.run(t.id, r.taskId, r.type));
        (t.history || []).forEach(h => insH.run(t.id, h.field, h.oldValue, h.newValue, h.userId, h.timestamp));
        (t.timeEntries || []).forEach(e => insTE.run(t.id, e.userId, e.minutes, e.description, e.date));
      });
    });
    trx(tasks);
    return { ok: true, count: tasks.length };
  }

  tmSaveProjectsBulk(projects) {
    const trx = this.db.transaction((list) => {
      this.db.prepare('DELETE FROM tm_projects').run();
      const ins = this.db.prepare(`INSERT INTO tm_projects (id, name, description, status, type, color, creator_id, coordinator_id, contractor_name, contractor_id, archived_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
      list.forEach(p => ins.run(p.id, p.name, p.description || null, p.status || 'active', p.type || null, p.color || null,
        p.creatorId || null, p.coordinatorId || null, p.contractorName || null, p.contractorId || null, p.archivedAt || null, p.createdAt || new Date().toISOString()));
    });
    trx(projects);
    return { ok: true, count: projects.length };
  }

  /* ========== AUTH ========== */

  setUserPassword(userId, passwordHash) {
    return this.db.prepare('UPDATE uzytkownicy SET password_hash=? WHERE id=?').run(passwordHash, userId);
  }

  updateUserProfile(userId, data) {
    const fields = [];
    const values = [];
    for (const key of ['imie', 'kolor', 'jezyk', 'avatar']) {
      if (key in data) { fields.push(`${key}=?`); values.push(data[key] || null); }
    }
    if (!fields.length) return;
    values.push(userId);
    return this.db.prepare(`UPDATE uzytkownicy SET ${fields.join(', ')} WHERE id=?`).run(...values);
  }

  setUserLogin(userId, login) {
    return this.db.prepare('UPDATE uzytkownicy SET login=? WHERE id=?').run(login, userId);
  }

  getUserByLogin(login) {
    return this.db.prepare('SELECT * FROM uzytkownicy WHERE login = ? AND aktywny = 1').get(login);
  }

  touchLastLogin(userId) {
    this.db.prepare("UPDATE uzytkownicy SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").run(userId);
  }

  createSession(sessionId, userId, ttlHours = 24 * 30) {
    const expires = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
    return this.db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?,?,?)').run(sessionId, userId, expires);
  }

  getSessionUser(sessionId) {
    if (!sessionId) return null;
    const row = this.db.prepare(`
      SELECT u.* FROM sessions s
      JOIN uzytkownicy u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.aktywny = 1
    `).get(sessionId);
    return row || null;
  }

  deleteSession(sessionId) {
    return this.db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  }

  cleanupExpiredSessions() {
    return this.db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP').run();
  }

  close() {
    this.db.close();
  }
}

module.exports = CRMDatabase;
module.exports.FUNNELS = FUNNELS;
