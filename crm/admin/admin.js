/* Mrówki Coloring CRM — Admin Panel JS */

const API = '';

const STATUS = { nowe: 'Nowe', wycena: 'Wycena', zaakceptowane: 'Zaakceptowane', w_trakcie: 'W trakcie', zakonczone: 'Zakończone', anulowane: 'Anulowane' };
const SERVICES = { okna: 'Stolarka okienna', drzwi: 'Drzwi aluminiowe', fasady: 'Fasady budynków', bramy_windy: 'Bramy i windy', parapety: 'Parapety', poprawki: 'Poprawki lakiernicze', inne: 'Inne' };
const CTYPES = { deweloper: 'Deweloper', wykonawca: 'Wykonawca', producent: 'Producent', architekt: 'Architekt', montazysta: 'Montażysta', administrator: 'Administrator', inny: 'Inny' };

let currentView = 'dashboard';

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
const modalClose = document.getElementById('modal-close');
modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

function openModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  overlay.classList.add('active');
}
function closeModal() { overlay.classList.remove('active'); }

// Menu toggle
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Add button
document.getElementById('btn-add').addEventListener('click', () => {
  if (currentView === 'orders') showNewOrderForm();
  if (currentView === 'clients') showNewClientForm();
});

// Load view
function loadView(view) {
  const addBtn = document.getElementById('btn-add');
  const title = document.getElementById('page-title');
  
  switch(view) {
    case 'dashboard':
      title.textContent = 'Dashboard';
      addBtn.style.display = 'none';
      loadDashboard();
      break;
    case 'orders':
      title.textContent = 'Zlecenia';
      addBtn.style.display = 'inline-flex';
      addBtn.querySelector('svg + *')?.remove();
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowe zlecenie';
      loadOrders();
      break;
    case 'clients':
      title.textContent = 'Klienci';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowy klient';
      loadClients();
      break;
  }
}

