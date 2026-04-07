/* ============================================
   MRÓWKI COLORING CRM — Admin Panel JS
   Weeek-style Kanban Pipeline CRM + i18n + Themes
   ============================================ */

const API = '';
let currentView = 'dashboard';
let funnels = {};
let dragDealId = null;
let currentLang = localStorage.getItem('crm_lang') || 'pl';
let currentTheme = localStorage.getItem('crm_theme') || 'dark';

// ===== i18n TRANSLATIONS =====
const L = {
  pl: {
    dashboard:'Dashboard', sprzedaz:'Sprzedaż', wykonanie:'Wykonanie', kontakty:'Kontakty', kompanie:'Kompanie', magazyn:'Magazyn', realizacje:'Realizacje',
    nowa_transakcja:'Nowa transakcja', dodaj_kontakt:'Dodaj kontakt', dodaj_kompanie:'Dodaj kompanię', nowa_pozycja:'Nowa pozycja', dodaj_zdjecie:'Dodaj zdjęcie',
    transakcje:'Transakcje', wartosc:'Wartość', pozycje:'Pozycje', stan_magazynowy:'Stan magazynowy', magazyn_pusty:'Magazyn pusty',
    nazwa:'Nazwa', email:'Email', telefon:'Telefon', adres:'Adres', nip:'NIP', kategoria:'Kategoria', ilosc:'Ilość', cena_jedn:'Cena jedn.', dostawca:'Dostawca',
    kwota:'Kwota', etap:'Etap', kompania:'Kompania', kontakt:'Kontakt', opis:'Opis', adres_realizacji:'Adres realizacji',
    imie:'Imię', nazwisko:'Nazwisko', stanowisko:'Stanowisko', email_faktury:'Email dla faktur', odpowiedzialny:'Odpowiedzialny',
    utworz:'Utwórz', zapisz:'Zapisz', anuluj:'Anuluj', dodaj:'Dodaj', edytuj:'Edytuj', usun:'Usuń', zamknij:'Zamknij',
    brak:'— brak —', brak_kontaktow:'Brak kontaktów', brak_kompanii:'Brak kompanii', brak_zdjec:'Brak zdjęć', blad:'Błąd ładowania',
    zadania:'Zadania', historia:'Historia', zuzycie_materialow:'Zużycie materiałów', nowe_zadanie:'Nowe zadanie...', na_pewno_usunac:'Na pewno usunąć?',
    zakup:'Zakup', zuzycie:'Zużycie', nr_faktury:'Nr faktury', data_zakupu:'Data zakupu', zapisz_zakup:'Zapisz zakup', zapisz_zuzycie:'Zapisz zużycie',
    transakcja:'Transakcja', notatka:'Notatka', notatki:'Notatki', tytul:'Tytuł', zdjecie:'Zdjęcie', kliknij_przeciagnij:'Kliknij lub przeciągnij',
    przesylanie:'Przesyłanie...', edytuj_realizacje:'Edytuj realizację', nowy_kontakt:'Nowy kontakt', edytuj_kontakt:'Edytuj kontakt',
    nowa_kompania:'Nowa kompania', edytuj_kompanie:'Edytuj kompanię', edytuj_transakcje:'Edytuj transakcję', nowa_pozycja_mag:'Nowa pozycja magazynowa',
    edytuj_pozycje:'Edytuj pozycję', ilosc_poczatkowa:'Ilość początkowa', voronka:'Voronka', wynik:'Wynik',
    ukryte:'Ukryte', widoczne:'Widoczne', jednostka:'Jednostka',
  },
  ua: {
    dashboard:'Дашборд', sprzedaz:'Продажі', wykonanie:'Виконання', kontakty:'Контакти', kompanie:'Компанії', magazyn:'Склад', realizacje:'Реалізації',
    nowa_transakcja:'Нова угода', dodaj_kontakt:'Додати контакт', dodaj_kompanie:'Додати компанію', nowa_pozycja:'Нова позиція', dodaj_zdjecie:'Додати фото',
    transakcje:'Угоди', wartosc:'Вартість', pozycje:'Позиції', stan_magazynowy:'Стан складу', magazyn_pusty:'Склад порожній',
    nazwa:'Назва', email:'Email', telefon:'Телефон', adres:'Адреса', nip:'NIP', kategoria:'Категорія', ilosc:'Кількість', cena_jedn:'Ціна за од.', dostawca:'Постачальник',
    kwota:'Сума', etap:'Етап', kompania:'Компанія', kontakt:'Контакт', opis:'Опис', adres_realizacji:'Адреса виконання',
    imie:'Ім\'я', nazwisko:'Прізвище', stanowisko:'Посада', email_faktury:'Email для рахунків', odpowiedzialny:'Відповідальний',
    utworz:'Створити', zapisz:'Зберегти', anuluj:'Скасувати', dodaj:'Додати', edytuj:'Редагувати', usun:'Видалити', zamknij:'Закрити',
    brak:'— немає —', brak_kontaktow:'Немає контактів', brak_kompanii:'Немає компаній', brak_zdjec:'Немає фото', blad:'Помилка завантаження',
    zadania:'Завдання', historia:'Історія', zuzycie_materialow:'Витрати матеріалів', nowe_zadanie:'Нове завдання...', na_pewno_usunac:'Точно видалити?',
    zakup:'Закупівля', zuzycie:'Витрата', nr_faktury:'№ рахунку', data_zakupu:'Дата закупівлі', zapisz_zakup:'Зберегти закупівлю', zapisz_zuzycie:'Зберегти витрату',
    transakcja:'Угода', notatka:'Нотатка', notatki:'Нотатки', tytul:'Назва', zdjecie:'Фото', kliknij_przeciagnij:'Натисніть або перетягніть',
    przesylanie:'Завантаження...', edytuj_realizacje:'Редагувати реалізацію', nowy_kontakt:'Новий контакт', edytuj_kontakt:'Редагувати контакт',
    nowa_kompania:'Нова компанія', edytuj_kompanie:'Редагувати компанію', edytuj_transakcje:'Редагувати угоду', nowa_pozycja_mag:'Нова позиція складу',
    edytuj_pozycje:'Редагувати позицію', ilosc_poczatkowa:'Початкова кількість', voronka:'Воронка', wynik:'Результат',
    ukryte:'Приховано', widoczne:'Видиме', jednostka:'Одиниця',
  },
  ru: {
    dashboard:'Дашборд', sprzedaz:'Продажи', wykonanie:'Исполнение', kontakty:'Контакты', kompanie:'Компании', magazyn:'Склад', realizacje:'Реализации',
    nowa_transakcja:'Новая сделка', dodaj_kontakt:'Добавить контакт', dodaj_kompanie:'Добавить компанию', nowa_pozycja:'Новая позиция', dodaj_zdjecie:'Добавить фото',
    transakcje:'Сделки', wartosc:'Стоимость', pozycje:'Позиции', stan_magazynowy:'Состояние склада', magazyn_pusty:'Склад пуст',
    nazwa:'Название', email:'Email', telefon:'Телефон', adres:'Адрес', nip:'NIP', kategoria:'Категория', ilosc:'Количество', cena_jedn:'Цена за ед.', dostawca:'Поставщик',
    kwota:'Сумма', etap:'Этап', kompania:'Компания', kontakt:'Контакт', opis:'Описание', adres_realizacji:'Адрес исполнения',
    imie:'Имя', nazwisko:'Фамилия', stanowisko:'Должность', email_faktury:'Email для счетов', odpowiedzialny:'Ответственный',
    utworz:'Создать', zapisz:'Сохранить', anuluj:'Отмена', dodaj:'Добавить', edytuj:'Редактировать', usun:'Удалить', zamknij:'Закрыть',
    brak:'— нет —', brak_kontaktow:'Нет контактов', brak_kompanii:'Нет компаний', brak_zdjec:'Нет фото', blad:'Ошибка загрузки',
    zadania:'Задачи', historia:'История', zuzycie_materialow:'Расход материалов', nowe_zadanie:'Новая задача...', na_pewno_usunac:'Точно удалить?',
    zakup:'Закупка', zuzycie:'Расход', nr_faktury:'№ счёта', data_zakupu:'Дата закупки', zapisz_zakup:'Сохранить закупку', zapisz_zuzycie:'Сохранить расход',
    transakcja:'Сделка', notatka:'Заметка', notatki:'Заметки', tytul:'Название', zdjecie:'Фото', kliknij_przeciagnij:'Нажмите или перетяните',
    przesylanie:'Загрузка...', edytuj_realizacje:'Редактировать реализацию', nowy_kontakt:'Новый контакт', edytuj_kontakt:'Редактировать контакт',
    nowa_kompania:'Новая компания', edytuj_kompanie:'Редактировать компанию', edytuj_transakcje:'Редактировать сделку', nowa_pozycja_mag:'Новая позиция склада',
    edytuj_pozycje:'Редактировать позицию', ilosc_poczatkowa:'Начальное количество', voronka:'Воронка', wynik:'Результат',
    ukryte:'Скрыто', widoczne:'Видимое', jednostka:'Единица',
  }
};
function t(key) { return L[currentLang]?.[key] || L.pl[key] || key; }

