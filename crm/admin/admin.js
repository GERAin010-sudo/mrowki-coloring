/* Mrówki Coloring CRM — Admin Panel JS */

const API = '';

const STATUS = { nowe: 'Nowe', wycena: 'Wycena', zaakceptowane: 'Zaakceptowane', w_trakcie: 'W trakcie', zakonczone: 'Zakończone', anulowane: 'Anulowane' };
const SERVICES = { okna: 'Stolarka okienna', drzwi: 'Drzwi aluminiowe', fasady: 'Fasady budynków', bramy_windy: 'Bramy i windy', parapety: 'Parapety', poprawki: 'Poprawki lakiernicze', inne: 'Inne' };
const CTYPES = { deweloper: 'Deweloper', wykonawca: 'Wykonawca', producent: 'Producent', architekt: 'Architekt', montazysta: 'Montażysta', administrator: 'Administrator', inny: 'Inny' };

const CATEGORIES = { okna: 'Okna', drzwi: 'Drzwi', fasady: 'Fasady', bramy_windy: 'Bramy/Windy', parapety: 'Parapety', poprawki: 'Poprawki', inne: 'Inne' };

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
  if (currentView === 'realizacje') showUploadPhotoForm();
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
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowe zlecenie';
      loadOrders();
      break;
    case 'clients':
      title.textContent = 'Klienci';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowy klient';
      loadClients();
      break;
    case 'realizacje':
      title.textContent = 'Realizacje';
      addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Dodaj zdjęcie';
      loadRealizacje();
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
        <div class="stat-card"><div class="stat-card-label">Zdjęcia</div><div class="stat-card-value">${stats.totalPhotos || 0}</div></div>
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

// ===== REALIZACJE =====
async function loadRealizacje() {
  const content = document.getElementById('content');
  try {
    const items = await fetch(`${API}/api/realizacje/admin`).then(r => r.json());
    content.innerHTML = `
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
                <button class="btn-sm" onclick="editPhotoCategory(${item.id}, '${safeTitle}', '${safeDesc}', '${item.kategoria}', ${item.widoczny})" title="Edytuj">✏️ Edytuj</button>
                <button class="btn-sm btn-toggle" onclick="togglePhotoVisibility(${item.id}, ${item.widoczny ? 0 : 1}, '${safeTitle}', '${safeDesc}', '${item.kategoria}')" title="${item.widoczny ? 'Ukryj' : 'Pokaż'}">
                  ${item.widoczny ? '👁️' : '🚫'}
                </button>
                <button class="btn-sm btn-danger" onclick="deletePhoto(${item.id})" title="Usuń">🗑️</button>
              </div>
            </div>
          </div>
        `}).join('') : '<div class="empty-state">Brak zdjęć. Kliknij "Dodaj zdjęcie" aby dodać pierwszą realizację.</div>'}
      </div>
    `;
  } catch(err) {
    content.innerHTML = '<div class="empty-state">Błąd ładowania realizacji</div>';
  }
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
    body: JSON.stringify({
      tytul: document.getElementById('ep-title').value,
      opis: document.getElementById('ep-desc').value,
      kategoria: document.getElementById('ep-cat').value,
      widoczny: widoczny
    })
  });
  closeModal();
  loadView('realizacje');
}

function showUploadPhotoForm() {
  const catOpts = Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  openModal('Dodaj zdjęcie realizacji', `
    <form id="upload-form" onsubmit="submitPhoto(event)">
      <div class="form-group">
        <label class="form-label">Zdjęcie *</label>
        <div class="upload-drop-zone" id="drop-zone">
          <input type="file" id="f-photo" accept="image/*" required style="display:none">
          <div class="drop-zone-content" id="drop-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--accent)"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Kliknij lub przeciągnij zdjęcie</span>
            <span style="font-size:0.75rem;color:var(--text-muted)">JPG, PNG, WEBP — max 15MB</span>
          </div>
          <img id="drop-preview" style="display:none;max-width:100%;max-height:200px;border-radius:4px;">
        </div>
      </div>
      <div class="form-group"><label class="form-label">Tytuł *</label><input class="form-input" id="f-title" required placeholder="np. Lakierowanie fasady biurowca"></div>
      <div class="form-group"><label class="form-label">Opis</label><textarea class="form-textarea" id="f-desc" placeholder="Krótki opis realizacji..."></textarea></div>
      <div class="form-group"><label class="form-label">Kategoria</label><select class="form-select" id="f-cat">${catOpts}</select></div>
      <div class="form-actions"><button type="submit" class="btn-submit" id="upload-btn">Dodaj</button><button type="button" class="btn-cancel" onclick="closeModal()">Anuluj</button></div>
    </form>
  `);

  // Setup drag & drop
  const zone = document.getElementById('drop-zone');
  const input = document.getElementById('f-photo');
  const preview = document.getElementById('drop-preview');
  const dropContent = document.getElementById('drop-content');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      showPreview(e.dataTransfer.files[0]);
    }
  });
  input.addEventListener('change', () => { if (input.files[0]) showPreview(input.files[0]); });

  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
      dropContent.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

async function submitPhoto(e) {
  e.preventDefault();
  const btn = document.getElementById('upload-btn');
  btn.textContent = 'Przesyłanie...';
  btn.disabled = true;

  const formData = new FormData();
  formData.append('photo', document.getElementById('f-photo').files[0]);
  formData.append('tytul', document.getElementById('f-title').value);
  formData.append('opis', document.getElementById('f-desc').value);
  formData.append('kategoria', document.getElementById('f-cat').value);

  try {
    const res = await fetch(`${API}/api/realizacje`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    closeModal();
    loadView('realizacje');
  } catch(err) {
    alert('Błąd przesyłania: ' + err.message);
    btn.textContent = 'Dodaj';
    btn.disabled = false;
  }
}

async function togglePhotoVisibility(id, newState, tytul, opis, kategoria) {
  await fetch(`${API}/api/realizacje/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tytul, opis, kategoria, widoczny: newState })
  });
  loadView('realizacje');
}

async function deletePhoto(id) {
  if (!confirm('Na pewno usunąć to zdjęcie?')) return;
  await fetch(`${API}/api/realizacje/${id}`, { method: 'DELETE' });
  loadView('realizacje');
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
