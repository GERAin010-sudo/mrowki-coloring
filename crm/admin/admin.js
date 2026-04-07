/* ============================================
   MRÓWKI COLORING CRM — Admin Panel JS
   Weeek-style Kanban Pipeline CRM
   ============================================ */

const API = '';
let currentView = 'dashboard';
let funnels = {};
let dragDealId = null;

// Category labels
const CATEGORIES = { okna:'Okna', drzwi:'Drzwi', fasady:'Fasady', bramy_windy:'Bramy/Windy', parapety:'Parapety', poprawki:'Poprawki', inne:'Inne' };
const STOCK_CATS = { material:'Materiał', farba:'Farba', narzedzie:'Narzędzie', srodek:'Środek ochrony', inne:'Inne' };
const STOCK_UNITS = { szt:'szt', l:'l', kg:'kg', m2:'m²', m:'m', op:'op', kpl:'kpl' };

/* ===== INIT ===== */
(async () => {
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

  loadView('dashboard');
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

  switch(view) {
    case 'dashboard':
      title.textContent = 'Dashboard';
      loadDashboard();
      break;
    case 'funnel_sprzedaz':
      title.textContent = 'Sprzedaż';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowa transakcja';
      loadKanban('sprzedaz');
      break;
    case 'funnel_wykonanie':
      title.textContent = 'Wykonanie';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowa transakcja';
      loadKanban('wykonanie');
      break;
    case 'kontakty':
      title.textContent = 'Kontakty';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Dodaj kontakt';
      loadContacts();
      break;
    case 'kompanie':
      title.textContent = 'Kompanie';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Dodaj kompanię';
      loadCompanies();
      break;
    case 'magazyn':
      title.textContent = 'Magazyn';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowa pozycja';
      loadWarehouse();
      break;
    case 'realizacje':
      title.textContent = 'Realizacje';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Dodaj zdjęcie';
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
        <div class="stat-card"><div class="stat-card-label">Transakcje</div><div class="stat-card-value primary">${stats.totalDeals}</div></div>
        <div class="stat-card"><div class="stat-card-label">Sprzedaż</div><div class="stat-card-value accent">${stats.salesDeals} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.salesSum||0).toLocaleString()} zł</small></div></div>
        <div class="stat-card"><div class="stat-card-label">Wykonanie</div><div class="stat-card-value success">${stats.execDeals} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.execSum||0).toLocaleString()} zł</small></div></div>
        <div class="stat-card"><div class="stat-card-label">Kompanie</div><div class="stat-card-value">${stats.totalCompanies}</div></div>
        <div class="stat-card"><div class="stat-card-label">Kontakty</div><div class="stat-card-value">${stats.totalContacts}</div></div>
        <div class="stat-card"><div class="stat-card-label">Magazyn</div><div class="stat-card-value">${stats.stockItems} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.stockValue||0).toLocaleString()} zł</small></div></div>
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">Nie udało się załadować</div>'; }
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
              <button class="kanban-add-btn" onclick="showNewDealForm('${voronka}','${stage.id}')">+ Dodaj</button>
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
          <span>Zadania ${totalTasks ? `(${doneCount}/${totalTasks})` : ''}</span>
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
          <input type="text" id="new-task-input" placeholder="Nowe zadanie..." class="form-input" onkeydown="if(event.key==='Enter')addNewTask(${id})">
          <button class="btn-sm" onclick="addNewTask(${id})">+</button>
        </div>
      </div>

      ${deal.zuzycie?.length ? `
      <div class="deal-section">
        <div class="deal-section-header"><span>Zużycie materiałów</span></div>
        ${deal.zuzycie.map(z => `<div class="task-item"><span>${z.material_nazwa}: ${z.ilosc} ${z.jednostka}</span><small style="color:var(--text-muted);margin-left:auto">${z.data_zuzycia}</small></div>`).join('')}
      </div>` : ''}

      ${deal.historia?.length ? `
      <div class="deal-section">
        <div class="deal-section-header"><span>Historia</span></div>
        ${deal.historia.map(h => `<div style="padding:0.3rem 0;font-size:0.8rem;color:var(--text-secondary)">${h.opis} <span style="color:var(--text-muted)">(${new Date(h.created_at).toLocaleString('pl')})</span></div>`).join('')}
      </div>` : ''}

      <div class="form-actions">
        <button class="btn-submit" onclick="showEditDealForm(${id})">Edytuj</button>
        <button class="btn-cancel" onclick="deleteDeal(${id})">Usuń</button>
        <button class="btn-cancel" onclick="closeModal()">Zamknij</button>
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
  if (!confirm('Na pewno usunąć transakcję?')) return;
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
  const compOpts = '<option value="">— brak —</option>' + companies.map(c => `<option value="${c.id}">${c.nazwa}</option>`).join('');
  const contOpts = '<option value="">— brak —</option>' + contacts.map(c => `<option value="${c.id}">${c.imie} ${c.nazwisko||''} ${c.kompania_nazwa ? '('+c.kompania_nazwa+')' : ''}</option>`).join('');

  openModal('Nowa transakcja', `
    <form onsubmit="submitDeal(event,'${voronka}')">
      <div class="form-group"><label class="form-label">Nazwa *</label><input class="form-input" id="d-name" required placeholder="np. Warbud - Poznań - Szpital"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Kwota</label><input class="form-input" id="d-amount" type="number" step="0.01" placeholder="0.00"></div>
        <div class="form-group"><label class="form-label">Etap</label><select class="form-select" id="d-stage">${stageOpts}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Kompania</label><select class="form-select" id="d-company">${compOpts}</select></div>
        <div class="form-group"><label class="form-label">Kontakt</label><select class="form-select" id="d-contact">${contOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">Opis</label><textarea class="form-textarea" id="d-desc" placeholder="Notatki..."></textarea></div>
      <div class="form-group"><label class="form-label">Adres realizacji</label><input class="form-input" id="d-address" placeholder="ul. ..."></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Utwórz</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
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

  openModal('Edytuj transakcję', `
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
      <div class="table-header"><span class="table-title">Kontakty (${contacts.length})</span></div>
      ${contacts.length ? `<table><thead><tr><th>Imię i nazwisko</th><th>Email</th><th>Telefon</th><th>Kompania</th><th></th></tr></thead><tbody>
        ${contacts.map(ct => `<tr>
          <td><strong>${ct.imie} ${ct.nazwisko||''}</strong></td>
          <td>${ct.email||'—'}</td>
          <td>${ct.telefon||'—'}</td>
          <td>${ct.kompania_nazwa||'—'}</td>
          <td><button class="btn-sm" onclick="showEditContactForm(${ct.id})">✏️</button> <button class="btn-sm btn-danger" onclick="deleteContact(${ct.id})">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">Brak kontaktów</div>'}
    </div>
  `;
}

async function showNewContactForm() {
  const companies = await fetch(`${API}/api/kompanie`).then(r => r.json());
  const compOpts = '<option value="">— brak —</option>' + companies.map(c => `<option value="${c.id}">${c.nazwa}</option>`).join('');
  openModal('Nowy kontakt', `
    <form onsubmit="submitContact(event)">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Imię *</label><input class="form-input" id="c-first" required></div>
        <div class="form-group"><label class="form-label">Nazwisko</label><input class="form-input" id="c-last"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="c-email" type="email"></div>
        <div class="form-group"><label class="form-label">Telefon</label><input class="form-input" id="c-phone"></div>
      </div>
      <div class="form-group"><label class="form-label">Kompania</label><select class="form-select" id="c-company">${compOpts}</select></div>
      <div class="form-group"><label class="form-label">Stanowisko</label><input class="form-input" id="c-position" placeholder="np. Kierownik projektu"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Dodaj</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
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
  openModal('Edytuj kontakt', `
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
  if (!confirm('Usunąć kontakt?')) return;
  await fetch(`${API}/api/kontakty/${id}`, { method: 'DELETE' });
  loadView('kontakty');
}

/* ===== COMPANIES ===== */
async function loadCompanies() {
  const c = document.getElementById('content');
  const comps = await fetch(`${API}/api/kompanie`).then(r => r.json());
  c.innerHTML = `
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">Kompanie (${comps.length})</span></div>
      ${comps.length ? `<table><thead><tr><th>Nazwa</th><th>Email</th><th>Telefon</th><th>Adres</th><th>NIP</th><th></th></tr></thead><tbody>
        ${comps.map(co => `<tr>
          <td><strong>${co.nazwa}</strong></td>
          <td>${co.email||'—'}</td>
          <td>${co.telefon||'—'}</td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${co.adres||'—'}</td>
          <td>${co.nip||'—'}</td>
          <td><button class="btn-sm" onclick="showEditCompanyForm(${co.id})">✏️</button> <button class="btn-sm btn-danger" onclick="deleteCompany(${co.id})">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">Brak kompanii</div>'}
    </div>
  `;
}

async function showNewCompanyForm() {
  openModal('Nowa kompania', `
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
  openModal('Edytuj kompanię', `
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
  if (!confirm('Usunąć kompanię?')) return;
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
      <div class="stat-card"><div class="stat-card-label">Pozycje</div><div class="stat-card-value">${items.length}</div></div>
      <div class="stat-card"><div class="stat-card-label">Wartość</div><div class="stat-card-value accent">${totalVal.toLocaleString()} zł</div></div>
    </div>
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">Stan magazynowy</span></div>
      ${items.length ? `<table><thead><tr><th>Nazwa</th><th>Kategoria</th><th>Ilość</th><th>Cena jedn.</th><th>Wartość</th><th>Dostawca</th><th></th></tr></thead><tbody>
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
      </tbody></table>` : '<div class="empty-state">Magazyn pusty</div>'}
    </div>
  `;
}

function showNewStockForm() {
  const catOpts = Object.entries(STOCK_CATS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  const unitOpts = Object.entries(STOCK_UNITS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  openModal('Nowa pozycja magazynowa', `
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
  openModal('Edytuj pozycję', `
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
  if (!confirm('Usunąć pozycję?')) return;
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
        `}).join('') : '<div class="empty-state">Brak zdjęć</div>'}
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">Błąd ładowania</div>'; }
}

function editPhotoCategory(id, tytul, opis, kategoria, widoczny) {
  const catOpts = Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}" ${k===kategoria?'selected':''}>${v}</option>`).join('');
  openModal('Edytuj realizację', `
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
  openModal('Dodaj zdjęcie', `
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