const CATEGORIES = { okna:'Okna', drzwi:'Drzwi', fasady:'Fasady', bramy_windy:'Bramy/Windy', parapety:'Parapety', poprawki:'Poprawki', inne:'Inne' };
const STOCK_CATS = { material:'Materiał', farba:'Farba', narzedzie:'Narzędzie', srodek:'Środek ochrony', inne:'Inne' };
const STOCK_UNITS = { szt:'szt', l:'l', kg:'kg', m2:'m²', m:'m', op:'op', kpl:'kpl' };

/* ===== THEME & LANG ===== */
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('crm_theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('crm_lang', lang);
  // Update sidebar labels
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    const key = {dashboard:'dashboard',funnel_sprzedaz:'sprzedaz',funnel_wykonanie:'wykonanie',kontakty:'kontakty',kompanie:'kompanie',magazyn:'magazyn',realizacje:'realizacje'}[el.dataset.view];
    if (key) { const txt = el.childNodes; txt[txt.length - 1].textContent = ' ' + t(key); }
  });
  loadView(currentView);
}

/* ===== INIT ===== */
(async () => {
  applyTheme(currentTheme);
  try {
    const res = await fetch(`${API}/api/funnels`);
    funnels = await res.json();
  } catch(e) { console.warn('Could not load funnels config'); }

  // Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentView = item.dataset.view;
      loadView(currentView);
    });
  });

  // Modal
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  // Menu toggle
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Add button
  document.getElementById('btn-add').addEventListener('click', () => {
    if (currentView === 'funnel_sprzedaz') showNewDealForm('sprzedaz');
    else if (currentView === 'funnel_wykonanie') showNewDealForm('wykonanie');
    else if (currentView === 'kontakty') showNewContactForm();
    else if (currentView === 'kompanie') showNewCompanyForm();
    else if (currentView === 'magazyn') showNewStockForm();
    else if (currentView === 'realizacje') showUploadPhotoForm();
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Language select
  const langSel = document.getElementById('lang-select');
  langSel.value = currentLang;
  langSel.addEventListener('change', () => applyLang(langSel.value));

  applyLang(currentLang);
})();

function openModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