// Dashboard
async function loadDashboard() {
  const content = document.getElementById('content');
  try {
    const stats = await fetch(`${API}/api/stats`).then(r => r.json());
    const orders = await fetch(`${API}/api/zlecenia?active=true`).then(r => r.json());

    content.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-card-label">Łącznie zleceń</div><div class="stat-card-value primary">${stats.totalOrders}</div></div>
        <div class="stat-card"><div class="stat-card-label">Aktywne</div><div class="stat-card-value accent">${stats.activeOrders}</div></div>
        <div class="stat-card"><div class="stat-card-label">Zakończone</div><div class="stat-card-value success">${stats.completedOrders}</div></div>
        <div class="stat-card"><div class="stat-card-label">Klienci</div><div class="stat-card-value">${stats.totalClients}</div></div>
      </div>
      <div class="table-wrapper">
        <div class="table-header"><span class="table-title">Aktywne zlecenia</span></div>
        ${orders.length ? `<table><thead><tr><th>Numer</th><th>Klient</th><th>Usługa</th><th>Status</th><th>Priorytet</th></tr></thead><tbody>
          ${orders.map(o => `<tr class="clickable" onclick="showOrderDetail(${o.id})">
            <td>${o.numer}</td><td>${o.klient_nazwa || '—'}</td>
            <td>${SERVICES[o.typ_uslugi] || o.typ_uslugi || '—'}</td>
            <td><span class="badge badge-${o.status}">${STATUS[o.status] || o.status}</span></td>
            <td>${o.priorytet === 'pilny' ? '<span class="badge badge-pilny">Pilny</span>' : o.priorytet || '—'}</td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="empty-state">Brak aktywnych zleceń</div>'}
      </div>
    `;
  } catch(err) {
    content.innerHTML = '<div class="empty-state">Nie udało się załadować danych</div>';
  }
}

// Orders
async function loadOrders() {
  const content = document.getElementById('content');
  try {
    const orders = await fetch(`${API}/api/zlecenia`).then(r => r.json());
    content.innerHTML = `
      <div class="table-wrapper">
        <div class="table-header"><span class="table-title">Wszystkie zlecenia (${orders.length})</span></div>
        ${orders.length ? `<table><thead><tr><th>Numer</th><th>Klient</th><th>Usługa</th><th>Status</th><th>Priorytet</th><th>Data</th></tr></thead><tbody>
          ${orders.map(o => `<tr class="clickable" onclick="showOrderDetail(${o.id})">
            <td>${o.numer}</td><td>${o.klient_nazwa || '—'}</td>
            <td>${SERVICES[o.typ_uslugi] || '—'}</td>
            <td><span class="badge badge-${o.status}">${STATUS[o.status]}</span></td>
            <td>${o.priorytet || '—'}</td><td>${new Date(o.created_at).toLocaleDateString('pl')}</td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="empty-state">Brak zleceń</div>'}
      </div>
    `;
  } catch(err) { content.innerHTML = '<div class="empty-state">Błąd ładowania</div>'; }
}

// Clients
async function loadClients() {
  const content = document.getElementById('content');
  try {
    const clients = await fetch(`${API}/api/klienci`).then(r => r.json());
    content.innerHTML = `
      <div class="table-wrapper">
        <div class="table-header"><span class="table-title">Klienci (${clients.length})</span></div>
        ${clients.length ? `<table><thead><tr><th>Nazwa</th><th>Typ</th><th>Kontakt</th><th>Telefon</th><th>Email</th></tr></thead><tbody>
          ${clients.map(c => `<tr>
            <td><strong>${c.nazwa}</strong></td><td>${CTYPES[c.typ] || c.typ || '—'}</td>
            <td>${c.osoba_kontaktowa || '—'}</td><td>${c.telefon || '—'}</td><td>${c.email || '—'}</td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="empty-state">Brak klientów</div>'}
      </div>
    `;
  } catch(err) { content.innerHTML = '<div class="empty-state">Błąd ładowania</div>'; }
}

// Order detail modal
async function showOrderDetail(id) {
  try {
    const order = await fetch(`${API}/api/zlecenia/${id}`).then(r => r.json());
    const statusOptions = Object.entries(STATUS).map(([k,v]) => `<option value="${k}" ${k===order.status?'selected':''}>${v}</option>`).join('');
    
    openModal(`Zlecenie ${order.numer}`, `
      <div style="display:grid;gap:1rem;">
        <div><span class="form-label">Status</span>
          <select class="form-select" id="detail-status">${statusOptions}</select>
        </div>
        <div><span class="form-label">Klient</span><div>${order.klient_nazwa || '—'}</div></div>
        <div><span class="form-label">Usługa</span><div>${SERVICES[order.typ_uslugi] || '—'}</div></div>
        <div><span class="form-label">Priorytet</span><div>${order.priorytet || '—'}</div></div>
        ${order.opis ? `<div><span class="form-label">Opis</span><div>${order.opis}</div></div>` : ''}
        ${order.adres_realizacji ? `<div><span class="form-label">Adres</span><div>${order.adres_realizacji}</div></div>` : ''}
        ${order.historia?.length ? `<div><span class="form-label">Historia</span>
          ${order.historia.map(h => `<div style="padding:0.3rem 0;font-size:0.85rem;color:var(--text-secondary);">${h.opis} <span style="color:var(--text-muted)">(${new Date(h.created_at).toLocaleString('pl')})</span></div>`).join('')}
        </div>` : ''}
        <div class="form-actions">
          <button class="btn-submit" onclick="updateStatus(${id})">Zapisz status</button>
          <button class="btn-cancel" onclick="closeModal()">Zamknij</button>
        </div>
      </div>
    `);
  } catch(err) { alert('Błąd ładowania szczegółów'); }
}

async function updateStatus(id) {
  const status = document.getElementById('detail-status').value;
  await fetch(`${API}/api/zlecenia/${id}/status`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, user: 'Admin Panel' })
  });
  closeModal();
  loadView(currentView);
}

// New order form
async function showNewOrderForm() {
  const clients = await fetch(`${API}/api/klienci`).then(r => r.json());
  if (!clients.length) return alert('Najpierw dodaj klienta');
  
  const clientOpts = clients.map(c => `<option value="${c.id}">${c.nazwa}</option>`).join('');
  const serviceOpts = Object.entries(SERVICES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  
  openModal('Nowe zlecenie', `
    <form onsubmit="submitOrder(event)">
      <div class="form-group"><label class="form-label">Klient</label><select class="form-select" id="f-client" required>${clientOpts}</select></div>
      <div class="form-group"><label class="form-label">Usługa</label><select class="form-select" id="f-service" required>${serviceOpts}</select></div>
      <div class="form-group"><label class="form-label">Opis</label><textarea class="form-textarea" id="f-desc"></textarea></div>
      <div class="form-group"><label class="form-label">Adres realizacji</label><input class="form-input" id="f-address"></div>
      <div class="form-group"><label class="form-label">Priorytet</label>
        <select class="form-select" id="f-priority"><option value="normalny">Normalny</option><option value="wysoki">Wysoki</option><option value="pilny">Pilny</option><option value="niski">Niski</option></select>
      </div>
      <div class="form-actions"><button type="submit" class="btn-submit">Utwórz</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitOrder(e) {
  e.preventDefault();
  await fetch(`${API}/api/zlecenia`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      klient_id: document.getElementById('f-client').value,
      typ_uslugi: document.getElementById('f-service').value,
      opis: document.getElementById('f-desc').value,
      adres_realizacji: document.getElementById('f-address').value,
      priorytet: document.getElementById('f-priority').value,
      created_by: 'Admin Panel'
    })
  });
  closeModal();
  loadView(currentView);
}

// New client form
function showNewClientForm() {
  const typeOpts = Object.entries(CTYPES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  
  openModal('Nowy klient', `
    <form onsubmit="submitClient(event)">
      <div class="form-group"><label class="form-label">Nazwa firmy *</label><input class="form-input" id="fc-name" required></div>
      <div class="form-group"><label class="form-label">Typ</label><select class="form-select" id="fc-type">${typeOpts}</select></div>
      <div class="form-group"><label class="form-label">Osoba kontaktowa</label><input class="form-input" id="fc-contact"></div>
      <div class="form-group"><label class="form-label">Telefon</label><input class="form-input" id="fc-phone"></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="fc-email" type="email"></div>
      <div class="form-group"><label class="form-label">Adres</label><input class="form-input" id="fc-address"></div>
      <div class="form-group"><label class="form-label">Notatki</label><textarea class="form-textarea" id="fc-notes"></textarea></div>
      <div class="form-actions"><button type="submit" class="btn-submit">Dodaj</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);
}

async function submitClient(e) {
  e.preventDefault();
  await fetch(`${API}/api/klienci`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nazwa: document.getElementById('fc-name').value,
      typ: document.getElementById('fc-type').value,
      osoba_kontaktowa: document.getElementById('fc-contact').value,
      telefon: document.getElementById('fc-phone').value,
      email: document.getElementById('fc-email').value,
      adres: document.getElementById('fc-address').value,
      notatki: document.getElementById('fc-notes').value,
      created_by: 'Admin Panel'
    })
  });
  closeModal();
  loadView(currentView);
}

// Init
loadView('dashboard');