/* ===== ROUTER ===== */
function loadView(view) {
  const addBtn = document.getElementById('btn-add');
  const title = document.getElementById('page-title');
  addBtn.style.display = 'none';

  const SVG_PLUS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> ';
  switch(view) {
    case 'dashboard':
      title.textContent = t('dashboard');
      loadDashboard();
      break;
    case 'funnel_sprzedaz':
      title.textContent = t('sprzedaz');
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = SVG_PLUS + t('nowa_transakcja');
      loadKanban('sprzedaz');
      break;
    case 'funnel_wykonanie':
      title.textContent = t('wykonanie');
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = SVG_PLUS + t('nowa_transakcja');
      loadKanban('wykonanie');
      break;
    case 'kontakty':
      title.textContent = t('kontakty');
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = SVG_PLUS + t('dodaj_kontakt');
      loadContacts();
      break;
    case 'kompanie':
      title.textContent = t('kompanie');
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = SVG_PLUS + t('dodaj_kompanie');
      loadCompanies();
      break;
    case 'magazyn':
      title.textContent = t('magazyn');
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = SVG_PLUS + t('nowa_pozycja');
      loadWarehouse();
      break;
    case 'realizacje':
      title.textContent = t('realizacje');
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = SVG_PLUS + t('dodaj_zdjecie');
      loadRealizacje();
      break;
  }
}

/* ===== DASHBOARD ===== */
async function loadDashboard() {
  const c = document.getElementById('content');
  try {
    const stats = await fetch(`${API}/api/stats`).then(r => r.json());
    c.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-card-label">${t('transakcje')}</div><div class="stat-card-value primary">${stats.totalDeals}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('sprzedaz')}</div><div class="stat-card-value accent">${stats.salesDeals} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.salesSum||0).toLocaleString()} zł</small></div></div>
        <div class="stat-card"><div class="stat-card-label">${t('wykonanie')}</div><div class="stat-card-value success">${stats.execDeals} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.execSum||0).toLocaleString()} zł</small></div></div>
        <div class="stat-card"><div class="stat-card-label">${t('kompanie')}</div><div class="stat-card-value">${stats.totalCompanies}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('kontakty')}</div><div class="stat-card-value">${stats.totalContacts}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('magazyn')}</div><div class="stat-card-value">${stats.stockItems} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.stockValue||0).toLocaleString()} zł</small></div></div>
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">' + t('blad') + '</div>'; }
}

/* ===== KANBAN BOARD ===== */
async function loadKanban(voronka) {
  const c = document.getElementById('content');
  const funnel = funnels[voronka];
  if (!funnel) { c.innerHTML = '<div class="empty-state">Brak konfiguracji</div>'; return; }

  const deals = await fetch(`${API}/api/transakcje?voronka=${voronka}`).then(r => r.json());

  // Group deals by stage
  const grouped = {};
  funnel.stages.forEach(s => grouped[s.id] = []);
  deals.forEach(d => {
    if (grouped[d.etap]) grouped[d.etap].push(d);
    else if (funnel.stages.length) grouped[funnel.stages[0].id].push(d);
  });

  c.innerHTML = `
    <div class="kanban-board">
      ${funnel.stages.map(stage => {
        const stageDeals = grouped[stage.id] || [];
        const stageSum = stageDeals.reduce((s,d) => s + (d.kwota || 0), 0);
        return `
          <div class="kanban-column" data-stage="${stage.id}"
               ondragover="event.preventDefault();this.classList.add('drag-over')"
               ondragleave="this.classList.remove('drag-over')"
               ondrop="handleDrop(event,'${stage.id}')">
            <div class="kanban-col-header">
              <span class="kanban-col-title">${stage.icon} ${stage.name}</span>
              <span class="kanban-col-count">${stageDeals.length} · ${stageSum.toLocaleString()} zł</span>
            </div>
            <div class="kanban-col-body">
              ${stageDeals.map(d => dealCard(d)).join('')}
              <button class="kanban-add-btn" onclick="showNewDealForm('${voronka}','${stage.id}')">+ ${t('dodaj')}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function dealCard(d) {
  return `
    <div class="deal-card" draggable="true" data-deal-id="${d.id}"
         ondragstart="dragDealId=${d.id};this.classList.add('dragging')"
         ondragend="this.classList.remove('dragging')"
         onclick="showDealDetail(${d.id})">
      <div class="deal-card-title">${d.nazwa}</div>
      ${d.kwota ? `<div class="deal-card-amount">${d.kwota.toLocaleString()} ${d.waluta||'PLN'}</div>` : ''}
      <div class="deal-card-meta">
        ${d.kontakt_nazwa?.trim() ? `<span class="deal-tag deal-tag-contact">${d.kontakt_nazwa.trim()}</span>` : ''}
        ${d.kompania_nazwa ? `<span class="deal-tag deal-tag-company">${d.kompania_nazwa}</span>` : ''}
      </div>
    </div>
  `;
}

async function handleDrop(event, newStage) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  if (!dragDealId) return;
  await fetch(`${API}/api/transakcje/${dragDealId}/move`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ etap: newStage, user: 'Admin Panel' })
  });
  dragDealId = null;
  loadView(currentView);
}

/* ===== DEAL DETAIL MODAL ===== */
async function showDealDetail(id) {
  const deal = await fetch(`${API}/api/transakcje/${id}`).then(r => r.json());
  const funnel = funnels[deal.voronka];
  const stageLabel = funnel?.stages.find(s => s.id === deal.etap)?.name || deal.etap;
  const doneCount = deal.zadania?.filter(z => z.wykonane).length || 0;
  const totalTasks = deal.zadania?.length || 0;

  openModal(deal.nazwa, `
    <div class="deal-detail">
      <div class="deal-detail-top">
        <div class="deal-badge">${stageLabel}</div>
        <div class="deal-amount-big">${(deal.kwota||0).toLocaleString()} ${deal.waluta||'PLN'}</div>
      </div>

      <div class="deal-detail-grid">
        <div><span class="form-label">Kompania</span><div>${deal.kompania_nazwa || '—'}</div></div>
        <div><span class="form-label">Kontakt</span><div>${deal.kontakt_nazwa?.trim() || '—'}${deal.kontakt_email ? `<br><small>${deal.kontakt_email}</small>` : ''}${deal.kontakt_telefon ? `<br><small>${deal.kontakt_telefon}</small>` : ''}</div></div>
        ${deal.opis ? `<div style="grid-column:1/-1"><span class="form-label">Opis</span><div>${deal.opis}</div></div>` : ''}
        ${deal.adres_realizacji ? `<div style="grid-column:1/-1"><span class="form-label">Adres</span><div>${deal.adres_realizacji}</div></div>` : ''}
      </div>

      <div class="deal-section">
        <div class="deal-section-header">
          <span>${t('zadania')} ${totalTasks ? `(${doneCount}/${totalTasks})` : ''}</span>
        </div>
        <div id="deal-tasks">
          ${(deal.zadania||[]).map(z => `
            <div class="task-item ${z.wykonane ? 'done' : ''}">
              <input type="checkbox" ${z.wykonane ? 'checked' : ''} onchange="toggleTask(${z.id},${id})">
              <span>${z.tresc}</span>
              <button class="task-del" onclick="deleteTask(${z.id},${id})">×</button>
            </div>
          `).join('')}
        </div>
        <div class="task-add">
          <input type="text" id="new-task-input" placeholder="${t('nowe_zadanie')}" class="form-input" onkeydown="if(event.key==='Enter')addNewTask(${id})">
          <button class="btn-sm" onclick="addNewTask(${id})">+</button>
        </div>
      </div>

      ${deal.zuzycie?.length ? `
      <div class="deal-section">
        <div class="deal-section-header"><span>${t('zuzycie_materialow')}</span></div>
        ${deal.zuzycie.map(z => `<div class="task-item"><span>${z.material_nazwa}: ${z.ilosc} ${z.jednostka}</span><small style="color:var(--text-muted);margin-left:auto">${z.data_zuzycia}</small></div>`).join('')}
      </div>` : ''}

      ${deal.historia?.length ? `
      <div class="deal-section">
        <div class="deal-section-header"><span>${t('historia')}</span></div>
        ${deal.historia.map(h => `<div style="padding:0.3rem 0;font-size:0.8rem;color:var(--text-secondary)">${h.opis} <span style="color:var(--text-muted)">(${new Date(h.created_at).toLocaleString('pl')})</span></div>`).join('')}
      </div>` : ''}

      <div class="form-actions">
        <button class="btn-submit" onclick="showEditDealForm(${id})">${t('edytuj')}</button>
        <button class="btn-cancel" onclick="deleteDeal(${id})">${t('usun')}</button>
        <button class="btn-cancel" onclick="closeModal()">${t('zamknij')}</button>
      </div>
    </div>
  `);
}

async function addNewTask(dealId) {
  const input = document.getElementById('new-task-input');
  if (!input.value.trim()) return;
  await fetch(`${API}/api/transakcje/${dealId}/zadania`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tresc: input.value.trim() })
  });
  showDealDetail(dealId);
}

async function toggleTask(taskId, dealId) {
  await fetch(`${API}/api/zadania/${taskId}/toggle`, { method: 'PUT' });
  showDealDetail(dealId);
}

async function deleteTask(taskId, dealId) {
  await fetch(`${API}/api/zadania/${taskId}`, { method: 'DELETE' });
  showDealDetail(dealId);
}

async function deleteDeal(id) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/transakcje/${id}`, { method: 'DELETE' });
  closeModal();
  loadView(currentView);
}

/* ===== NEW / EDIT DEAL FORM ===== */
async function showNewDealForm(voronka, etap) {
  const companies = await fetch(`${API}/api/kompanie`).then(r => r.json());
  const contacts = await fetch(`${API}/api/kontakty`).then(r => r.json());
  const funnel = funnels[voronka];
  const stageOpts = funnel ? funnel.stages.map(s => `<option value="${s.id}" ${s.id===etap?'selected':''}>${s.name}</option>`).join('') : '';
  const compOpts = `<option value="">${t('brak')}</option>` + companies.map(c => `<option value="${c.id}">${c.nazwa}</option>`).join('');
  const contOpts = `<option value="">${t('brak')}</option>` + contacts.map(c => `<option value="${c.id}">${c.imie} ${c.nazwisko||''} ${c.kompania_nazwa ? '('+c.kompania_nazwa+')' : ''}</option>`).join('');

  openModal(t('nowa_transakcja'), `
    <form onsubmit="submitDeal(event,'${voronka}')">
      <div class="form-group"><label class="form-label">${t('nazwa')} *</label><input class="form-input" id="d-name" required placeholder="np. Warbud - Poznań - Szpital"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('kwota')}</label><input class="form-input" id="d-amount" type="number" step="0.01" placeholder="0.00"></div>
        <div class="form-group"><label class="form-label">${t('etap')}</label><select class="form-select" id="d-stage">${stageOpts}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('kompania')}</label><select class="form-select" id="d-company">${compOpts}</select></div>
        <div class="form-group"><label class="form-label">${t('kontakt')}</label><select class="form-select" id="d-contact">${contOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">${t('opis')}</label><textarea class="form-textarea" id="d-desc" placeholder="${t('notatki')}..."></textarea></div>
      <div class="form-group"><label class="form-label">${t('adres_realizacji')}</label><input class="form-input" id="d-address" placeholder="ul. ..."></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('utworz')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
    </form>
  `);
}

async function submitDeal(e, voronka) {
  e.preventDefault();
  await fetch(`${API}/api/transakcje`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nazwa: document.getElementById('d-name').value,
      kwota: parseFloat(document.getElementById('d-amount').value) || 0,
      voronka: voronka,
      etap: document.getElementById('d-stage').value,
      kompania_id: document.getElementById('d-company').value || null,
      kontakt_id: document.getElementById('d-contact').value || null,
      opis: document.getElementById('d-desc').value,
      adres_realizacji: document.getElementById('d-address').value,
      created_by: 'Admin Panel'
    })
  });
  closeModal();
  loadView(currentView);
}

async function showEditDealForm(id) {
  const deal = await fetch(`${API}/api/transakcje/${id}`).then(r => r.json());
  const companies = await fetch(`${API}/api/kompanie`).then(r => r.json());
  const contacts = await fetch(`${API}/api/kontakty`).then(r => r.json());
  const funnel = funnels[deal.voronka];
  const stageOpts = funnel ? funnel.stages.map(s => `<option value="${s.id}" ${s.id===deal.etap?'selected':''}>${s.name}</option>`).join('') : '';
  const funnelOpts = Object.entries(funnels).map(([k,v]) => `<option value="${k}" ${k===deal.voronka?'selected':''}>${v.name}</option>`).join('');
  const compOpts = '<option value="">— brak —</option>' + companies.map(c => `<option value="${c.id}" ${c.id==deal.kompania_id?'selected':''}>${c.nazwa}</option>`).join('');
  const contOpts = '<option value="">— brak —</option>' + contacts.map(c => `<option value="${c.id}" ${c.id==deal.kontakt_id?'selected':''}>${c.imie} ${c.nazwisko||''}</option>`).join('');

  openModal(t('edytuj_transakcje'), `
    <form onsubmit="submitEditDeal(event,${id})">
      <div class="form-group"><label class="form-label">Nazwa *</label><input class="form-input" id="d-name" required value="${deal.nazwa}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Kwota</label><input class="form-input" id="d-amount" type="number" step="0.01" value="${deal.kwota||''}"></div>
        <div class="form-group"><label class="form-label">Voronka</label><select class="form-select" id="d-funnel">${funnelOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">Etap</label><select class="form-select" id="d-stage">${stageOpts}</select></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Kompania</label><select class="form-select" id="d-company">${compOpts}</select></div>
        <div class="form-group"><label class="form-label">Kontakt</label><select class="form-select" id="d-contact">${contOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">Opis</label><textarea class="form-textarea" id="d-desc">${deal.opis||''}</textarea></div>
      <div class="form-group"><label class="form-label">Adres</label><input class="form-input" id="d-address" value="${deal.adres_realizacji||''}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Zapisz</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitEditDeal(e, id) {
  e.preventDefault();
  await fetch(`${API}/api/transakcje/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nazwa: document.getElementById('d-name').value,
      kwota: parseFloat(document.getElementById('d-amount').value) || 0,
      voronka: document.getElementById('d-funnel').value,
      etap: document.getElementById('d-stage').value,
      kompania_id: document.getElementById('d-company').value || null,
      kontakt_id: document.getElementById('d-contact').value || null,
      opis: document.getElementById('d-desc').value,
      adres_realizacji: document.getElementById('d-address').value
    })
  });
  closeModal();
  loadView(currentView);
}

/* ===== CONTACTS ===== */
async function loadContacts() {
  const c = document.getElementById('content');
  const contacts = await fetch(`${API}/api/kontakty`).then(r => r.json());
  c.innerHTML = `
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">${t('kontakty')} (${contacts.length})</span></div>
      ${contacts.length ? `<table><thead><tr><th>${t('imie')} ${t('nazwisko')}</th><th>${t('email')}</th><th>${t('telefon')}</th><th>${t('kompania')}</th><th></th></tr></thead><tbody>
        ${contacts.map(ct => `<tr>
          <td><strong>${ct.imie} ${ct.nazwisko||''}</strong></td>
          <td>${ct.email||'—'}</td>
          <td>${ct.telefon||'—'}</td>
          <td>${ct.kompania_nazwa||'—'}</td>
          <td><button class="btn-sm" onclick="showEditContactForm(${ct.id})">✏️</button> <button class="btn-sm btn-danger" onclick="deleteContact(${ct.id})">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">' + t('brak_kontaktow') + '</div>'}
    </div>
  `;
}

async function showNewContactForm() {
  const companies = await fetch(`${API}/api/kompanie`).then(r => r.json());
  const compOpts = '<option value="">— brak —</option>' + companies.map(c => `<option value="${c.id}">${c.nazwa}</option>`).join('');
  openModal(t('nowy_kontakt'), `
    <form onsubmit="submitContact(event)">
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('imie')} *</label><input class="form-input" id="c-first" required></div>
        <div class="form-group"><label class="form-label">${t('nazwisko')}</label><input class="form-input" id="c-last"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('email')}</label><input class="form-input" id="c-email" type="email"></div>
        <div class="form-group"><label class="form-label">${t('telefon')}</label><input class="form-input" id="c-phone"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('kompania')}</label><select class="form-select" id="c-company">${compOpts}</select></div>
      <div class="form-group"><label class="form-label">${t('stanowisko')}</label><input class="form-input" id="c-position"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('dodaj')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
    </form>
  `);
}

async function submitContact(e) {
  e.preventDefault();
  await fetch(`${API}/api/kontakty`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imie: document.getElementById('c-first').value,
      nazwisko: document.getElementById('c-last').value,
      email: document.getElementById('c-email').value,
      telefon: document.getElementById('c-phone').value,
      kompania_id: document.getElementById('c-company').value || null,
      stanowisko: document.getElementById('c-position').value
    })
  });
  closeModal(); loadView('kontakty');
}

async function showEditContactForm(id) {
  const ct = await fetch(`${API}/api/kontakty/${id}`).then(r => r.json());
  const companies = await fetch(`${API}/api/kompanie`).then(r => r.json());
  const compOpts = '<option value="">— brak —</option>' + companies.map(c => `<option value="${c.id}" ${c.id==ct.kompania_id?'selected':''}>${c.nazwa}</option>`).join('');
  openModal(t('edytuj_kontakt'), `
    <form onsubmit="submitEditContact(event,${id})">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Imię *</label><input class="form-input" id="c-first" required value="${ct.imie}"></div>
        <div class="form-group"><label class="form-label">Nazwisko</label><input class="form-input" id="c-last" value="${ct.nazwisko||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="c-email" value="${ct.email||''}"></div>
        <div class="form-group"><label class="form-label">Telefon</label><input class="form-input" id="c-phone" value="${ct.telefon||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Kompania</label><select class="form-select" id="c-company">${compOpts}</select></div>
      <div class="form-group"><label class="form-label">Stanowisko</label><input class="form-input" id="c-position" value="${ct.stanowisko||''}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Zapisz</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitEditContact(e, id) {
  e.preventDefault();
  await fetch(`${API}/api/kontakty/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imie: document.getElementById('c-first').value,
      nazwisko: document.getElementById('c-last').value,
      email: document.getElementById('c-email').value,
      telefon: document.getElementById('c-phone').value,
      kompania_id: document.getElementById('c-company').value || null,
      stanowisko: document.getElementById('c-position').value
    })
  });
  closeModal(); loadView('kontakty');
}

async function deleteContact(id) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/kontakty/${id}`, { method: 'DELETE' });
  loadView('kontakty');
}

/* ===== COMPANIES ===== */
async function loadCompanies() {
  const c = document.getElementById('content');
  const comps = await fetch(`${API}/api/kompanie`).then(r => r.json());
  c.innerHTML = `
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">${t('kompanie')} (${comps.length})</span></div>
      ${comps.length ? `<table><thead><tr><th>${t('nazwa')}</th><th>${t('email')}</th><th>${t('telefon')}</th><th>${t('adres')}</th><th>${t('nip')}</th><th></th></tr></thead><tbody>
        ${comps.map(co => `<tr>
          <td><strong>${co.nazwa}</strong></td>
          <td>${co.email||'—'}</td>
          <td>${co.telefon||'—'}</td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${co.adres||'—'}</td>
          <td>${co.nip||'—'}</td>
          <td><button class="btn-sm" onclick="showEditCompanyForm(${co.id})">✏️</button> <button class="btn-sm btn-danger" onclick="deleteCompany(${co.id})">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">' + t('brak_kompanii') + '</div>'}
    </div>
  `;
}

async function showNewCompanyForm() {
  openModal(t('nowa_kompania'), `
    <form onsubmit="submitCompany(event)">
      <div class="form-group"><label class="form-label">Nazwa *</label><input class="form-input" id="co-name" required></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="co-email" type="email"></div>
        <div class="form-group"><label class="form-label">Telefon</label><input class="form-input" id="co-phone"></div>
      </div>
      <div class="form-group"><label class="form-label">Adres</label><input class="form-input" id="co-address"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">NIP</label><input class="form-input" id="co-nip" placeholder="000-000-00-00"></div>
        <div class="form-group"><label class="form-label">Email dla faktur</label><input class="form-input" id="co-inv-email" type="email"></div>
      </div>
      <div class="form-group"><label class="form-label">Odpowiedzialny</label><input class="form-input" id="co-resp"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Dodaj</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitCompany(e) {
  e.preventDefault();
  await fetch(`${API}/api/kompanie`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nazwa: document.getElementById('co-name').value,
      email: document.getElementById('co-email').value,
      telefon: document.getElementById('co-phone').value,
      adres: document.getElementById('co-address').value,
      nip: document.getElementById('co-nip').value,
      email_faktury: document.getElementById('co-inv-email').value,
      odpowiedzialny: document.getElementById('co-resp').value
    })
  });
  closeModal(); loadView('kompanie');
}

async function showEditCompanyForm(id) {
  const co = await fetch(`${API}/api/kompanie/${id}`).then(r => r.json());
  openModal(t('edytuj_kompanie'), `
    <form onsubmit="submitEditCompany(event,${id})">
      <div class="form-group"><label class="form-label">Nazwa *</label><input class="form-input" id="co-name" required value="${co.nazwa}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="co-email" value="${co.email||''}"></div>
        <div class="form-group"><label class="form-label">Telefon</label><input class="form-input" id="co-phone" value="${co.telefon||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Adres</label><input class="form-input" id="co-address" value="${co.adres||''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">NIP</label><input class="form-input" id="co-nip" value="${co.nip||''}"></div>
        <div class="form-group"><label class="form-label">Email dla faktur</label><input class="form-input" id="co-inv-email" value="${co.email_faktury||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Odpowiedzialny</label><input class="form-input" id="co-resp" value="${co.odpowiedzialny||''}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Zapisz</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitEditCompany(e, id) {
  e.preventDefault();
  await fetch(`${API}/api/kompanie/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nazwa: document.getElementById('co-name').value,
      email: document.getElementById('co-email').value,
      telefon: document.getElementById('co-phone').value,
      adres: document.getElementById('co-address').value,
      nip: document.getElementById('co-nip').value,
      email_faktury: document.getElementById('co-inv-email').value,
      odpowiedzialny: document.getElementById('co-resp').value
    })
  });
  closeModal(); loadView('kompanie');
}

async function deleteCompany(id) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/kompanie/${id}`, { method: 'DELETE' });
  loadView('kompanie');
}

/* ===== WAREHOUSE ===== */
async function loadWarehouse() {
  const c = document.getElementById('content');
  const items = await fetch(`${API}/api/magazyn`).then(r => r.json());
  const totalVal = items.reduce((s,i) => s + (i.ilosc * i.cena_jedn), 0);
  c.innerHTML = `
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card"><div class="stat-card-label">${t('pozycje')}</div><div class="stat-card-value">${items.length}</div></div>
      <div class="stat-card"><div class="stat-card-label">${t('wartosc')}</div><div class="stat-card-value accent">${totalVal.toLocaleString()} zł</div></div>
    </div>
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">${t('stan_magazynowy')}</span></div>
      ${items.length ? `<table><thead><tr><th>${t('nazwa')}</th><th>${t('kategoria')}</th><th>${t('ilosc')}</th><th>${t('cena_jedn')}</th><th>${t('wartosc')}</th><th>${t('dostawca')}</th><th></th></tr></thead><tbody>
        ${items.map(i => `<tr>
          <td><strong>${i.nazwa}</strong></td>
          <td>${STOCK_CATS[i.kategoria]||i.kategoria}</td>
          <td>${i.ilosc} ${STOCK_UNITS[i.jednostka]||i.jednostka}</td>
          <td>${i.cena_jedn.toLocaleString()} zł</td>
          <td>${(i.ilosc * i.cena_jedn).toLocaleString()} zł</td>
          <td>${i.dostawca||'—'}</td>
          <td>
            <button class="btn-sm" onclick="showPurchaseForm(${i.id},'${i.nazwa.replace(/'/g,"\\'")}')" title="Zakup">📥</button>
            <button class="btn-sm" onclick="showConsumeForm(${i.id},'${i.nazwa.replace(/'/g,"\\'")}')" title="Zużycie">📤</button>
            <button class="btn-sm" onclick="showEditStockForm(${i.id})">✏️</button>
            <button class="btn-sm btn-danger" onclick="deleteStock(${i.id})">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">' + t('magazyn_pusty') + '</div>'}
    </div>
  `;
}

function showNewStockForm() {
  const catOpts = Object.entries(STOCK_CATS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  const unitOpts = Object.entries(STOCK_UNITS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  openModal(t('nowa_pozycja_mag'), `
    <form onsubmit="submitStock(event)">
      <div class="form-group"><label class="form-label">Nazwa *</label><input class="form-input" id="s-name" required placeholder="np. Farba RAL 7016"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Kategoria</label><select class="form-select" id="s-cat">${catOpts}</select></div>
        <div class="form-group"><label class="form-label">Jednostka</label><select class="form-select" id="s-unit">${unitOpts}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Ilość początkowa</label><input class="form-input" id="s-qty" type="number" step="0.01" value="0"></div>
        <div class="form-group"><label class="form-label">Cena jedn. (zł)</label><input class="form-input" id="s-price" type="number" step="0.01" value="0"></div>
      </div>
      <div class="form-group"><label class="form-label">Dostawca</label><input class="form-input" id="s-supplier"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Dodaj</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitStock(e) {
  e.preventDefault();
  await fetch(`${API}/api/magazyn`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nazwa: document.getElementById('s-name').value,
      kategoria: document.getElementById('s-cat').value,
      jednostka: document.getElementById('s-unit').value,
      ilosc: parseFloat(document.getElementById('s-qty').value) || 0,
      cena_jedn: parseFloat(document.getElementById('s-price').value) || 0,
      dostawca: document.getElementById('s-supplier').value
    })
  });
  closeModal(); loadView('magazyn');
}

async function showEditStockForm(id) {
  const item = await fetch(`${API}/api/magazyn/${id}`).then(r => r.json());
  const catOpts = Object.entries(STOCK_CATS).map(([k,v]) => `<option value="${k}" ${k===item.kategoria?'selected':''}>${v}</option>`).join('');
  const unitOpts = Object.entries(STOCK_UNITS).map(([k,v]) => `<option value="${k}" ${k===item.jednostka?'selected':''}>${v}</option>`).join('');
  openModal(t('edytuj_pozycje'), `
    <form onsubmit="submitEditStock(event,${id})">
      <div class="form-group"><label class="form-label">Nazwa *</label><input class="form-input" id="s-name" required value="${item.nazwa}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Kategoria</label><select class="form-select" id="s-cat">${catOpts}</select></div>
        <div class="form-group"><label class="form-label">Jednostka</label><select class="form-select" id="s-unit">${unitOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">Cena jedn. (zł)</label><input class="form-input" id="s-price" type="number" step="0.01" value="${item.cena_jedn}"></div>
      <div class="form-group"><label class="form-label">Dostawca</label><input class="form-input" id="s-supplier" value="${item.dostawca||''}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Zapisz</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitEditStock(e, id) {
  e.preventDefault();
  await fetch(`${API}/api/magazyn/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nazwa: document.getElementById('s-name').value,
      kategoria: document.getElementById('s-cat').value,
      jednostka: document.getElementById('s-unit').value,
      cena_jedn: parseFloat(document.getElementById('s-price').value) || 0,
      dostawca: document.getElementById('s-supplier').value
    })
  });
  closeModal(); loadView('magazyn');
}

function showPurchaseForm(id, name) {
  openModal(`Zakup: ${name}`, `
    <form onsubmit="submitPurchase(event,${id})">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Ilość *</label><input class="form-input" id="p-qty" type="number" step="0.01" required></div>
        <div class="form-group"><label class="form-label">Cena (zł)</label><input class="form-input" id="p-price" type="number" step="0.01"></div>
      </div>
      <div class="form-group"><label class="form-label">Nr faktury</label><input class="form-input" id="p-invoice"></div>
      <div class="form-group"><label class="form-label">Data zakupu</label><input class="form-input" id="p-date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Zapisz zakup</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitPurchase(e, id) {
  e.preventDefault();
  await fetch(`${API}/api/magazyn/${id}/zakup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ilosc: parseFloat(document.getElementById('p-qty').value),
      cena: parseFloat(document.getElementById('p-price').value) || 0,
      faktura: document.getElementById('p-invoice').value,
      data_zakupu: document.getElementById('p-date').value
    })
  });
  closeModal(); loadView('magazyn');
}

async function showConsumeForm(stockId, name) {
  const deals = await fetch(`${API}/api/transakcje?voronka=wykonanie`).then(r => r.json());
  const dealOpts = '<option value="">— brak —</option>' + deals.map(d => `<option value="${d.id}">${d.nazwa} (${(d.kwota||0).toLocaleString()} zł)</option>`).join('');
  openModal(`Zużycie: ${name}`, `
    <form onsubmit="submitConsume(event,${stockId})">
      <div class="form-group"><label class="form-label">Ilość *</label><input class="form-input" id="u-qty" type="number" step="0.01" required></div>
      <div class="form-group"><label class="form-label">Transakcja (zlecenie)</label><select class="form-select" id="u-deal">${dealOpts}</select></div>
      <div class="form-group"><label class="form-label">Notatka</label><input class="form-input" id="u-note"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Zapisz zużycie</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitConsume(e, stockId) {
  e.preventDefault();
  await fetch(`${API}/api/magazyn/${stockId}/zuzycie`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ilosc: parseFloat(document.getElementById('u-qty').value),
      transakcja_id: document.getElementById('u-deal').value || null,
      notatki: document.getElementById('u-note').value
    })
  });
  closeModal(); loadView('magazyn');
}

async function deleteStock(id) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/magazyn/${id}`, { method: 'DELETE' });
  loadView('magazyn');
}

/* ===== REALIZACJE (preserved) ===== */
async function loadRealizacje() {
  const c = document.getElementById('content');
  try {
    const items = await fetch(`${API}/api/realizacje/admin`).then(r => r.json());
    c.innerHTML = `
      <div class="photo-grid-admin">
        ${items.length ? items.map(item => {
          const safeTitle = item.tytul.replace(/'/g, "\\'");
          const safeDesc = (item.opis || '').replace(/'/g, "\\'");
          return `
          <div class="photo-card-admin ${item.widoczny ? '' : 'hidden-photo'}">
            <div class="photo-card-img">
              <img src="/uploads/${item.plik}" alt="${item.tytul}" loading="lazy">
              <div class="photo-card-badge">${CATEGORIES[item.kategoria] || item.kategoria}</div>
              ${!item.widoczny ? '<div class="photo-card-hidden-label">Ukryte</div>' : ''}
            </div>
            <div class="photo-card-info">
              <div class="photo-card-title">${item.tytul}</div>
              ${item.opis ? `<div class="photo-card-desc">${item.opis}</div>` : ''}
              <div class="photo-card-actions">
                <button class="btn-sm" onclick="editPhotoCategory(${item.id}, '${safeTitle}', '${safeDesc}', '${item.kategoria}', ${item.widoczny})">✏️</button>
                <button class="btn-sm btn-toggle" onclick="togglePhotoVis(${item.id}, ${item.widoczny ? 0 : 1}, '${safeTitle}', '${safeDesc}', '${item.kategoria}')">${item.widoczny ? '👁️' : '🚫'}</button>
                <button class="btn-sm btn-danger" onclick="deletePhoto(${item.id})">🗑️</button>
              </div>
            </div>
          </div>
        `}).join('') : '<div class="empty-state">' + t('brak_zdjec') + '</div>'}
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">' + t('blad') + '</div>'; }
}

function editPhotoCategory(id, tytul, opis, kategoria, widoczny) {
  const catOpts = Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}" ${k===kategoria?'selected':''}>${v}</option>`).join('');
  openModal(t('edytuj_realizacje'), `
    <form onsubmit="submitPhotoEdit(event, ${id}, ${widoczny})">
      <div class="form-group"><label class="form-label">Tytuł</label><input class="form-input" id="ep-title" required value="${tytul}"></div>
      <div class="form-group"><label class="form-label">Opis</label><textarea class="form-textarea" id="ep-desc">${opis}</textarea></div>
      <div class="form-group"><label class="form-label">Kategoria</label><select class="form-select" id="ep-cat">${catOpts}</select></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Zapisz</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitPhotoEdit(e, id, widoczny) {
  e.preventDefault();
  await fetch(`${API}/api/realizacje/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tytul: document.getElementById('ep-title').value, opis: document.getElementById('ep-desc').value, kategoria: document.getElementById('ep-cat').value, widoczny })
  });
  closeModal(); loadView('realizacje');
}

async function togglePhotoVis(id, newState, tytul, opis, kategoria) {
  await fetch(`${API}/api/realizacje/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tytul, opis, kategoria, widoczny: newState })
  });
  loadView('realizacje');
}

async function deletePhoto(id) {
  if (!confirm('Usunąć zdjęcie?')) return;
  await fetch(`${API}/api/realizacje/${id}`, { method: 'DELETE' });
  loadView('realizacje');
}

function showUploadPhotoForm() {
  const catOpts = Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  openModal(t('dodaj_zdjecie'), `
    <form id="upload-form" onsubmit="submitPhoto(event)">
      <div class="form-group">
        <label class="form-label">Zdjęcie *</label>
        <div class="upload-drop-zone" id="drop-zone">
          <input type="file" id="f-photo" accept="image/*" required style="display:none">
          <div class="drop-zone-content" id="drop-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--accent)"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Kliknij lub przeciągnij</span>
          </div>
          <img id="drop-preview" style="display:none;max-width:100%;max-height:200px;border-radius:4px;">
        </div>
      </div>
      <div class="form-group"><label class="form-label">Tytuł *</label><input class="form-input" id="f-title" required></div>
      <div class="form-group"><label class="form-label">Opis</label><textarea class="form-textarea" id="f-desc"></textarea></div>
      <div class="form-group"><label class="form-label">Kategoria</label><select class="form-select" id="f-cat">${catOpts}</select></div>
      <div class="form-actions"><button type="submit" class="btn-submit" id="upload-btn">Dodaj</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
  const zone = document.getElementById('drop-zone'), input = document.getElementById('f-photo');
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; showPrev(e.dataTransfer.files[0]); }
  });
  input.addEventListener('change', () => { if (input.files[0]) showPrev(input.files[0]); });
  function showPrev(file) {
    const r = new FileReader();
    r.onload = e => { document.getElementById('drop-preview').src = e.target.result; document.getElementById('drop-preview').style.display='block'; document.getElementById('drop-content').style.display='none'; };
    r.readAsDataURL(file);
  }
}

async function submitPhoto(e) {
  e.preventDefault();
  const btn = document.getElementById('upload-btn'); btn.textContent='Przesyłanie...'; btn.disabled=true;
  const fd = new FormData();
  fd.append('photo', document.getElementById('f-photo').files[0]);
  fd.append('tytul', document.getElementById('f-title').value);
  fd.append('opis', document.getElementById('f-desc').value);
  fd.append('kategoria', document.getElementById('f-cat').value);
  try {
    const res = await fetch(`${API}/api/realizacje`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    closeModal(); loadView('realizacje');
  } catch(err) { alert('Błąd: ' + err.message); btn.textContent='Dodaj'; btn.disabled=false; }
}
