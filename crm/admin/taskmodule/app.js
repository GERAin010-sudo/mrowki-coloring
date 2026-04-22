// ==========================================
// Mrówki group CRM — Task Management Module
// Main Application
// ==========================================

let currentPage = 'dashboard';
let currentTaskId = null;
let currentProjectId = null;
let currentWorkerName = null;
let openMenuId = null;
let currentFilter = { status: 'all', priority: 'all', assignee: 'all', category: 'all', search: '' };
let currentSort = { field: 'deadline', dir: 'asc' };
let currentPageNum = 1;
let pageSize = 10;
let weekOffset = 0;
let showArchivedProjects = false;
let currentPayrollMonth = '2026-03'; // default to current month
let projectDetailView = 'standard'; // 'standard' | 'analytics'
// Kanban filter — multi-select chips that combine. 'all' is exclusive.
// Possible values: 'mine' | 'from_me' | 'watching' | 'all'
let kanbanFilters = new Set(JSON.parse(localStorage.getItem('tm_kanban_filters') || '["all"]'));
let CURRENT_USER_ID = 1; // overridden by tmBootstrap() from /api/auth/me

// ── Router ──
function navigate(page, params = {}) {
  currentPage = page;
  if (params.taskId) currentTaskId = params.taskId;
  if (params.projectId) currentProjectId = params.projectId;
  if (params.workerName) currentWorkerName = params.workerName;
  currentPageNum = 1;
  closeAllMenus();
  render();
  let hash = page;
  if (params.taskId) hash += '/' + params.taskId;
  else if (params.projectId) hash += '/' + params.projectId;
  else if (params.workerName) hash += '/' + encodeURIComponent(params.workerName);
  window.location.hash = hash;
}

function handleHashChange() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  const parts = hash.split('/');
  currentPage = parts[0];
  if (parts[1]) {
    if (currentPage === 'project-detail') currentProjectId = parts[1];
    else if (currentPage === 'worker-detail') currentWorkerName = decodeURIComponent(parts.slice(1).join('/'));
    else currentTaskId = parseInt(parts[1]);
  }
  render();
}

// ── Close all menus ──
function closeAllMenus() {
  openMenuId = null;
  document.querySelectorAll('.action-menu.open').forEach(m => m.classList.remove('open'));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.action-menu-trigger') && !e.target.closest('.action-menu')) {
    closeAllMenus();
  }
});

// ── Main Render ──
function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar()}
      <div class="main-content">
        ${renderHeader()}
        <div class="content-area" id="content-area">
          ${renderPage()}
        </div>
      </div>
    </div>
    ${renderTaskModal()}
    <div id="toast-container"></div>
  `;
  attachEventListeners();
}

// ── Sidebar ──
function renderSidebar() {
  const visibleTasks = taskStore.getAll().filter(t => canViewTask(t, CURRENT_USER_ID));
  const attentionCount = visibleTasks.filter(t => taskStore.needsAttention(t)).length;
  const attentionBadge = attentionCount > 0 ? `<span class="sidebar-item-badge">${attentionCount}</span>` : '';

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Главная', section: '' },
    { section: 'Клиенты', divider: true },
    { id: 'ext-contractors', icon: '📋', label: 'Контрагенты', disabled: true, chevron: true },
    { id: 'ext-staffing', icon: '👥', label: 'Кадровое обеспечение', disabled: true, chevron: true },
    { id: 'ext-companies', icon: '🏢', label: 'Компании', disabled: true, chevron: true },
    { section: 'Задачи', divider: true },
    { id: 'tasks', icon: '📝', label: 'Все задачи', badge: attentionBadge },
    { id: 'kanban', icon: '📋', label: 'Канбан-доска' },
    { id: 'week', icon: '📅', label: 'Неделя' },
    { id: 'my-tasks', icon: '👤', label: 'Мои задачи' },
    { id: 'templates', icon: '📝', label: 'Шаблоны' },
    { id: 'projects', icon: '📂', label: 'Проекты', badge: PROJECTS.filter(p => p.status === 'active').length > 0 ? `<span class="sidebar-item-badge" style="background:var(--primary);">${PROJECTS.filter(p => p.status === 'active').length}</span>` : '' },
    { section: 'Система', divider: true },
    { id: 'ext-users', icon: '⚙️', label: 'Пользователи', disabled: true, chevron: true },
  ];

  const user = getUserById(CURRENT_USER_ID);
  const accessInfo = ACCESS_LEVELS[user.accessLevel] || ACCESS_LEVELS.employee;

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">🐜</div>
        <div class="sidebar-logo-text">Mrówki group</div>
      </div>
      <nav>
        ${menuItems.map(item => {
    if (item.divider) {
      return `<div class="sidebar-section"><div class="sidebar-section-title">${item.section}</div></div>`;
    }
    const isActive = item.id === currentPage ||
      (item.id === 'tasks' && currentPage === 'task-detail') ||
      (item.id === 'my-tasks' && currentPage === 'my-tasks') ||
      (item.id === 'projects' && currentPage === 'project-detail');
    const cls = `sidebar-item${isActive ? ' active' : ''}${item.disabled ? ' disabled' : ''}`;
    return `
            <div class="sidebar-section" style="padding:0 12px;">
              <div class="${cls}" onclick="${item.disabled ? '' : `navigate('${item.id}')`}" 
                   style="${item.disabled ? 'opacity:0.5;cursor:default;' : ''}">
                <span class="sidebar-item-icon">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge || ''}
                ${item.chevron ? '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);">›</span>' : ''}
              </div>
            </div>`;
  }).join('')}
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar" style="background:${user.color}">${user.avatar}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user.name}</div>
            <div class="sidebar-user-email">${user.role} · ${user.email}</div>
          </div>
        </div>
      </div>
    </aside>`;
}

// ── Header ──
function renderHeader() {
  const titles = {
    'dashboard': 'Главная',
    'tasks': 'Все задачи',
    'kanban': 'Канбан-доска',
    'week': 'Неделя',
    'my-tasks': 'Мои задачи',
    'templates': 'Шаблоны',
    'task-detail': 'Задача',
    'projects': 'Проекты',
    'project-detail': 'Проект',
  };

  let breadcrumbs;
  if (currentPage === 'task-detail' && currentTaskId) {
    breadcrumbs = `<div class="header-breadcrumb">
         <a href="#" onclick="navigate('tasks');return false;">Задачи</a>
         <span class="header-breadcrumb-sep">/</span>
         <span class="header-breadcrumb-current">#${currentTaskId}</span>
       </div>`;
  } else if (currentPage === 'project-detail' && currentProjectId) {
    const proj = getProjectById(currentProjectId);
    breadcrumbs = `<div class="header-breadcrumb">
         <a href="#" onclick="navigate('projects');return false;">Проекты</a>
         <span class="header-breadcrumb-sep">/</span>
         <span class="header-breadcrumb-current">${proj ? proj.name : currentProjectId}</span>
       </div>`;
  } else {
    breadcrumbs = `<div class="header-title">${titles[currentPage] || 'Задачи'}</div>`;
  }

  const showViewToggle = ['tasks', 'my-tasks', 'week'].includes(currentPage);
  const showSearch = ['tasks', 'my-tasks', 'kanban', 'week'].includes(currentPage);
  const showNewTask = ['tasks', 'kanban', 'my-tasks', 'dashboard', 'week'].includes(currentPage);

  return `
    <header class="header">
      ${breadcrumbs}
      <div class="header-actions">
        ${showSearch ? `
          <div class="header-search">
            <span class="header-search-icon">🔍</span>
            <input type="text" placeholder="Введите поисковый запрос" id="search-input" 
                   value="${escapeHtml(currentFilter.search)}" oninput="handleSearch(this.value)">
          </div>` : ''}
        ${showViewToggle ? `
          <div class="view-toggle">
            <button class="view-toggle-btn ${currentPage === 'tasks' || currentPage === 'my-tasks' ? 'active' : ''}" 
                    onclick="navigate('${currentPage === 'my-tasks' ? 'my-tasks' : 'tasks'}')" title="Таблица">⊞</button>
            <button class="view-toggle-btn ${currentPage === 'kanban' ? 'active' : ''}" 
                    onclick="navigate('kanban')" title="Канбан">☰</button>
            <button class="view-toggle-btn ${currentPage === 'week' ? 'active' : ''}" 
                    onclick="navigate('week')" title="Неделя">📅</button>
          </div>` : ''}
        ${showNewTask ? `<button class="btn btn-primary" onclick="openTaskModal()">+ Задача</button>` : ''}
      </div>
    </header>`;
}

// ── Page Router ──
function renderPage() {
  switch (currentPage) {
    case 'dashboard': return renderDashboard();
    case 'tasks': return renderTaskList(false);
    case 'my-tasks': return renderTaskList(true);
    case 'kanban': return renderKanban();
    case 'week': return renderWeekView();
    case 'templates': return renderTemplatesPage();
    case 'task-detail': return renderTaskDetail();
    case 'projects': return renderProjectsPage();
    case 'project-detail': return renderProjectDetailPage();
    case 'worker-detail': return renderWorkerDetailPage();
    default: return renderDashboard();
  }
}

// ==========================================
// Dashboard — Owner View
// ==========================================
// ── Dashboard View Switcher ──
let currentDashView = localStorage.getItem('dashView') || 'classic';
function switchDashView(view) {
  currentDashView = view;
  localStorage.setItem('dashView', view);
  render();
}

// ── Shared Dashboard Data ──
function getDashData() {
  const allTasks = taskStore.getAll().filter(t => canViewTask(t, CURRENT_USER_ID));
  const payroll = getPayrollStatsCurrent(); // March (current month with forecasts)
  const prevPayroll = getPayrollStats(); // February (previous month — actual data)
  const stats = {
    total: allTasks.length,
    overdue: allTasks.filter(t => isOverdue(t.deadline, t.status)).length,
    byStatus: {},
  };
  Object.values(STATUSES).forEach(s => {
    stats.byStatus[s.id] = allTasks.filter(t => t.status === s.id).length;
  });
  const overdueTasks = allTasks
    .filter(t => isOverdue(t.deadline, t.status))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);
  const activities = [];
  allTasks.forEach(t => {
    if (t.comments) t.comments.forEach(c => {
      activities.push({ type:'comment', userId:c.userId, taskTitle:t.title, taskId:t.id, text:c.text, time:c.createdAt });
    });
    if (t.auditLog) t.auditLog.forEach(log => {
      activities.push({ type:'change', userId:log.userId, taskTitle:t.title, taskId:t.id, field:log.field, oldVal:log.from, newVal:log.to, time:log.timestamp });
    });
  });
  activities.sort((a,b) => new Date(b.time) - new Date(a.time));
  return { allTasks, payroll, prevPayroll, stats, overdueTasks, recentActivities: activities.slice(0,6) };
}

const fmtNum = n => n.toLocaleString('pl-PL');

// ── View Switcher HTML ──
function renderViewSwitcher() {
  const views = [
    { id: 'classic', icon: '📊', label: 'Классический' },
    { id: 'analytics', icon: '📈', label: 'Аналитика' },
    { id: 'executive', icon: '🏢', label: 'Руководитель' },
  ];
  return `
    <div class="dash-view-switcher">
      ${views.map(v => `
        <button class="dash-view-btn ${currentDashView === v.id ? 'active' : ''}" onclick="switchDashView('${v.id}')">
          <span class="dash-view-icon">${v.icon}</span>
          <span class="dash-view-label">${v.label}</span>
        </button>
      `).join('')}
    </div>`;
}

// ══════════════════════════════════════════
// VIEW 1: CLASSIC (existing layout)
// ══════════════════════════════════════════
function renderDashClassic(d) {
  const { payroll, prevPayroll, stats, overdueTasks, recentActivities } = d;
  const isFc = payroll.isForecast;
  const fcBadge = isFc ? ' <span style="font-size:9px;padding:1px 5px;border-radius:4px;background:#fef3c7;color:#92400e;margin-left:4px;vertical-align:middle;">📈 Прогноз</span>' : '';
  // Calculate comparison arrows vs previous month
  const cmpArrow = (cur, prev) => {
    if (!prev || prev === 0) return { html: '', pct: 0 };
    const pct = Math.round(((cur - prev) / prev) * 100);
    if (pct > 0) return { html: `<span style="font-size:11px;font-weight:600;color:#15803d;">↑ +${pct}%</span>`, pct };
    if (pct < 0) return { html: `<span style="font-size:11px;font-weight:600;color:#dc2626;">↓ ${pct}%</span>`, pct };
    return { html: `<span style="font-size:11px;font-weight:600;color:#6b7280;">→ 0%</span>`, pct: 0 };
  };
  const aW = cmpArrow(payroll.totalWorkers, prevPayroll.totalWorkers);
  const aH = cmpArrow(payroll.totalHours, prevPayroll.totalHours);
  const aP = cmpArrow(payroll.totalPayroll, prevPayroll.totalPayroll);
  const aR = cmpArrow(payroll.totalRevenue, prevPayroll.totalRevenue);

  const kpiCards = [
    { icon:'📂', label:'Активные проекты', value:payroll.totalProjects, sub:'2 координатора', bg:'#dbeafe', color:'#1e40af', arrow:'' },
    { icon:'👥', label:'Работники', value:payroll.totalWorkers, sub:`на подрядах (${payroll.month})${fcBadge}`, bg:'#d1fae5', color:'#059669', arrow:aW.html },
    { icon:'⏱️', label:'Часы за месяц', value:fmtNum(Math.round(payroll.totalHours)), sub:`${payroll.month}${fcBadge}`, bg:'#ede9fe', color:'#7c3aed', arrow:aH.html },
    { icon:'💰', label:'Зарплатный фонд', value:fmtNum(Math.round(payroll.totalPayroll))+' zł', sub:`${payroll.month}${fcBadge}`, bg:'#fef3c7', color:'#d97706', arrow:aP.html },
    { icon:'📈', label:'Доход фирмы', value:fmtNum(Math.round(payroll.totalRevenue))+' zł', sub:`маржа: ${fmtNum(Math.round(payroll.totalMargin))} zł (+${payroll.markup} zł/ч)`, bg:'#dcfce7', color:'#15803d', arrow:aR.html },
  ];
  const donutData = [
    { label:'Новые', value:stats.byStatus.new||0, color:'#6b7280' },
    { label:'В работе', value:stats.byStatus.in_progress||0, color:'#2563eb' },
    { label:'Проверка', value:stats.byStatus.review||0, color:'#d97706' },
    { label:'Готово', value:stats.byStatus.done||0, color:'#059669' },
  ];
  const donutTotal = donutData.reduce((s,dd) => s+dd.value, 0);
  const R=55, CX=70, CY=70, CIRC=2*Math.PI*R;
  let off=0;
  const donutPaths = donutData.map(dd => {
    const pct = donutTotal>0 ? dd.value/donutTotal : 0;
    const len = pct*CIRC, gap = donutTotal>0?2:0;
    const p = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${dd.color}" stroke-width="16" stroke-dasharray="${Math.max(len-gap,0)} ${CIRC}" stroke-dashoffset="-${off}" stroke-linecap="round"/>`;
    off+=len; return p;
  }).join('');
  const maxP = Math.max(...payroll.projects.map(p=>p.totalPay),1);

  return `
    <div class="dash-kpi-grid">
      ${kpiCards.map((k,i) => `
        <div class="dash-kpi-card" style="animation-delay:${i*60}ms${isFc && i > 0 ? ';border:1px dashed #d9770640;' : ''}">
          <div class="dash-kpi-icon" style="background:${k.bg};color:${k.color}">${k.icon}</div>
          <div class="dash-kpi-info">
            <div class="dash-kpi-label" style="display:flex;justify-content:space-between;align-items:center;">${k.label} ${k.arrow}</div>
            <div class="dash-kpi-value">${k.value}</div>
            <div class="dash-kpi-sub">${k.sub}</div>
          </div>
        </div>`).join('')}
    </div>
    <div class="dash-analytics-grid">
      <div class="dash-card" style="animation-delay:200ms">
        <div class="dash-card-header">
          <div class="dash-card-title">💰 Зарплаты по проектам <span style="font-weight:400;font-size:12px;color:var(--text-muted)">(${payroll.month})</span>${isFc ? ' <span style="font-size:9px;padding:1px 5px;border-radius:4px;background:#fef3c7;color:#92400e;">📈 AI-прогноз</span>' : ''}</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('projects')">Все →</button>
        </div>
        <div class="dash-card-body" style="max-height:420px;overflow-y:auto">
          ${payroll.projects.map(p => {
            const pct=Math.round((p.totalPay/maxP)*100);
            const cl=p.coordinator==='kosmin'?'VK':'VKo', cc=p.coordinator==='kosmin'?'#7c3aed':'#2563eb';
            const fcIcon = p.isForecast ? ' <span style="font-size:8px;">📈</span>' : '';
            const barBg = p.isForecast ? `repeating-linear-gradient(135deg,${p.color},${p.color} 4px,${p.color}55 4px,${p.color}55 8px)` : p.color;
            return `<div class="dash-project-row" onclick="navigate('project-detail',{projectId:'${p.id}'})" style="cursor:pointer;">
              <div class="dash-project-color" style="background:${p.color}"></div>
              <div class="dash-project-info">
                <div class="dash-project-name">${escapeHtml(p.name)} <span style="display:inline-block;font-size:9px;padding:1px 5px;border-radius:3px;background:${cc};color:#fff;margin-left:4px;vertical-align:middle">${cl}</span>${fcIcon}</div>
                <div class="dash-project-meta"><span>👥 ${p.workerCount}</span><span>⏱ ${fmtNum(Math.round(p.totalHours))}ч</span><span>💰 ${fmtNum(Math.round(p.totalPay))} zł</span><span style="color:#15803d">📈 ${fmtNum(Math.round(p.totalRevenue))} zł</span></div>
              </div>
              <div class="dash-project-bar-wrap"><div class="dash-project-bar-fill" style="width:${pct}%;background:${barBg}"></div></div>
              <div class="dash-project-hours" style="min-width:70px;text-align:right;font-size:12px;font-weight:600;color:#15803d">${fmtNum(Math.round(p.totalRevenue))} zł</div>
            </div>`;}).join('')}
        </div>
      </div>
      <div class="dash-card" style="animation-delay:260ms">
        <div class="dash-card-header">
          <div class="dash-card-title">📋 Задачи по статусам</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('tasks')">Все →</button>
        </div>
        <div class="dash-card-body">
          <div class="dash-donut-wrap">
            <div class="dash-donut">
              <svg viewBox="0 0 140 140">${donutTotal===0?'<circle cx="70" cy="70" r="55" fill="none" stroke="#e2e8f0" stroke-width="16"/>':donutPaths}</svg>
              <div class="dash-donut-center"><div class="dash-donut-total">${donutTotal}</div><div class="dash-donut-label">задач</div></div>
            </div>
            <div class="dash-donut-legend">${donutData.map(dd=>`<div class="dash-legend-item"><div class="dash-legend-dot" style="background:${dd.color}"></div><span>${dd.label}</span><span class="dash-legend-value">${dd.value}</span></div>`).join('')}</div>
          </div>
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border-light)">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:var(--text-muted)">Просроченные</span><span style="font-weight:600;color:${stats.overdue>0?'var(--danger)':'var(--success)'}">${stats.overdue}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:var(--text-muted)">Всего задач</span><span style="font-weight:600">${stats.total}</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="dash-analytics-grid">
      <div class="dash-card" style="animation-delay:320ms">
        <div class="dash-card-header"><div class="dash-card-title" style="color:var(--danger)">⚠️ Просроченные задачи</div><span class="badge badge-deadline-overdue">${overdueTasks.length}</span></div>
        ${overdueTasks.length>0?overdueTasks.map(t=>{const a=getUserById(t.assigneeId);const dd=Math.ceil((new Date()-new Date(t.deadline))/(1000*60*60*24));return`<div class="dash-overdue-item" onclick="navigate('task-detail',{taskId:${t.id}})"><div class="dash-overdue-indicator"></div><div class="dash-overdue-content"><div class="dash-overdue-title">${escapeHtml(t.title)}</div><div class="dash-overdue-meta"><span>→ ${a.name}</span><span>${formatDate(t.deadline)}</span></div></div><div class="dash-overdue-days">${dd} д.</div></div>`;}).join(''):`<div class="dash-empty"><div class="dash-empty-icon">🎉</div><div class="dash-empty-text">Нет просроченных задач!</div></div>`}
      </div>
      <div class="dash-card" style="animation-delay:380ms">
        <div class="dash-card-header"><div class="dash-card-title">🕓 Последние обновления</div></div>
        ${recentActivities.length>0?recentActivities.map(a=>{const u=getUserById(a.userId);const ta=getTimeAgo(a.time);if(a.type==='comment'){return`<div class="dash-activity-item"><div class="dash-activity-avatar" style="background:${u.color}">${u.avatar}</div><div class="dash-activity-content"><div class="dash-activity-text"><strong>${u.name}</strong> прокомментировал «${escapeHtml(a.taskTitle.substring(0,40))}${a.taskTitle.length>40?'…':''}»</div><div class="dash-activity-time">${ta}</div></div></div>`;}else{const fl={status:'статус',priority:'приоритет',assigneeId:'исполнителя',deadline:'дедлайн'};return`<div class="dash-activity-item"><div class="dash-activity-avatar" style="background:${u.color}">${u.avatar}</div><div class="dash-activity-content"><div class="dash-activity-text"><strong>${u.name}</strong> изменил ${fl[a.field]||a.field} в «${escapeHtml(a.taskTitle.substring(0,35))}${a.taskTitle.length>35?'…':''}»</div><div class="dash-activity-time">${ta}</div></div></div>`;}}).join(''):`<div class="dash-empty"><div class="dash-empty-icon">📝</div><div class="dash-empty-text">Пока нет обновлений</div></div>`}
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// VIEW 2: ANALYTICS (financial breakdown)
// ══════════════════════════════════════════
function renderDashAnalytics(d) {
  const { payroll, stats, overdueTasks } = d;
  const korzhoProjects = payroll.projects.filter(p => p.coordinator === 'korzho');
  const kosminProjects = payroll.projects.filter(p => p.coordinator === 'kosmin');
  const korzhoStats = { projects: korzhoProjects.length, workers: korzhoProjects.reduce((s,p)=>s+p.workerCount,0), hours: korzhoProjects.reduce((s,p)=>s+p.totalHours,0), pay: korzhoProjects.reduce((s,p)=>s+p.totalPay,0), revenue: korzhoProjects.reduce((s,p)=>s+p.totalRevenue,0) };
  const kosminStats = { projects: kosminProjects.length, workers: kosminProjects.reduce((s,p)=>s+p.workerCount,0), hours: kosminProjects.reduce((s,p)=>s+p.totalHours,0), pay: kosminProjects.reduce((s,p)=>s+p.totalPay,0), revenue: kosminProjects.reduce((s,p)=>s+p.totalRevenue,0) };

  const marginPct = payroll.totalRevenue > 0 ? Math.round((payroll.totalMargin / payroll.totalRevenue) * 100) : 0;
  const maxRev = Math.max(...payroll.projects.map(p => p.totalRevenue), 1);

  // Build SVG bar chart for top 12 projects by revenue
  const top12 = payroll.projects.slice(0, 12);
  const barW = 50, barGap = 8, chartH = 200;
  const chartW = top12.length * (barW + barGap);
  const maxBar = Math.max(...top12.map(p => p.totalRevenue), 1);

  return `
    <!-- Financial Overview Header -->
    <div class="dv2-header">
      <div class="dv2-hero-card dv2-hero-revenue">
        <div class="dv2-hero-label">Выручка фирмы</div>
        <div class="dv2-hero-value">${fmtNum(Math.round(payroll.totalRevenue))} <span class="dv2-hero-currency">zł</span></div>
        <div class="dv2-hero-sub">${payroll.month} • +${payroll.markup} zł/ч маржа</div>
        <div class="dv2-hero-bar"><div class="dv2-hero-bar-fill" style="width:${marginPct}%"></div></div>
        <div class="dv2-hero-pct">${marginPct}% маржинальность</div>
      </div>
      <div class="dv2-hero-card dv2-hero-payroll">
        <div class="dv2-hero-label">Зарплатный фонд</div>
        <div class="dv2-hero-value">${fmtNum(Math.round(payroll.totalPayroll))} <span class="dv2-hero-currency">zł</span></div>
        <div class="dv2-hero-sub">${payroll.totalWorkers} работников • ${fmtNum(payroll.totalHours)} ч</div>
      </div>
      <div class="dv2-hero-card dv2-hero-margin">
        <div class="dv2-hero-label">Чистая маржа</div>
        <div class="dv2-hero-value" style="color:#15803d">${fmtNum(Math.round(payroll.totalMargin))} <span class="dv2-hero-currency">zł</span></div>
        <div class="dv2-hero-sub">${payroll.totalProjects} проектов • ${marginPct}%</div>
      </div>
    </div>

    <!-- Coordinator Comparison -->
    <div class="dv2-coord-grid">
      <div class="dv2-coord-card dv2-coord-korzho">
        <div class="dv2-coord-header"><div class="dv2-coord-avatar" style="background:#2563eb">VKo</div><div><div class="dv2-coord-name">Valentyn Korzhov</div><div class="dv2-coord-role">Координатор</div></div></div>
        <div class="dv2-coord-stats">
          <div class="dv2-coord-stat"><span class="dv2-coord-num">${korzhoStats.projects}</span><span class="dv2-coord-lbl">проектов</span></div>
          <div class="dv2-coord-stat"><span class="dv2-coord-num">${korzhoStats.workers}</span><span class="dv2-coord-lbl">работников</span></div>
          <div class="dv2-coord-stat"><span class="dv2-coord-num">${fmtNum(Math.round(korzhoStats.hours))}</span><span class="dv2-coord-lbl">часов</span></div>
        </div>
        <div class="dv2-coord-finance"><span>💰 ${fmtNum(Math.round(korzhoStats.pay))} zł</span><span style="color:#15803d">📈 ${fmtNum(Math.round(korzhoStats.revenue))} zł</span></div>
      </div>
      <div class="dv2-coord-card dv2-coord-kosmin">
        <div class="dv2-coord-header"><div class="dv2-coord-avatar" style="background:#7c3aed">VK</div><div><div class="dv2-coord-name">Viktor Kosmin</div><div class="dv2-coord-role">Координатор</div></div></div>
        <div class="dv2-coord-stats">
          <div class="dv2-coord-stat"><span class="dv2-coord-num">${kosminStats.projects}</span><span class="dv2-coord-lbl">проектов</span></div>
          <div class="dv2-coord-stat"><span class="dv2-coord-num">${kosminStats.workers}</span><span class="dv2-coord-lbl">работников</span></div>
          <div class="dv2-coord-stat"><span class="dv2-coord-num">${fmtNum(Math.round(kosminStats.hours))}</span><span class="dv2-coord-lbl">часов</span></div>
        </div>
        <div class="dv2-coord-finance"><span>💰 ${fmtNum(Math.round(kosminStats.pay))} zł</span><span style="color:#15803d">📈 ${fmtNum(Math.round(kosminStats.revenue))} zł</span></div>
      </div>
    </div>

    <!-- Revenue Chart + Top Projects Table -->
    <div class="dash-analytics-grid">
      <div class="dash-card">
        <div class="dash-card-header"><div class="dash-card-title">📊 Доходность по проектам (Топ-12)</div></div>
        <div class="dash-card-body">
          <div class="dv2-chart-scroll">
            <svg width="${chartW}" height="${chartH + 40}" viewBox="0 0 ${chartW} ${chartH + 40}">
              ${top12.map((p, i) => {
                const bh = (p.totalRevenue / maxBar) * chartH;
                const ph = (p.totalPay / maxBar) * chartH;
                const x = i * (barW + barGap);
                const cc = p.coordinator === 'kosmin' ? '#7c3aed' : '#2563eb';
                return `
                  <rect x="${x}" y="${chartH - bh}" width="${barW}" height="${bh}" rx="6" fill="${cc}" opacity="0.2"/>
                  <rect x="${x + 5}" y="${chartH - ph}" width="${barW - 10}" height="${ph}" rx="4" fill="${cc}"/>
                  <text x="${x + barW/2}" y="${chartH + 16}" text-anchor="middle" font-size="9" fill="var(--text-muted)">${p.name.substring(0,7)}</text>
                  <text x="${x + barW/2}" y="${chartH + 30}" text-anchor="middle" font-size="8" fill="var(--text-muted)">${Math.round(p.totalRevenue/1000)}k</text>
                `;
              }).join('')}
              <line x1="0" y1="${chartH}" x2="${chartW}" y2="${chartH}" stroke="var(--border-light)" stroke-width="1"/>
            </svg>
          </div>
          <div class="dv2-chart-legend"><span><span class="dv2-bar-swatch" style="background:#2563eb"></span> Korzhov</span><span><span class="dv2-bar-swatch" style="background:#7c3aed"></span> Kosmin</span><span style="opacity:.5"><span class="dv2-bar-swatch" style="background:#ccc"></span> Выручка (фон)</span></div>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-header"><div class="dash-card-title">🏆 Рейтинг проектов</div></div>
        <div class="dash-card-body" style="max-height:380px;overflow-y:auto">
          <table class="dv2-table">
            <thead><tr><th>#</th><th>Проект</th><th>Часы</th><th>Расход</th><th>Доход</th><th>Маржа</th></tr></thead>
            <tbody>${payroll.projects.slice(0,15).map((p,i)=>{const cc=p.coordinator==='kosmin'?'#7c3aed':'#2563eb';return`<tr><td style="color:var(--text-muted)">${i+1}</td><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cc};margin-right:6px"></span>${escapeHtml(p.name.substring(0,20))}</td><td>${fmtNum(p.totalHours)}</td><td>${fmtNum(Math.round(p.totalPay))}</td><td style="color:#15803d;font-weight:600">${fmtNum(Math.round(p.totalRevenue))}</td><td style="color:${p.margin>0?'#15803d':'#dc2626'}">${fmtNum(Math.round(p.margin))}</td></tr>`;}).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// VIEW 3: EXECUTIVE (dark accent, compact)
// ══════════════════════════════════════════
function renderDashExecutive(d) {
  const { payroll, stats, overdueTasks, recentActivities } = d;
  const marginPct = payroll.totalRevenue > 0 ? Math.round((payroll.totalMargin / payroll.totalRevenue) * 100) : 0;
  const top5 = payroll.projects.slice(0, 5);
  const maxRev5 = Math.max(...top5.map(p => p.totalRevenue), 1);

  // Radial progress SVG helper
  function radial(pct, color, size, strokeW) {
    const r = (size - strokeW) / 2, c = 2*Math.PI*r, fill = (pct/100)*c;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${strokeW}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-dasharray="${fill} ${c}" stroke-linecap="round"/>
    </svg>`;
  }

  const taskDonePct = stats.total > 0 ? Math.round(((stats.byStatus.done||0) / stats.total) * 100) : 0;
  const avgHoursPerWorker = payroll.totalWorkers > 0 ? Math.round(payroll.totalHours / payroll.totalWorkers) : 0;
  const avgPayPerWorker = payroll.totalWorkers > 0 ? Math.round(payroll.totalPayroll / payroll.totalWorkers) : 0;

  return `
    <!-- Executive Hero -->
    <div class="dv3-hero">
      <div class="dv3-hero-left">
        <div class="dv3-greeting">Mrówki Group</div>
        <div class="dv3-period">${payroll.month}</div>
        <div class="dv3-bignum">${fmtNum(Math.round(payroll.totalRevenue))} <span class="dv3-bigcur">zł</span></div>
        <div class="dv3-biglabel">общая выручка</div>
      </div>
      <div class="dv3-hero-metrics">
        <div class="dv3-radial-card">
          <div class="dv3-radial-ring">${radial(marginPct, '#34d399', 100, 8)}<div class="dv3-radial-val">${marginPct}%</div></div>
          <div class="dv3-radial-label">Маржа</div>
        </div>
        <div class="dv3-radial-card">
          <div class="dv3-radial-ring">${radial(taskDonePct, '#60a5fa', 100, 8)}<div class="dv3-radial-val">${taskDonePct}%</div></div>
          <div class="dv3-radial-label">Задачи</div>
        </div>
        <div class="dv3-radial-card">
          <div class="dv3-radial-ring">${radial(Math.min(100,Math.round(payroll.totalWorkers/3)), '#fbbf24', 100, 8)}<div class="dv3-radial-val">${payroll.totalWorkers}</div></div>
          <div class="dv3-radial-label">Работники</div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="dv3-stats-row">
      <div class="dv3-stat-pill"><div class="dv3-stat-icon" style="background:#dbeafe;color:#1e40af">📂</div><div class="dv3-stat-data"><span class="dv3-stat-num">${payroll.totalProjects}</span><span class="dv3-stat-lbl">проектов</span></div></div>
      <div class="dv3-stat-pill"><div class="dv3-stat-icon" style="background:#ede9fe;color:#7c3aed">⏱️</div><div class="dv3-stat-data"><span class="dv3-stat-num">${fmtNum(payroll.totalHours)}</span><span class="dv3-stat-lbl">часов</span></div></div>
      <div class="dv3-stat-pill"><div class="dv3-stat-icon" style="background:#fef3c7;color:#d97706">💰</div><div class="dv3-stat-data"><span class="dv3-stat-num">${fmtNum(Math.round(payroll.totalPayroll))} zł</span><span class="dv3-stat-lbl">расходы</span></div></div>
      <div class="dv3-stat-pill"><div class="dv3-stat-icon" style="background:#dcfce7;color:#15803d">📈</div><div class="dv3-stat-data"><span class="dv3-stat-num">${fmtNum(Math.round(payroll.totalMargin))} zł</span><span class="dv3-stat-lbl">маржа</span></div></div>
      <div class="dv3-stat-pill"><div class="dv3-stat-icon" style="background:#fce7f3;color:#be185d">👤</div><div class="dv3-stat-data"><span class="dv3-stat-num">~${avgHoursPerWorker} ч</span><span class="dv3-stat-lbl">на человека</span></div></div>
    </div>

    <div class="dv3-grid">
      <!-- Top Projects Dark Card -->
      <div class="dv3-dark-card">
        <div class="dv3-dark-title">🏆 Топ-5 проектов по выручке</div>
        ${top5.map((p, i) => {
          const pct = Math.round((p.totalRevenue / maxRev5) * 100);
          const cc = p.coordinator === 'kosmin' ? '#a78bfa' : '#60a5fa';
          return `
          <div class="dv3-top-item">
            <div class="dv3-top-rank" style="background:${cc}">${i + 1}</div>
            <div class="dv3-top-info">
              <div class="dv3-top-name">${escapeHtml(p.name)}</div>
              <div class="dv3-top-bar"><div class="dv3-top-bar-fill" style="width:${pct}%;background:${cc}"></div></div>
            </div>
            <div class="dv3-top-revenue">${fmtNum(Math.round(p.totalRevenue))} zł</div>
          </div>`;
        }).join('')}
      </div>

      <!-- Worker Stats + Overdue -->
      <div class="dv3-column">
        <div class="dash-card" style="flex:1">
          <div class="dash-card-header"><div class="dash-card-title">📊 Средние показатели</div></div>
          <div class="dash-card-body">
            <div class="dv3-avg-grid">
              <div class="dv3-avg-item"><span class="dv3-avg-num">${avgHoursPerWorker}</span><span class="dv3-avg-unit">ч</span><span class="dv3-avg-lbl">часов на работника</span></div>
              <div class="dv3-avg-item"><span class="dv3-avg-num">${fmtNum(avgPayPerWorker)}</span><span class="dv3-avg-unit">zł</span><span class="dv3-avg-lbl">ЗП на работника</span></div>
              <div class="dv3-avg-item"><span class="dv3-avg-num">${fmtNum(Math.round(payroll.totalPayroll / payroll.totalProjects))}</span><span class="dv3-avg-unit">zł</span><span class="dv3-avg-lbl">ЗП на проект</span></div>
              <div class="dv3-avg-item"><span class="dv3-avg-num">${fmtNum(Math.round(payroll.totalMargin / payroll.totalProjects))}</span><span class="dv3-avg-unit">zł</span><span class="dv3-avg-lbl">маржа на проект</span></div>
            </div>
          </div>
        </div>
        <div class="dash-card" style="flex:1">
          <div class="dash-card-header"><div class="dash-card-title" style="color:var(--danger)">⚠️ Просроченные</div><span class="badge badge-deadline-overdue">${overdueTasks.length}</span></div>
          ${overdueTasks.length>0?overdueTasks.slice(0,3).map(t=>{const a=getUserById(t.assigneeId);const dd=Math.ceil((new Date()-new Date(t.deadline))/(1000*60*60*24));return`<div class="dash-overdue-item" onclick="navigate('task-detail',{taskId:${t.id}})"><div class="dash-overdue-indicator"></div><div class="dash-overdue-content"><div class="dash-overdue-title">${escapeHtml(t.title)}</div><div class="dash-overdue-meta"><span>→ ${a.name}</span></div></div><div class="dash-overdue-days">${dd} д.</div></div>`;}).join(''):`<div class="dash-empty"><div class="dash-empty-icon">🎉</div><div class="dash-empty-text">Нет просроченных</div></div>`}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// MAIN DASHBOARD ROUTER
// ══════════════════════════════════════════
function renderDashboard() {
  const d = getDashData();
  let viewHtml;
  switch (currentDashView) {
    case 'analytics': viewHtml = renderDashAnalytics(d); break;
    case 'executive': viewHtml = renderDashExecutive(d); break;
    default: viewHtml = renderDashClassic(d); break;
  }
  return `<div class="animate-in">${renderViewSwitcher()}${viewHtml}</div>`;
}

// Helper: time ago
function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} д назад`;
  return formatDate(dateStr);
}

function renderMiniTaskRow(task) {
  const status = getStatusObj(task.status);
  const priority = getPriorityObj(task.priority);
  const assignee = getUserById(task.assigneeId);
  const overdue = isOverdue(task.deadline, task.status);

  return `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;transition:background 150ms ease;"
         onmouseover="this.style.background='var(--primary-lighter)'" 
         onmouseout="this.style.background='transparent'"
         onclick="navigate('task-detail', {taskId:${task.id}})">
      <div class="avatar avatar-sm" style="background:${assignee.color}">${assignee.avatar}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(task.title)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${assignee.name}</div>
      </div>
      <span class="badge badge-priority-${task.priority}" style="font-size:10px;">${priority.icon} ${priority.label}</span>
      ${overdue ? '<span class="badge badge-deadline-overdue" style="font-size:10px;">Просрочено</span>' :
      `<span style="font-size:11px;color:var(--text-muted);">${formatDate(task.deadline)}</span>`}
    </div>`;
}

// ==========================================
// Task List
// ==========================================
function renderTaskList(myTasksOnly = false) {
  let tasks = taskStore.getAll();

  // Access-level filtering: non-directors only see permitted tasks
  tasks = tasks.filter(t => canViewTask(t, CURRENT_USER_ID));

  if (myTasksOnly) {
    tasks = tasks.filter(t => t.assigneeId === CURRENT_USER_ID || (t.assigneeIds && t.assigneeIds.includes(CURRENT_USER_ID)));
  }

  // Apply filters
  if (currentFilter.status !== 'all') tasks = tasks.filter(t => t.status === currentFilter.status);
  if (currentFilter.priority !== 'all') tasks = tasks.filter(t => t.priority === currentFilter.priority);
  if (currentFilter.assignee !== 'all') tasks = tasks.filter(t => t.assigneeId === parseInt(currentFilter.assignee));
  if (currentFilter.category !== 'all') tasks = tasks.filter(t => t.category === currentFilter.category);
  if (currentFilter.search) {
    const q = currentFilter.search.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }

  // Sort
  tasks.sort((a, b) => {
    let va, vb;
    switch (currentSort.field) {
      case 'title': va = a.title; vb = b.title; break;
      case 'status': va = a.status; vb = b.status; break;
      case 'priority':
        const po = ['low', 'medium', 'high', 'critical'];
        va = po.indexOf(a.priority); vb = po.indexOf(b.priority); break;
      case 'deadline': va = a.deadline; vb = b.deadline; break;
      case 'assignee': va = getUserById(a.assigneeId).name; vb = getUserById(b.assigneeId).name; break;
      default: va = a.deadline; vb = b.deadline;
    }
    if (va < vb) return currentSort.dir === 'asc' ? -1 : 1;
    if (va > vb) return currentSort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(tasks.length / pageSize);
  const paged = tasks.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize);

  return `
    <div class="animate-in">
      <div class="table-container">
        <div class="table-toolbar">
          <div class="filter-group">
            <select class="filter-select" onchange="setFilter('status', this.value)">
              <option value="all" ${currentFilter.status === 'all' ? 'selected' : ''}>Все статусы</option>
              ${Object.values(STATUSES).map(s =>
    `<option value="${s.id}" ${currentFilter.status === s.id ? 'selected' : ''}>${s.label}</option>`
  ).join('')}
            </select>
            <select class="filter-select" onchange="setFilter('priority', this.value)">
              <option value="all" ${currentFilter.priority === 'all' ? 'selected' : ''}>Все приоритеты</option>
              ${Object.values(PRIORITIES).map(p =>
    `<option value="${p.id}" ${currentFilter.priority === p.id ? 'selected' : ''}>${p.icon} ${p.label}</option>`
  ).join('')}
            </select>
            ${!myTasksOnly ? `
              <select class="filter-select" onchange="setFilter('assignee', this.value)">
                <option value="all" ${currentFilter.assignee === 'all' ? 'selected' : ''}>Все исполнители</option>
                ${USERS.map(u =>
    `<option value="${u.id}" ${currentFilter.assignee === String(u.id) ? 'selected' : ''}>${u.name}</option>`
  ).join('')}
              </select>` : ''}
            <select class="filter-select" onchange="setFilter('category', this.value)">
              <option value="all" ${currentFilter.category === 'all' ? 'selected' : ''}>Все категории</option>
              ${CATEGORIES.map(c =>
    `<option value="${c.id}" ${currentFilter.category === c.id ? 'selected' : ''}>${c.label}</option>`
  ).join('')}
            </select>
          </div>
          ${hasActiveFilters() ?
      `<button class="btn btn-ghost btn-sm" onclick="resetFilters()">✕ Сбросить фильтры</button>` : ''}
        </div>
        
        ${paged.length ? `
          <table>
            <thead>
              <tr>
                <th onclick="toggleSort('title')" style="min-width:280px">Задача ${sortIcon('title')}</th>
                <th onclick="toggleSort('assignee')">Исполнитель ${sortIcon('assignee')}</th>
                <th onclick="toggleSort('status')">Статус ${sortIcon('status')}</th>
                <th onclick="toggleSort('priority')">Приоритет ${sortIcon('priority')}</th>
                <th>Категория</th>
                <th onclick="toggleSort('deadline')">Дедлайн ${sortIcon('deadline')}</th>
                <th style="width:44px">Действия</th>
              </tr>
            </thead>
            <tbody>
              ${paged.map((t, i) => renderTaskRow(t, i)).join('')}
            </tbody>
          </table>
          ${renderPagination(tasks.length, totalPages)}
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">Задачи не найдены</div>
            <div class="empty-state-text">Попробуйте изменить фильтры или создайте новую задачу</div>
            <button class="btn btn-primary" onclick="openTaskModal()">+ Создать задачу</button>
          </div>
        `}
      </div>
    </div>`;
}

function renderTaskRow(task, index) {
  const status = getStatusObj(task.status);
  const priority = getPriorityObj(task.priority);
  const category = getCategoryObj(task.category);
  const overdue = isOverdue(task.deadline, task.status);
  const today = isDueToday(task.deadline);
  const soon = isDueSoon(task.deadline, task.status);
  const doneSubtasks = task.subtasks.filter(s => s.done).length;
  const totalSubtasks = task.subtasks.length;

  let deadlineClass = '';
  if (overdue) deadlineClass = 'badge-deadline-overdue';
  else if (today) deadlineClass = 'badge-deadline-today';
  else if (soon) deadlineClass = 'badge-deadline-soon';

  const needsAttention = taskStore.needsAttention(task);
  const rowStyle = needsAttention ? 'border-left:3px solid var(--danger);' : '';

  // Assignee display
  let assigneeHtml;
  if (task.assigneeType === 'department' && task.departmentIds.length > 0) {
    const deptNames = task.departmentIds.map(id => getDepartmentById(id).name).join(', ');
    const groupProgress = taskStore.getGroupProgress(task);
    const progressText = task.groupType === 'each_done' && groupProgress
      ? `<span style="font-size:10px;color:var(--text-muted);margin-left:4px;">${groupProgress.completed}/${groupProgress.total}</span>`
      : '';
    const typeIcon = task.groupType === 'first_done' ? '🔹' : '🔸';
    assigneeHtml = `
      <div class="user-cell">
        <div class="avatar avatar-sm" style="background:var(--primary);font-size:11px;">👥</div>
        <span class="user-cell-name" title="${deptNames}">${typeIcon} ${deptNames}${progressText}</span>
      </div>`;
  } else if (task.assigneeType === 'team' && task.assigneeIds && task.assigneeIds.length > 0) {
    const teamAvatars = task.assigneeIds.slice(0, 3).map(uid => {
      const u = getUserById(uid);
      return `<div class="avatar avatar-sm" style="background:${u.color};margin-left:-6px;border:2px solid white;" title="${u.name}">${u.avatar}</div>`;
    }).join('');
    const extra = task.assigneeIds.length > 3 ? `<span style="font-size:10px;color:var(--text-muted);margin-left:4px;">+${task.assigneeIds.length - 3}</span>` : '';
    assigneeHtml = `
      <div class="user-cell">
        <div style="display:flex;margin-left:6px;">${teamAvatars}</div>
        ${extra}
        <span class="user-cell-name" style="margin-left:4px;">Команда (${task.assigneeIds.length})</span>
      </div>`;
  } else {
    const assignee = getUserById(task.assigneeIds ? task.assigneeIds[0] : task.assigneeId);
    assigneeHtml = `
      <div class="user-cell">
        <div class="avatar avatar-sm" style="background:${assignee.color}">${assignee.avatar}</div>
        <span class="user-cell-name">${assignee.name}</span>
      </div>`;
  }

  // Watcher dots
  const watcherDots = task.watcherIds && task.watcherIds.length > 0
    ? `<div style="display:flex;gap:-4px;margin-left:4px;">${task.watcherIds.slice(0, 3).map(wId => {
      const w = getUserById(wId);
      return `<div class="avatar" style="background:${w.color};width:16px;height:16px;font-size:7px;border:1px solid white;margin-left:-4px;" title="👁 ${w.name}">${w.avatar}</div>`;
    }).join('')}${task.watcherIds.length > 3 ? `<span style="font-size:9px;color:var(--text-muted);margin-left:2px;">+${task.watcherIds.length - 3}</span>` : ''}</div>`
    : '';

  // Project badge
  const project = task.projectId ? getProjectById(task.projectId) : null;
  const projectBadge = project
    ? `<span class="badge" style="background:${project.color}15;color:${project.color};font-size:9px;margin-left:6px;white-space:nowrap;" title="${project.name}">📂 ${project.name.length > 20 ? project.name.slice(0, 20) + '…' : project.name}</span>`
    : '';

  return `
    <tr class="stagger-${Math.min(index + 1, 5)}" onclick="navigate('task-detail', {taskId:${task.id}})" style="${rowStyle}">
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          ${needsAttention ? `<span style="font-size:14px;flex-shrink:0;" title="Требует внимания!">🔴</span>` : ''}
          <div class="table-task-title">${escapeHtml(task.title)}${projectBadge}</div>
          ${totalSubtasks > 0 ? `<span style="font-size:11px;color:var(--text-muted);white-space:nowrap;">${doneSubtasks}/${totalSubtasks}</span>` : ''}
          ${watcherDots}
        </div>
      </td>
      <td>${assigneeHtml}</td>
      <td><span class="badge badge-status-${task.status}">${status.label}</span></td>
      <td><span class="badge badge-priority-${task.priority}">${priority.icon} ${priority.label}</span></td>
      <td><span class="badge" style="background:${category.color}15;color:${category.color}">${category.label}</span></td>
      <td>
        <span class="${deadlineClass ? 'badge ' + deadlineClass : ''}" style="${!deadlineClass ? 'font-size:13px;' : ''}">
          ${overdue ? '⚠ ' : ''}${formatDate(task.deadline)}
        </span>
      </td>
      <td onclick="event.stopPropagation();" style="position:relative;">
        <button class="action-menu-trigger" onclick="toggleActionMenu(${task.id}, event)">⋮</button>
        <div class="action-menu" id="action-menu-${task.id}">
          <button class="action-menu-item" onclick="openTaskModal(${task.id})">✏️ Редактировать</button>
          <button class="action-menu-item" onclick="changeTaskStatus(${task.id}, 'in_progress')">🔄 В работу</button>
          <button class="action-menu-item" onclick="changeTaskStatus(${task.id}, 'done')">✅ Выполнена</button>
          <div class="action-menu-divider"></div>
          <button class="action-menu-item danger" onclick="deleteTask(${task.id})">🗑 Удалить</button>
        </div>
      </td>
    </tr>`;
}

function renderPagination(total, totalPages) {
  const start = (currentPageNum - 1) * pageSize + 1;
  const end = Math.min(currentPageNum * pageSize, total);

  let pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPageNum) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return `
    <div class="pagination">
      <div class="pagination-info">
        <span>Показано</span>
        <select class="filter-select" style="width:60px;" onchange="changePageSize(this.value)">
          <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
          <option value="20" ${pageSize === 20 ? 'selected' : ''}>20</option>
          <option value="30" ${pageSize === 30 ? 'selected' : ''}>30</option>
        </select>
        <span>из ${total} записей</span>
      </div>
      <div class="pagination-pages">
        <button class="pagination-btn" onclick="goToPage(${currentPageNum - 1})" ${currentPageNum === 1 ? 'disabled' : ''}>‹ Назад</button>
        ${pages.map(p => p === '...' ? '<span style="padding:0 4px;color:var(--text-muted)">…</span>' :
    `<button class="pagination-btn ${p === currentPageNum ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`
  ).join('')}
        <button class="pagination-btn" onclick="goToPage(${currentPageNum + 1})" ${currentPageNum === totalPages ? 'disabled' : ''}>Вперёд ›</button>
      </div>
    </div>`;
}

// ==========================================
// Kanban Board
// ==========================================
function renderKanban() {
  const me = getUserById(CURRENT_USER_ID);
  let tasks = taskStore.getAll();

  // Predicates
  const isMine = t => t.assigneeId === CURRENT_USER_ID || (t.assigneeIds && t.assigneeIds.includes(CURRENT_USER_ID));
  const isFromMe = t => t.creatorId === CURRENT_USER_ID;
  const isWatching = t => Array.isArray(t.watcherIds) && t.watcherIds.includes(CURRENT_USER_ID);

  if (kanbanFilters.has('all')) {
    // All accessible tasks (respects role-based visibility)
    tasks = tasks.filter(t => canViewTask(t, CURRENT_USER_ID));
  } else {
    // Union of selected chip predicates — start empty, add matches
    tasks = tasks.filter(t => {
      if (!canViewTask(t, CURRENT_USER_ID)) return false;
      if (kanbanFilters.has('mine') && isMine(t)) return true;
      if (kanbanFilters.has('from_me') && isFromMe(t)) return true;
      if (kanbanFilters.has('watching') && isWatching(t)) return true;
      return false;
    });
  }

  if (currentFilter.search) {
    const q = currentFilter.search.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
  }

  const columns = Object.values(STATUSES).map(status => ({
    ...status,
    tasks: tasks.filter(t => t.status === status.id),
  }));

  const chip = (id, icon, label) => `<button class="scope-tab ${kanbanFilters.has(id)?'active':''}" onclick="toggleKanbanFilter('${id}')">${icon} ${label}</button>`;
  const scopeTabs = `
    <div class="kanban-scope-tabs">
      ${chip('mine', '👤', 'Мои')}
      ${chip('from_me', '✉️', 'От меня')}
      ${chip('watching', '👁', 'Слежу')}
      <div class="scope-divider"></div>
      ${chip('all', '🌐', 'Все')}
      <span class="scope-count">${tasks.length} задач</span>
    </div>
  `;

  return `
    ${scopeTabs}
    <div class="kanban-board animate-in">
      ${columns.map(col => `
        <div class="kanban-column">
          <div class="kanban-column-header">
            <div class="kanban-column-title">
              <span style="color:${col.color}">●</span>
              ${col.label}
              <span class="kanban-column-count">${col.tasks.length}</span>
            </div>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openTaskModal(null, '${col.id}')" title="Добавить задачу">+</button>
          </div>
          <div class="kanban-column-body" 
               id="kanban-col-${col.id}"
               ondragover="handleDragOver(event)" 
               ondragleave="handleDragLeave(event)"
               ondrop="handleDrop(event, '${col.id}')">
            ${col.tasks.map(t => renderKanbanCard(t)).join('')}
            ${col.tasks.length === 0 ? '<div style="text-align:center;padding:20px;font-size:12px;color:var(--text-muted);border:2px dashed var(--border);border-radius:var(--radius);margin-top:4px;">Перетащите задачу сюда</div>' : ''}
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderKanbanCard(task) {
  const priority = getPriorityObj(task.priority);
  const category = getCategoryObj(task.category);
  const overdue = isOverdue(task.deadline, task.status);
  const doneSubtasks = task.subtasks.filter(s => s.done).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0;

  let assigneeChip;
  if (task.assigneeType === 'department' && task.departmentIds.length > 0) {
    const groupProgress = taskStore.getGroupProgress(task);
    const progressInfo = task.groupType === 'each_done' && groupProgress ? ` ${groupProgress.completed}/${groupProgress.total}` : '';
    assigneeChip = `<div class="avatar avatar-sm" style="background:var(--primary);width:22px;height:22px;font-size:10px;">👥</div>
      <span style="font-size:10px;color:var(--text-muted);">${progressInfo}</span>`;
  } else {
    const assignee = getUserById(task.assigneeId);
    assigneeChip = `<div class="avatar avatar-sm" style="background:${assignee.color};width:22px;height:22px;font-size:9px;">${assignee.avatar}</div>`;
  }

  return `
    <div class="kanban-card" draggable="true" 
         ondragstart="handleDragStart(event, ${task.id})"
         ondragend="handleDragEnd(event)"
         onclick="navigate('task-detail', {taskId:${task.id}})">
      <div class="kanban-card-meta">
        <span class="badge badge-priority-${task.priority}" style="font-size:10px;">${priority.icon} ${priority.label}</span>
        <span class="badge" style="background:${category.color}15;color:${category.color};font-size:10px;">${category.label}</span>
      </div>
      <div class="kanban-card-title" style="margin-top:8px;">${escapeHtml(task.title)}</div>
      <div class="kanban-card-footer">
        <div style="display:flex;align-items:center;gap:6px;">
          ${assigneeChip}
          <span style="font-size:11px;color:var(--text-muted);">${overdue ? '⚠ ' : ''}${formatDate(task.deadline)}</span>
        </div>
        ${totalSubtasks > 0 ? `
          <div class="kanban-card-progress">
            <div class="progress-bar">
              <div class="progress-bar-fill ${progress === 100 ? 'complete' : ''}" style="width:${progress}%"></div>
            </div>
            <span>${doneSubtasks}/${totalSubtasks}</span>
          </div>` : ''}
      </div>
    </div>`;
}

// Drag & Drop
let draggedTaskId = null;

function toggleKanbanFilter(id) {
  if (id === 'all') {
    // "Все" — exclusive: selecting it clears the others
    kanbanFilters.clear();
    kanbanFilters.add('all');
  } else {
    // Toggle the chip; remove 'all' if any other chip is active
    kanbanFilters.delete('all');
    if (kanbanFilters.has(id)) kanbanFilters.delete(id);
    else kanbanFilters.add(id);
    // If nothing selected, fall back to 'all'
    if (kanbanFilters.size === 0) kanbanFilters.add('all');
  }
  localStorage.setItem('tm_kanban_filters', JSON.stringify([...kanbanFilters]));
  render();
}

function handleDragStart(e, taskId) {
  draggedTaskId = taskId;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, newStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (draggedTaskId) {
    const task = taskStore.getById(draggedTaskId);
    if (task && task.status !== newStatus) {
      taskStore.update(draggedTaskId, { status: newStatus });
      const statusObj = getStatusObj(newStatus);
      showToast(`Задача перемещена: ${statusObj.label}`);
      render();
    }
  }
  draggedTaskId = null;
}

// ==========================================
// Projects Page
// ==========================================
function renderProjectsPage() {
  const allTasks = taskStore.getAll().filter(t => canViewTask(t, CURRENT_USER_ID));
  const activeProjects = PROJECTS.filter(p => p.status !== 'archived');
  const archivedProjects = PROJECTS.filter(p => p.status === 'archived');
  const visibleProjects = showArchivedProjects ? archivedProjects : activeProjects;
  const fN = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return `
    <div class="animate-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:14px;color:var(--text-muted);">${visibleProjects.length} проектов</div>
          <div style="display:flex;gap:4px;">
            <button class="btn ${!showArchivedProjects ? 'btn-primary' : 'btn-secondary'} btn-sm"
                    onclick="toggleShowArchived(false)">Активные (${activeProjects.length})</button>
            <button class="btn ${showArchivedProjects ? 'btn-primary' : 'btn-secondary'} btn-sm"
                    onclick="toggleShowArchived(true)">🗂️ Архив (${archivedProjects.length})</button>
          </div>
        </div>
        <button class="btn btn-primary" onclick="openProjectModal()">+ Новый проект</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(380px, 1fr));gap:20px;">
        ${visibleProjects.map((project, i) => {
    const projectTasks = allTasks.filter(t => t.projectId === project.id);
    const doneTasks = projectTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = projectTasks.filter(t => isOverdue(t.deadline, t.status)).length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Payroll data
    const pd = getProjectPayrollDetail(project.id);
    const hasPayroll = pd.hasData && pd.totals.workers > 0;
    const coordLabel = pd.coordinator === 'kosmin' ? 'VK' : 'VKo';
    const coordColor = pd.coordinator === 'kosmin' ? '#7c3aed' : '#2563eb';
    const coordName = pd.coordinator === 'kosmin' ? 'Viktor Kosmin' : 'Valentyn Korzhov';

    // Unique CRM team members
    const memberIds = new Set();
    projectTasks.forEach(t => {
      if (t.assigneeIds) t.assigneeIds.forEach(id => memberIds.add(id));
      else if (t.assigneeId) memberIds.add(t.assigneeId);
    });
    const members = [...memberIds].map(id => getUserById(id));

    const statusLabel = project.status === 'active'
      ? '<span class="badge" style="background:#dcfce7;color:#059669;">Активный</span>'
      : project.status === 'planned'
        ? '<span class="badge" style="background:#dbeafe;color:#2563eb;">Планируется</span>'
        : project.status === 'archived'
          ? '<span class="badge" style="background:#fef3c7;color:#d97706;">🗂️ Архив</span>'
          : '<span class="badge" style="background:#f3f4f6;color:#6b7280;">Завершён</span>';

    return `
            <div class="card stagger-${Math.min(i + 1, 5)} plist-card"
                 onclick="navigate('project-detail', {projectId:'${project.id}'})">
              <div class="card-body" style="padding:20px;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:40px;height:40px;border-radius:12px;background:${project.color}15;color:${project.color};display:flex;align-items:center;justify-content:center;font-size:18px;">📂</div>
                    <div>
                      <div style="font-weight:600;font-size:15px;color:var(--text-primary);">${project.name}</div>
                      <div style="font-size:11px;color:var(--text-muted);margin-top:2px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${project.description}</div>
                    </div>
                  </div>
                  ${statusLabel}
                </div>

                ${hasPayroll ? `
                <!-- Coordinator Badge -->
                <div class="plist-coord">
                  <div class="plist-coord-badge" style="background:${coordColor};">${coordLabel}</div>
                  <span>${coordName}</span>
                </div>

                <!-- Financial Stats -->
                <div class="plist-finance-grid">
                  <div class="plist-fin-item">
                    <span class="plist-fin-icon">👷</span>
                    <div>
                      <div class="plist-fin-val">${pd.totals.workers}</div>
                      <div class="plist-fin-lbl">работн.</div>
                    </div>
                  </div>
                  <div class="plist-fin-item">
                    <span class="plist-fin-icon">⏱</span>
                    <div>
                      <div class="plist-fin-val">${fN(pd.totals.hours)}</div>
                      <div class="plist-fin-lbl">часов</div>
                    </div>
                  </div>
                  <div class="plist-fin-item">
                    <span class="plist-fin-icon">💸</span>
                    <div>
                      <div class="plist-fin-val" style="color:#d97706;">${fN(pd.totals.pay)}</div>
                      <div class="plist-fin-lbl">ЗП, zł</div>
                    </div>
                  </div>
                  <div class="plist-fin-item">
                    <span class="plist-fin-icon">📈</span>
                    <div>
                      <div class="plist-fin-val" style="color:#15803d;">${fN(pd.totals.revenue)}</div>
                      <div class="plist-fin-lbl">доход, zł</div>
                    </div>
                  </div>
                </div>

                <!-- Margin Bar -->
                <div class="plist-margin-row">
                  <div class="plist-margin-bar">
                    <div class="plist-margin-fill" style="width:${pd.totals.marginPct}%;"></div>
                  </div>
                  <span class="plist-margin-text">маржа ${fN(pd.totals.margin)} zł (${pd.totals.marginPct}%)</span>
                </div>
                ` : `
                <div style="padding:8px 0;font-size:11px;color:var(--text-muted);font-style:italic;">Нет данных о зарплатах</div>
                `}

                <div style="margin:12px 0 0;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:12px;color:var(--text-muted);">Задачи</span>
                    <span style="font-size:12px;font-weight:600;color:${project.color};">${progress}%</span>
                  </div>
                  <div class="progress-bar" style="height:6px;border-radius:3px;">
                    <div class="progress-bar-fill ${progress === 100 ? 'complete' : ''}" 
                         style="width:${progress}%;background:${project.color};border-radius:3px;transition:width 500ms ease;"></div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-light);">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:13px;">📋</span>
                    <span style="font-size:12px;font-weight:500;">${totalTasks}</span>
                    <span style="font-size:10px;color:var(--text-muted);">задач</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:13px;">✅</span>
                    <span style="font-size:12px;font-weight:500;color:var(--success);">${doneTasks}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:13px;">🔄</span>
                    <span style="font-size:12px;font-weight:500;color:var(--info);">${inProgressTasks}</span>
                  </div>
                  ${overdueTasks > 0 ? `<div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:13px;">⚠️</span>
                    <span style="font-size:12px;font-weight:500;color:var(--danger);">${overdueTasks}</span>
                  </div>` : ''}
                  <div style="flex:1;"></div>
                  ${members.slice(0, 4).map(m =>
      `<div class="avatar" style="background:${m.color};width:22px;height:22px;font-size:8px;margin-left:-6px;border:2px solid white;" title="${m.name}">${m.avatar}</div>`
    ).join('')}
                  ${members.length > 4 ? `<span style="font-size:9px;color:var(--text-muted);">+${members.length - 4}</span>` : ''}
                </div>
              </div>
            </div>`;
  }).join('')}
      </div>
    </div>`;
}

function renderProjectDetailPage() {
  const project = getProjectById(currentProjectId);
  if (!project) return '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-title">Проект не найден</div></div>';

  const allTasks = taskStore.getAll().filter(t => canViewTask(t, CURRENT_USER_ID));
  const projectTasks = allTasks.filter(t => t.projectId === project.id);
  const doneTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Unique CRM members
  const memberIds = new Set();
  projectTasks.forEach(t => {
    if (t.assigneeIds) t.assigneeIds.forEach(id => memberIds.add(id));
    else if (t.assigneeId) memberIds.add(t.assigneeId);
  });
  const members = [...memberIds].map(id => getUserById(id));

  // Status counts
  const statusCounts = {};
  Object.values(STATUSES).forEach(s => {
    statusCounts[s.id] = projectTasks.filter(t => t.status === s.id).length;
  });

  // ── Payroll Data ──
  const payroll = getProjectPayrollDetail(project.id, currentPayrollMonth);
  const fN = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fN2 = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Financial Stats Block ──
  const renderPayrollBlock = () => {
    const monthButtons = PAYROLL_MONTHS.map(m =>
      `<button class="ppd-month-btn ${currentPayrollMonth === m.key ? 'active' : ''}"
              onclick="currentPayrollMonth='${m.key}';render()">${m.label}</button>`
    ).join('');

    if (!payroll.hasData) {
      return `
        <div class="card ppd-payroll-card" style="margin-top:20px;">
          <div class="card-header">
            <span class="card-title">💰 Финансы и Работники</span>
            <div class="ppd-month-switcher">${monthButtons}</div>
          </div>
          <div class="card-body" style="padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;opacity:.3;">📭</div>
            <div style="color:var(--text-muted);font-size:14px;">Нет данных за ${payroll.month}</div>
            <div style="color:var(--text-muted);font-size:12px;margin-top:4px;">Данные появятся после загрузки табеля</div>
          </div>
        </div>`;
    }

    const t = payroll.totals;
    const maxH = Math.max(...payroll.workers.map(w => w.hours));

    return `
      <div class="card ppd-payroll-card" style="margin-top:20px;${payroll.isForecast ? 'border:1.5px dashed #d97706;' : ''}">
        <div class="card-header">
          <span class="card-title">💰 Финансы и Работники — ${payroll.month}${payroll.isForecast ? ' <span style="font-size:11px;padding:2px 8px;background:#fef3c7;color:#92400e;border-radius:6px;margin-left:8px;font-weight:500;">📈 AI-прогноз на основе Янв/Фев</span>' : ''}</span>
          <div class="ppd-month-switcher">${monthButtons}</div>
        </div>
        <div class="card-body" style="padding:0;">
          <!-- KPI Stats Row -->
          <div class="ppd-kpi-row">
            <div class="ppd-kpi">
              <div class="ppd-kpi-icon" style="background:#dbeafe;color:#2563eb;">👷</div>
              <div class="ppd-kpi-data">
                <div class="ppd-kpi-val">${t.workers}</div>
                <div class="ppd-kpi-lbl">работников</div>
              </div>
            </div>
            <div class="ppd-kpi">
              <div class="ppd-kpi-icon" style="background:#fef3c7;color:#d97706;">⏱</div>
              <div class="ppd-kpi-data">
                <div class="ppd-kpi-val">${fN(t.hours)}</div>
                <div class="ppd-kpi-lbl">часов</div>
              </div>
            </div>
            <div class="ppd-kpi">
              <div class="ppd-kpi-icon" style="background:#fee2e2;color:#dc2626;">💸</div>
              <div class="ppd-kpi-data">
                <div class="ppd-kpi-val">${fN(t.pay)} <small>zł</small></div>
                <div class="ppd-kpi-lbl">зарплатный фонд</div>
              </div>
            </div>
            <div class="ppd-kpi ppd-kpi-revenue">
              <div class="ppd-kpi-icon" style="background:#dcfce7;color:#15803d;">📈</div>
              <div class="ppd-kpi-data">
                <div class="ppd-kpi-val">${fN(t.revenue)} <small>zł</small></div>
                <div class="ppd-kpi-lbl">доход · маржа ${fN(t.margin)} zł (${t.marginPct}%)</div>
              </div>
            </div>
          </div>

          <!-- Workers Table -->
          <div class="ppd-table-wrap">
            <table class="ppd-table">
              <thead>
                <tr>
                  <th style="width:28px;">#</th>
                  <th>Работник</th>
                  ${payroll.hasDayNight ? '<th>Часы (день)</th><th>Часы (ночь)</th>' : ''}
                  <th>Часы</th>
                  <th>Ставка</th>
                  <th>Зарплата</th>
                  <th>Доход</th>
                  <th>Маржа</th>
                  <th style="width:120px;">Нагрузка</th>
                </tr>
              </thead>
              <tbody>
                ${payroll.workers.map((w, i) => {
                  const pct = Math.round((w.hours / maxH) * 100);
                  const barColor = pct > 80 ? '#15803d' : pct > 50 ? '#2563eb' : '#d97706';
                  return `
                  <tr>
                    <td style="color:var(--text-muted);font-weight:600;">${i + 1}</td>
                    <td>
                      <div class="ppd-worker-name" style="cursor:pointer;color:var(--primary);" onclick="navigate('worker-detail',{workerName:'${w.name.replace(/'/g,"\\'")}'})" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${w.name}</div>
                      ${w.sub ? `<span class="ppd-worker-sub">${w.sub}</span>` : ''}
                    </td>
                    ${payroll.hasDayNight ? `<td>${fN2(w.hoursDay)}</td><td>${fN2(w.hoursNight)}</td>` : ''}
                    <td style="font-weight:600;">${fN2(w.hours)}</td>
                    <td>${fN2(w.rate)} zł${w.rateNight !== null ? ' / ' + fN2(w.rateNight) + ' zł' : ''}</td>
                    <td style="font-weight:600;color:#d97706;">${fN(w.pay)} zł</td>
                    <td style="font-weight:600;color:#2563eb;">${fN(w.revenue)} zł</td>
                    <td style="font-weight:600;color:#15803d;">${fN(w.margin)} zł</td>
                    <td>
                      <div class="ppd-load-bar"><div class="ppd-load-fill" style="width:${pct}%;background:${barColor};"></div></div>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
              <tfoot>
                <tr class="ppd-table-total">
                  <td></td>
                  <td style="font-weight:700;">ИТОГО (${t.workers})</td>
                  ${payroll.hasDayNight ? '<td></td><td></td>' : ''}
                  <td style="font-weight:700;">${fN2(t.hours)}</td>
                  <td>+${payroll.markup} zł/ч</td>
                  <td style="font-weight:700;color:#d97706;">${fN(t.pay)} zł</td>
                  <td style="font-weight:700;color:#2563eb;">${fN(t.revenue)} zł</td>
                  <td style="font-weight:700;color:#15803d;">${fN(t.margin)} zł</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>`;
  };

  // ── Analytics View ──
  const renderAnalyticsView = () => {
    const months = PAYROLL_MONTHS.slice().reverse();
    const monthData = months.map(m => getProjectPayrollDetail(project.id, m.key));
    const hasAnyData = monthData.some(d => d.hasData && d.totals.workers > 0);
    if (!hasAnyData) {
      return `<div class="card" style="margin-top:20px;"><div class="card-body" style="padding:60px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;opacity:.3;">📊</div><div style="color:var(--text-muted);font-size:16px;">Нет исторических данных для аналитики</div></div></div>`;
    }
    const tL = months.map(m => m.label.split(' ')[0].slice(0,3));
    const tH = monthData.map(d => d.hasData ? d.totals.hours : 0);
    const tP = monthData.map(d => d.hasData ? d.totals.pay : 0);
    const tR = monthData.map(d => d.hasData ? d.totals.revenue : 0);
    const tM = monthData.map(d => d.hasData ? d.totals.margin : 0);
    const tW = monthData.map(d => d.hasData ? d.totals.workers : 0);
    const tMP = monthData.map(d => d.hasData ? d.totals.marginPct : 0);
    const arrow = (arr) => {
      const v = arr.filter(x => x > 0);
      if (v.length < 2) return { i: '—', c: '#6b7280', d: '' };
      const pct = v[v.length-2] > 0 ? Math.round(((v[v.length-1] - v[v.length-2]) / v[v.length-2]) * 100) : 0;
      return pct > 0 ? { i:'↑', c:'#15803d', d:`+${pct}%` } : pct < 0 ? { i:'↓', c:'#dc2626', d:`${pct}%` } : { i:'→', c:'#6b7280', d:'0%' };
    };
    const aH=arrow(tH), aP=arrow(tP), aR=arrow(tR), aM=arrow(tM);
    const isFcast = monthData.map(d => d.isForecast || false);
    const pastRatios = monthData.map(d => {
      if (!d.isForecast || !d.totals || !d.totals.pastHours) return 1;
      return d.totals.hours > 0 ? d.totals.pastHours / d.totals.hours : 1;
    });
    const bChart = (vals, lbls, color, fmt, pastVals) => {
      const mx = Math.max(...vals, 1);
      return `<div style="display:flex;gap:12px;align-items:flex-end;height:160px;padding-top:10px;">
        ${vals.map((v, i) => {
          const fc = isFcast[i];
          const pR = pastRatios[i];
          if (fc && pR < 1 && pR > 0) {
            // Stacked bar: solid past + striped future
            const totalPct = Math.max(v/mx*100, 3);
            const pastPct = pR * totalPct;
            const futurePct = totalPct - pastPct;
            const pastLabel = pastVals ? fmt(pastVals[i]) : fmt(Math.round(v * pR));
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%;">
            <div style="font-size:10px;font-weight:600;color:var(--text-muted);">${fmt(v)} <span style="font-size:8px;">📈</span></div>
            <div style="flex:1;width:100%;position:relative;">
              <div style="position:absolute;bottom:0;left:10%;width:80%;height:${totalPct}%;border-radius:6px 6px 2px 2px;overflow:hidden;display:flex;flex-direction:column;transition:height 600ms cubic-bezier(.4,0,.2,1);">
                <div style="height:${futurePct / totalPct * 100}%;background:repeating-linear-gradient(135deg,${color},${color} 4px,${color}44 4px,${color}44 8px);border-bottom:1.5px dashed ${color};opacity:0.65;"></div>
                <div style="flex:1;background:${color};position:relative;">
                  <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:9px;font-weight:700;color:#fff;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.3);">${pastLabel}</span>
                </div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${lbls[i]}*</div>
          </div>`;
          }
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;">
          <div style="font-size:11px;font-weight:600;color:var(--text-primary);">${fmt(v)}</div>
          <div style="flex:1;width:100%;position:relative;">
            <div style="position:absolute;bottom:0;left:10%;width:80%;height:${Math.max(v/mx*100,3)}%;background:${color};border-radius:6px 6px 2px 2px;transition:height 600ms cubic-bezier(.4,0,.2,1);"></div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${lbls[i]}</div>
        </div>`;
        }).join('')}
      </div>`;
    };
    const curD = monthData.find(d => d.hasData && d.totals.workers > 0);
    const topW = curD ? curD.workers.filter(w => w.hours > 0).sort((a,b) => b.margin - a.margin).slice(0,8) : [];
    const topMax = topW.length > 0 ? topW[0].margin : 1;
    const wM = {};
    monthData.forEach((d, mi) => { if (!d.hasData) return; d.workers.filter(w => w.hours > 0).forEach(w => {
      if (!wM[w.name]) wM[w.name] = { c:0, m:[], h:0 };
      wM[w.name].c++; wM[w.name].m.push(tL[mi]); wM[w.name].h += w.hours;
    }); });
    const stbl = Object.entries(wM).filter(([,v]) => v.c >= 2).sort((a,b) => b[1].h - a[1].h).slice(0,10);
    const dnD = monthData.find(d => d.hasData && d.hasDayNight);
    let dnB = '';
    if (dnD) {
      const dH = dnD.workers.reduce((s,w) => s + (w.hoursDay||0), 0);
      const nH = dnD.workers.reduce((s,w) => s + (w.hoursNight||0), 0);
      const tot = dH + nH; const dp = tot > 0 ? Math.round(dH/tot*100) : 0;
      dnB = `<div class="card" style="margin-top:16px;"><div class="card-header"><span class="card-title">🌗 День / Ночь</span></div><div class="card-body" style="padding:16px 20px;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;">☀️ День: <b>${fN(Math.round(dH))} ч</b> (${dp}%)</span><span style="font-size:13px;">🌙 Ночь: <b>${fN(Math.round(nH))} ч</b> (${100-dp}%)</span></div><div style="height:20px;border-radius:10px;background:#1e293b22;overflow:hidden;display:flex;"><div style="width:${dp}%;background:linear-gradient(90deg,#f59e0b,#f97316);border-radius:10px 0 0 10px;"></div><div style="width:${100-dp}%;background:linear-gradient(90deg,#6366f1,#4f46e5);border-radius:0 10px 10px 0;"></div></div></div></div>`;
    }
    return `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px;">
        <div class="card" style="padding:16px 20px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:20px;">⏱</span><span style="font-size:13px;font-weight:600;color:${aH.c}">${aH.i} ${aH.d}</span></div><div style="font-size:24px;font-weight:700;">${fN(tH[tH.length-1])}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Часов</div><div style="font-size:10px;color:var(--text-muted);margin-top:6px;">${tH.map((v,i)=>tL[i]+': '+fN(v)).join(' · ')}</div></div>
        <div class="card" style="padding:16px 20px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:20px;">💸</span><span style="font-size:13px;font-weight:600;color:${aP.c}">${aP.i} ${aP.d}</span></div><div style="font-size:24px;font-weight:700;">${fN(tP[tP.length-1])} <small style="font-size:14px;">zł</small></div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Зарплатный фонд</div><div style="font-size:10px;color:var(--text-muted);margin-top:6px;">${tP.map((v,i)=>tL[i]+': '+fN(v)).join(' · ')}</div></div>
        <div class="card" style="padding:16px 20px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:20px;">📈</span><span style="font-size:13px;font-weight:600;color:${aR.c}">${aR.i} ${aR.d}</span></div><div style="font-size:24px;font-weight:700;">${fN(tR[tR.length-1])} <small style="font-size:14px;">zł</small></div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Доход</div><div style="font-size:10px;color:var(--text-muted);margin-top:6px;">${tR.map((v,i)=>tL[i]+': '+fN(v)).join(' · ')}</div></div>
        <div class="card" style="padding:16px 20px;border-left:3px solid #15803d;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:20px;">💰</span><span style="font-size:13px;font-weight:600;color:${aM.c}">${aM.i} ${aM.d}</span></div><div style="font-size:24px;font-weight:700;color:#15803d;">${fN(tM[tM.length-1])} <small style="font-size:14px;">zł</small></div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Маржа (${tMP[tMP.length-1]}%)</div><div style="font-size:10px;color:var(--text-muted);margin-top:6px;">${tM.map((v,i)=>tL[i]+': '+fN(v)).join(' · ')}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
        <div class="card"><div class="card-header"><span class="card-title">📊 Динамика дохода</span></div><div class="card-body" style="padding:16px 20px;">${bChart(tR, tL, '#2563eb', v => fN(v))}</div></div>
        <div class="card"><div class="card-header"><span class="card-title">💰 Динамика маржи</span></div><div class="card-body" style="padding:16px 20px;">${bChart(tM, tL, '#15803d', v => fN(v))}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
        <div class="card"><div class="card-header"><span class="card-title">⏱ Динамика часов</span></div><div class="card-body" style="padding:16px 20px;">${bChart(tH, tL, '#d97706', v => fN(v), monthData.map(d => d.hasData && d.totals.pastHours ? Math.round(d.totals.pastHours) : 0))}</div></div>
        <div class="card"><div class="card-header"><span class="card-title">👷 Работники</span></div><div class="card-body" style="padding:16px 20px;">${bChart(tW, tL, '#7c3aed', v => v)}</div></div>
      </div>
      ${dnB}
      ${topW.length > 0 ? `<div class="card" style="margin-top:16px;"><div class="card-header"><span class="card-title">🏆 Топ работники по марже</span></div><div class="card-body" style="padding:12px 20px;">
        ${topW.map((w,i) => { const pct = Math.round(w.margin/topMax*100); const md = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'.'; return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;${i<topW.length-1?'border-bottom:1px solid var(--border-light);':''}">
          <span style="width:28px;text-align:center;font-size:${i<3?'16px':'12px'};">${md}</span>
          <div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${w.name}</div><div style="display:flex;align-items:center;gap:8px;margin-top:4px;"><div style="flex:1;height:6px;border-radius:3px;background:var(--border-light);"><div style="width:${pct}%;height:100%;border-radius:3px;background:linear-gradient(90deg,#15803d,#22c55e);transition:width 500ms;"></div></div></div></div>
          <div style="text-align:right;min-width:90px;"><div style="font-size:14px;font-weight:700;color:#15803d;">${fN(w.margin)} zł</div><div style="font-size:10px;color:var(--text-muted);">${fN2(w.hours)} ч</div></div>
        </div>`; }).join('')}
      </div></div>` : ''}
      ${stbl.length > 0 ? `<div class="card" style="margin-top:16px;"><div class="card-header"><span class="card-title">🔒 Стабильность персонала</span></div><div class="card-body" style="padding:12px 20px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Работники 2+ месяцев</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        ${stbl.map(([n,info]) => `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--primary-lighter);border-radius:8px;"><span style="font-size:12px;">✅</span><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n}</div><div style="font-size:10px;color:var(--text-muted);">${info.m.join(', ')} · ${fN(Math.round(info.h))} ч</div></div></div>`).join('')}
      </div></div></div>` : ''}
    `;
  };

  return `
    <div class="animate-in">
      <div class="card" style="margin-bottom:20px;">
        <div class="card-body" style="padding:24px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;">
            <div style="display:flex;gap:16px;align-items:flex-start;">
              <div style="width:56px;height:56px;border-radius:16px;background:${project.color}15;color:${project.color};display:flex;align-items:center;justify-content:center;font-size:26px;">📂</div>
              <div>
                <h2 style="margin:0;font-size:22px;font-weight:700;color:var(--text-primary);">${project.name}</h2>
                <p style="margin:6px 0 0;font-size:14px;color:var(--text-muted);max-width:500px;">${project.description}</p>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:8px;align-items:center;">
                <div style="display:flex;gap:2px;margin-right:8px;background:var(--surface-lighter);border-radius:8px;padding:2px;">
                  <button class="btn ${projectDetailView === 'standard' ? 'btn-primary' : 'btn-ghost'} btn-sm" style="font-size:12px;padding:4px 10px;" onclick="projectDetailView='standard';render()">📋 Задачи</button>
                  <button class="btn ${projectDetailView === 'analytics' ? 'btn-primary' : 'btn-ghost'} btn-sm" style="font-size:12px;padding:4px 10px;" onclick="projectDetailView='analytics';render()">📊 Аналитика</button>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="openProjectModal('${project.id}')" title="Редактировать">✏️</button>
                <button class="btn btn-ghost btn-sm" style="color:${project.status === 'archived' ? 'var(--success)' : 'var(--warning)'};"
                        onclick="event.stopPropagation();archiveProject('${project.id}')" title="${project.status === 'archived' ? 'Восстановить' : 'Архивировать'}">
                  ${project.status === 'archived' ? '📂' : '🗂️'}
                </button>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="deleteProjectConfirm('${project.id}')" title="Удалить">🗑️</button>
              </div>
              <div style="font-size:32px;font-weight:700;color:${project.color};">${progress}%</div>
              <div style="font-size:12px;color:var(--text-muted);">${doneTasks} из ${totalTasks} выполнено</div>
            </div>
          </div>
          <div class="progress-bar" style="height:10px;border-radius:5px;margin-top:20px;">
            <div class="progress-bar-fill ${progress === 100 ? 'complete' : ''}" 
                 style="width:${progress}%;background:${project.color};border-radius:5px;transition:width 500ms ease;"></div>
          </div>
        </div>
      </div>

      ${projectDetailView === 'analytics' ? renderAnalyticsView() : `
      <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;">
        <div>
          <div class="card">
            <div class="card-header">
              <span class="card-title">📋 Задачи проекта (${totalTasks})</span>
              <button class="btn btn-primary btn-sm" onclick="openTaskModal()">+ Задача</button>
            </div>
            <div class="card-body" style="padding:0;">
              ${projectTasks.length > 0 ? projectTasks.map(task => {
    const priority = getPriorityObj(task.priority);
    const status = getStatusObj(task.status);
    const overdue = isOverdue(task.deadline, task.status);
    let assigneeName = 'Не назначено';
    if (task.assigneeType === 'team' && task.assigneeIds) {
      assigneeName = 'Команда (' + task.assigneeIds.length + ')';
    } else if (task.assigneeType === 'department') {
      assigneeName = task.departmentIds.map(id => getDepartmentById(id).name).join(', ');
    } else {
      const u = getUserById(task.assigneeIds ? task.assigneeIds[0] : task.assigneeId);
      assigneeName = u.name;
    }
    return `
                  <div style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border-light);cursor:pointer;transition:background 150ms;"
                       onmouseover="this.style.background='var(--primary-lighter)'" 
                       onmouseout="this.style.background=''"
                       onclick="navigate('task-detail', {taskId:${task.id}})">
                    <div style="width:8px;height:8px;border-radius:50%;background:${status.color};flex-shrink:0;" title="${status.label}"></div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${task.status === 'done' ? 'text-decoration:line-through;opacity:0.6;' : ''}">${escapeHtml(task.title)}</div>
                      <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${assigneeName} · ${formatDate(task.deadline)}</div>
                    </div>
                    <span class="badge badge-priority-${task.priority}" style="font-size:10px;">${priority.icon}</span>
                    ${overdue ? '<span class="badge badge-deadline-overdue" style="font-size:9px;">!</span>' : ''}
                  </div>`;
  }).join('') : '<div style="padding:40px;text-align:center;color:var(--text-muted);">Нет задач в этом проекте</div>'}
            </div>
          </div>
        </div>

        <div>
          ${(() => {
      const coord = project.coordinatorId ? getUserById(project.coordinatorId) : null;
      const coordinators = USERS.filter(u => u.accessLevel === 'manager');
      return `<div class="card" style="margin-bottom:16px;">
              <div class="card-header">
                <span class="card-title">👤 Координатор</span>
                <button class="btn btn-ghost btn-sm" onclick="document.getElementById('coord-transfer-panel').style.display = document.getElementById('coord-transfer-panel').style.display === 'none' ? 'block' : 'none'" style="font-size:11px;padding:2px 8px;">🔄 Передать</button>
              </div>
              <div class="card-body" style="padding:12px 20px;">
                ${coord ? `<div style="display:flex;align-items:center;gap:10px;">
                  <div class="avatar" style="background:${coord.color};width:36px;height:36px;font-size:12px;">${coord.avatar}</div>
                  <div>
                    <div style="font-size:14px;font-weight:600;">${coord.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${coord.role}</div>
                  </div>
                </div>` : '<div style="font-size:13px;color:var(--text-muted);">Не назначен</div>'}
                <div id="coord-transfer-panel" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);">
                  <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">Передать проект координатору:</div>
                  ${coordinators.filter(c => c.id !== (project.coordinatorId || 0)).map(c => `
                    <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;transition:background 150ms;"
                         onmouseover="this.style.background='var(--primary-lighter)'"
                         onmouseout="this.style.background=''"
                         onclick="transferProjectCoordinator('${project.id}', ${c.id})">
                      <div class="avatar" style="background:${c.color};width:26px;height:26px;font-size:9px;">${c.avatar}</div>
                      <div style="font-size:13px;font-weight:500;">${c.name}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>`;
    })()}

          ${project.contractorName ? `<div class="card" style="margin-bottom:16px;">
            <div class="card-header"><span class="card-title">🏢 Контрагент</span></div>
            <div class="card-body" style="padding:12px 20px;">
              <div style="font-size:14px;font-weight:600;">${escapeHtml(project.contractorName)}</div>
              <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">⚡ Связь с CRM — скоро</div>
            </div>
          </div>` : ''}

          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><span class="card-title">📊 Статистика задач</span></div>
            <div class="card-body" style="padding:12px 20px;">
              ${Object.values(STATUSES).map(s => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${s.color};"></span>
                    <span style="font-size:13px;">${s.label}</span>
                  </div>
                  <span style="font-size:14px;font-weight:600;">${statusCounts[s.id] || 0}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">👥 Участники CRM (${members.length})</span></div>
            <div class="card-body" style="padding:8px 20px;">
              ${members.map(m => `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 0;">
                  <div class="avatar" style="background:${m.color};width:28px;height:28px;font-size:10px;">${m.avatar}</div>
                  <div>
                    <div style="font-size:13px;font-weight:500;">${m.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${m.role}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      `}

      ${renderPayrollBlock()}
    </div>`;
}

// ==========================================
// Week View
// ==========================================
function changeWeek(delta) {
  weekOffset += delta;
  render();
}

function goToCurrentWeek() {
  weekOffset = 0;
  render();
}

function renderWeekView() {
  const allTasks = taskStore.getAll().filter(t => canViewTask(t, CURRENT_USER_ID));
  
  // Calculate week start (Monday) based on offset
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  // Build 7 days
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const isToday = dateStr === today.toISOString().slice(0, 10);
    const isWeekend = i >= 5;
    days.push({ date, dateStr, dayName: dayNames[i], isToday, isWeekend });
  }

  // Group tasks by deadline date
  const tasksByDate = {};
  const noDateTasks = [];
  allTasks.forEach(t => {
    if (!t.deadline) { noDateTasks.push(t); return; }
    const dStr = t.deadline.slice(0, 10);
    if (!tasksByDate[dStr]) tasksByDate[dStr] = [];
    tasksByDate[dStr].push(t);
  });

  // Format week range for header
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} — ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  return `
    <div class="animate-in">
      <!-- Week Navigation -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-secondary btn-sm btn-icon" onclick="changeWeek(-1)" title="Пред. неделя">◀</button>
          <button class="btn btn-secondary btn-sm" onclick="goToCurrentWeek()">Сегодня</button>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="changeWeek(1)" title="След. неделя">▶</button>
        </div>
        <div style="font-size:18px;font-weight:700;color:var(--text-primary);">📅 ${weekLabel}</div>
        <div style="font-size:12px;color:var(--text-muted);">${allTasks.length} задач всего</div>
      </div>

      <!-- Week Grid -->
      <div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:8px;min-height:500px;">
        ${days.map(day => {
          const dayTasks = (tasksByDate[day.dateStr] || []).sort((a, b) => {
            const prio = { critical: 0, high: 1, medium: 2, low: 3 };
            return (prio[a.priority] || 2) - (prio[b.priority] || 2);
          });
          return `
            <div style="background:${day.isToday ? 'var(--primary-light)' : day.isWeekend ? 'var(--bg-secondary)' : 'var(--bg-primary)'};
                        border:1px solid ${day.isToday ? 'var(--primary)' : 'var(--border-light)'};
                        border-radius:var(--radius-lg);padding:8px;display:flex;flex-direction:column;
                        ${day.isToday ? 'box-shadow:0 0 0 2px var(--primary);' : ''}">
              <!-- Day Header -->
              <div style="text-align:center;padding:4px 0 8px;border-bottom:1px solid ${day.isToday ? 'var(--primary)' : 'var(--border-light)'};margin-bottom:8px;">
                <div style="font-size:11px;font-weight:600;color:${day.isToday ? 'var(--primary)' : day.isWeekend ? 'var(--text-muted)' : 'var(--text-secondary)'};text-transform:uppercase;">${day.dayName}</div>
                <div style="font-size:20px;font-weight:700;color:${day.isToday ? 'var(--primary)' : 'var(--text-primary)'};line-height:1.2;">${day.date.getDate()}</div>
                ${day.isToday ? '<div style="font-size:9px;color:var(--primary);font-weight:600;">СЕГОДНЯ</div>' : ''}
              </div>
              <!-- Tasks -->
              <div style="flex:1;display:flex;flex-direction:column;gap:4px;overflow-y:auto;max-height:400px;">
                ${dayTasks.length > 0 ? dayTasks.map(t => {
                  const priority = getPriorityObj(t.priority);
                  const status = getStatusObj(t.status);
                  const overdue = isOverdue(t.deadline, t.status);
                  const time = t.deadline.includes('T') ? t.deadline.split('T')[1].slice(0, 5) : '';
                  return `
                    <div style="background:var(--bg-primary);border-radius:6px;padding:6px 8px;cursor:pointer;
                                border-left:3px solid ${priority.color || 'var(--border-light)'};
                                ${overdue ? 'border-color:var(--danger);' : ''}
                                ${t.status === 'done' ? 'opacity:0.5;' : ''}
                                transition:all 150ms;"
                         onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='var(--shadow-sm)'"
                         onmouseout="this.style.transform='';this.style.boxShadow=''"
                         onclick="navigateTo('task-detail/${t.id}')">
                      <div style="font-size:11px;font-weight:500;line-height:1.3;
                                  ${t.status === 'done' ? 'text-decoration:line-through;' : ''}
                                  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                        ${escapeHtml(t.title)}
                      </div>
                      <div style="display:flex;align-items:center;gap:4px;margin-top:3px;">
                        ${time ? `<span style="font-size:9px;color:var(--text-muted);">⏰ ${time}</span>` : ''}
                        <span style="font-size:8px;padding:1px 4px;border-radius:3px;background:${status.color}15;color:${status.color};">${status.label}</span>
                      </div>
                    </div>`;
                }).join('') : `<div style="flex:1;display:flex;align-items:center;justify-content:center;">
                  <span style="font-size:11px;color:var(--text-muted);">—</span>
                </div>`}
              </div>
              <!-- Quick Add -->
              <div style="margin-top:4px;padding-top:4px;border-top:1px solid var(--border-light);text-align:center;">
                <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:2px 4px;width:100%;color:var(--text-muted);"
                        onclick="openTaskModal(null, '${day.dateStr}')">+</button>
              </div>
            </div>`;
        }).join('')}
      </div>

      ${noDateTasks.length > 0 ? `
        <!-- No Date Tasks -->
        <div class="card" style="margin-top:16px;">
          <div class="card-header"><span class="card-title">📌 Без даты (${noDateTasks.length})</span></div>
          <div class="card-body" style="padding:0;">
            <div style="display:flex;flex-wrap:wrap;gap:4px;padding:8px;">
              ${noDateTasks.map(t => `
                <div style="background:var(--bg-secondary);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;"
                     onclick="navigateTo('task-detail/${t.id}')">
                  ${escapeHtml(t.title)}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}
    </div>`;
}

// ==========================================
// Templates Page
// ==========================================
function renderTemplatesPage() {
  return `
    <div class="animate-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div>
          <h2 style="margin:0;font-size:20px;color:var(--text-primary);">📝 Шаблоны задач</h2>
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-muted);">Готовые наборы задач для типовых процессов. Выберите шаблон для создания задач одним кликом.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:16px;">
        ${TASK_TEMPLATES.map(tpl => `
          <div class="card" style="border-left:4px solid ${tpl.color};transition:all 200ms;"
               onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-lg)'"
               onmouseout="this.style.transform='';this.style.boxShadow=''">
            <div class="card-header" style="padding-bottom:4px;">
              <span style="font-size:20px;">${tpl.icon}</span>
              <span class="card-title" style="flex:1;">${tpl.name}</span>
              <span class="badge" style="background:${tpl.color}15;color:${tpl.color};">${tpl.tasks.length} задач</span>
            </div>
            <div class="card-body">
              <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px;">${tpl.description}</p>
              <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
                ${tpl.tasks.map((t, i) => `
                  <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
                    <span style="color:var(--text-muted);width:16px;text-align:right;">${i + 1}.</span>
                    <span style="flex:1;">${escapeHtml(t.title)}</span>
                    <span class="badge" style="font-size:9px;">${t.priority === 'critical' ? '⚡' : t.priority === 'high' ? '↑' : '→'} ${t.priority}</span>
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-primary btn-sm" style="width:100%;" onclick="createFromTemplate('${tpl.id}')">
                🚀 Создать ${tpl.tasks.length} задач
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function createFromTemplate(templateId) {
  const tpl = TASK_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;

  const projectId = prompt('ID проекта (необязательно, нажмите OK чтобы пропустить):') || null;

  const created = [];
  tpl.tasks.forEach(t => {
    const task = taskStore.create({
      title: t.title,
      description: 'Создано из шаблона: ' + tpl.name,
      status: 'new',
      priority: t.priority,
      category: t.category,
      creatorId: CURRENT_USER_ID,
      assigneeId: CURRENT_USER_ID,
      assigneeIds: [CURRENT_USER_ID],
      assigneeType: 'single',
      departmentIds: [],
      groupType: 'single',
      projectId: projectId,
      deadline: '',
      reminderType: 'none',
    });
    created.push(task);
  });

  showToast('✅ Создано ' + created.length + ' задач из шаблона «' + tpl.name + '»');
  navigate('tasks');
}

// ==========================================
// Task Detail
// ==========================================
function renderTaskDetail() {
  const task = taskStore.getById(currentTaskId);
  if (!task) return '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-title">Задача не найдена</div></div>';

  // Acknowledge the task when viewing it (dismiss attention indicator)
  if (taskStore.needsAttention(task)) {
    taskStore.acknowledgeTask(task.id);
  }

  const status = getStatusObj(task.status);
  const priority = getPriorityObj(task.priority);
  const category = getCategoryObj(task.category);
  const creator = getUserById(task.creatorId);
  const overdue = isOverdue(task.deadline, task.status);
  const doneSubtasks = task.subtasks.filter(s => s.done).length;
  const totalSubtasks = task.subtasks.length;
  const groupProgress = taskStore.getGroupProgress(task);

  // Assignee info for sidebar
  let assigneeDetailHtml;
  if (task.assigneeType === 'department' && task.departmentIds.length > 0) {
    const typeLabel = task.groupType === 'first_done' ? '🔹 Любой может выполнить' : '🔸 Каждый выполняет отдельно';
    const deptNames = task.departmentIds.map(id => {
      const d = getDepartmentById(id);
      return `<span class="badge" style="background:${d.color}15;color:${d.color};font-size:11px;">${d.name}</span>`;
    }).join(' ');
    assigneeDetailHtml = `
      <div class="detail-field">
        <span class="detail-field-label">Назначено на</span>
        <span class="detail-field-value" style="flex-wrap:wrap;gap:4px;">
          <span style="font-size:14px;">👥</span> ${deptNames}
        </span>
      </div>
      <div class="detail-field">
        <span class="detail-field-label">Тип задачи</span>
        <span class="detail-field-value" style="font-size:12px;">${typeLabel}</span>
      </div>`;
  } else if (task.assigneeType === 'team' && task.assigneeIds && task.assigneeIds.length > 0) {
    const teamHtml = task.assigneeIds.map(uid => {
      const u = getUserById(uid);
      return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <div class="avatar" style="background:${u.color};width:22px;height:22px;font-size:9px;">${u.avatar}</div>
        <span style="font-size:12px;">${u.name}</span>
      </div>`;
    }).join('');
    assigneeDetailHtml = `
      <div class="detail-field">
        <span class="detail-field-label">👥 Команда (${task.assigneeIds.length})</span>
        <span class="detail-field-value" style="flex-direction:column;align-items:flex-start;gap:2px;">
          ${teamHtml}
          <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:2px 8px;margin-top:4px;" 
                  onclick="openTaskModal(${task.id})">+ Добавить участника</button>
        </span>
      </div>`;
  } else {
    const assignee = getUserById(task.assigneeIds && task.assigneeIds.length > 0 ? task.assigneeIds[0] : task.assigneeId);
    assigneeDetailHtml = `
      <div class="detail-field">
        <span class="detail-field-label">Исполнитель</span>
        <span class="detail-field-value">
          <div class="avatar avatar-sm" style="background:${assignee.color}">${assignee.avatar}</div>
          ${assignee.name}
        </span>
      </div>`;
  }

  // Project display for sidebar
  const projectObj = task.projectId ? getProjectById(task.projectId) : null;
  const projectDetailHtml = projectObj ? `
    <div class="detail-field">
      <span class="detail-field-label">📂 Проект</span>
      <span class="detail-field-value">
        <span class="badge" style="background:${projectObj.color}15;color:${projectObj.color};font-size:11px;">${projectObj.name}</span>
      </span>
    </div>` : '';

  // Watchers display
  const watchersHtml = task.watcherIds && task.watcherIds.length > 0 ? `
    <div class="detail-field">
      <span class="detail-field-label">👁 Наблюдатели</span>
      <span class="detail-field-value" style="flex-wrap:wrap;gap:4px;">
        ${task.watcherIds.map(wId => {
    const w = getUserById(wId);
    return `<div style="display:flex;align-items:center;gap:4px;">
            <div class="avatar" style="background:${w.color};width:20px;height:20px;font-size:8px;">${w.avatar}</div>
            <span style="font-size:11px;">${w.name}</span>
          </div>`;
  }).join('')}
      </span>
    </div>` : '';

  // Group completion card
  let groupCompletionHtml = '';
  if (task.groupType !== 'single' && groupProgress) {
    if (task.groupType === 'first_done') {
      const completedByUser = task.completedBy.length > 0 ? getUserById(task.completedBy[0]) : null;
      groupCompletionHtml = `
        <div class="card">
          <div class="card-header"><span class="card-title">🔹 Выполнение</span></div>
          <div class="card-body">
            ${completedByUser
          ? `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--success-bg);border-radius:var(--radius);">
                  <span style="font-size:18px;">✅</span>
                  <div>
                    <div style="font-size:12px;font-weight:500;color:var(--success);">Выполнено</div>
                    <div style="font-size:11px;color:var(--text-muted);">${completedByUser.name}</div>
                  </div>
                </div>`
          : `<button class="btn btn-primary btn-sm" style="width:100%;" onclick="handleGroupComplete(${task.id}, ${CURRENT_USER_ID})">
                  ✅ Я выполнил
                </button>
                <div style="font-size:11px;color:var(--text-muted);margin-top:6px;text-align:center;">
                  Кто первый нажмёт — задача закроется
                </div>`
        }
          </div>
        </div>`;
    } else if (task.groupType === 'each_done') {
      groupCompletionHtml = `
        <div class="card">
          <div class="card-header">
            <span class="card-title">🔸 Выполнение (${groupProgress.completed}/${groupProgress.total})</span>
            <div class="progress-bar" style="width:80px;">
              <div class="progress-bar-fill ${groupProgress.completed === groupProgress.total ? 'complete' : ''}" 
                   style="width:${groupProgress.total > 0 ? (groupProgress.completed / groupProgress.total) * 100 : 0}%"></div>
            </div>
          </div>
          <div class="card-body" style="padding:0;">
            ${groupProgress.members.map(m => `
              <div style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;${m.done ? 'opacity:0.6;' : ''}"
                   onclick="handleGroupComplete(${task.id}, ${m.user.id})">
                <div class="subtask-checkbox" style="width:18px;height:18px;font-size:10px;${m.done ? 'background:var(--success);border-color:var(--success);color:white;' : ''}">${m.done ? '✓' : ''}</div>
                <div class="avatar avatar-sm" style="background:${m.user.color}">${m.user.avatar}</div>
                <span style="font-size:13px;${m.done ? 'text-decoration:line-through;' : ''}">${m.user.name}</span>
                ${m.user.id === CURRENT_USER_ID && !m.done ? '<span style="margin-left:auto;font-size:10px;color:var(--primary);font-weight:500;">← Это вы</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>`;
    }
  }

  return `
    <div class="task-detail animate-in">
      <div class="task-detail-main">
        <div class="card">
          <div class="card-body">
            <div class="task-detail-header">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <span class="badge badge-status-${task.status}">${status.label}</span>
                  <span class="badge badge-priority-${task.priority}">${priority.icon} ${priority.label}</span>
                  <span class="badge" style="background:${category.color}15;color:${category.color}">${category.label}</span>
                </div>
                <h1 class="task-detail-title">${escapeHtml(task.title)}</h1>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="openTaskModal(${task.id})">✏️ Редактировать</button>
                <button class="btn btn-ghost btn-sm btn-icon" onclick="deleteTask(${task.id})" title="Удалить" style="color:var(--danger)">🗑</button>
              </div>
            </div>
            <div class="task-detail-description" style="margin-top:16px;">
              ${escapeHtml(task.description)}
            </div>
            ${task.linkedEntity ? `
              <div style="margin-top:16px;">
                <span class="linked-entity">🔗 ${task.linkedEntity.type === 'contractor' ? 'Контрагент' : 'Вакансия'}: ${escapeHtml(task.linkedEntity.name)}</span>
              </div>` : ''}
          </div>
        </div>

        ${groupCompletionHtml ? `<!-- Group Completion -->${groupCompletionHtml}` : ''}

        <!-- Subtasks -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">✅ Подзадачи ${totalSubtasks > 0 ? `(${doneSubtasks}/${totalSubtasks})` : ''}</span>
            ${totalSubtasks > 0 ? `
              <div class="progress-bar" style="width:100px;">
                <div class="progress-bar-fill ${doneSubtasks === totalSubtasks && totalSubtasks > 0 ? 'complete' : ''}" 
                     style="width:${totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0}%"></div>
              </div>` : ''}
          </div>
          <div class="card-body">
            <div class="subtask-list">
              ${task.subtasks.map(s => `
                <div class="subtask-item ${s.done ? 'done' : ''}" onclick="toggleSubtask(${task.id}, ${s.id})">
                  <div class="subtask-checkbox">${s.done ? '✓' : ''}</div>
                  <span class="subtask-text">${escapeHtml(s.text)}</span>
                </div>
              `).join('')}
            </div>
            <div class="subtask-add">
              <input type="text" placeholder="Добавить подзадачу..." id="new-subtask-input" 
                     onkeypress="if(event.key==='Enter')addSubtask(${task.id})">
              <button class="btn btn-secondary btn-sm" onclick="addSubtask(${task.id})">Добавить</button>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🏷️ Теги</span>
          </div>
          <div class="card-body" style="padding:12px 16px;">
            <div style="display:flex;flex-wrap:wrap;gap:6px;" id="tag-container-${task.id}">
              ${(task.tags || []).map(tag => {
    const tagDef = AVAILABLE_TAGS.find(t => t.label === tag) || { color: '#6b7280' };
    return `<span class="badge" style="background:${tagDef.color}15;color:${tagDef.color};font-size:11px;cursor:pointer;" 
                              onclick="removeTag(${task.id}, '${tag}')" title="Нажмите чтобы удалить">${tag} ✕</span>`;
  }).join('')}
              <div class="dropdown" style="position:relative;display:inline-block;">
                <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px;" onclick="toggleTagDropdown(${task.id})">+ Тег</button>
                <div id="tag-dropdown-${task.id}" style="display:none;position:absolute;top:100%;left:0;z-index:100;background:var(--bg-primary);border:1px solid var(--border-light);border-radius:var(--radius);padding:4px;box-shadow:var(--shadow-lg);min-width:140px;">
                  ${AVAILABLE_TAGS.filter(t => !(task.tags || []).includes(t.label)).map(t =>
    `<div style="padding:4px 8px;cursor:pointer;border-radius:4px;font-size:12px;display:flex;align-items:center;gap:6px;" 
                          onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''"
                          onclick="addTag(${task.id}, '${t.label}')">
                      <span style="width:8px;height:8px;border-radius:50%;background:${t.color};"></span> ${t.label}
                    </div>`
  ).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">📎 Вложения (${(task.attachments || []).length})</span>
            <button class="btn btn-ghost btn-sm" onclick="addAttachment(${task.id})">+ Файл</button>
          </div>
          <div class="card-body" style="padding:${(task.attachments || []).length > 0 ? '0' : '12px 16px'};">
            ${(task.attachments || []).length > 0 ? (task.attachments || []).map(a => {
    const icon = a.type === 'pdf' ? '📄' : a.type === 'image' ? '🖼️' : '📁';
    const user = getUserById(a.addedBy);
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border-light);">
                <span style="font-size:20px;">${icon}</span>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(a.name)}</div>
                  <div style="font-size:11px;color:var(--text-muted);">${a.size} · ${user.name} · ${formatDate(a.addedAt)}</div>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);font-size:12px;" onclick="removeAttachment(${task.id}, ${a.id})" title="Удалить">✕</button>
              </div>`;
  }).join('') : '<div style="text-align:center;color:var(--text-muted);font-size:13px;">Нет вложений</div>'}
          </div>
        </div>

        <!-- Links -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🔗 Ссылки (${(task.links || []).length})</span>
            <button class="btn btn-ghost btn-sm" onclick="addLink(${task.id})">+ Ссылка</button>
          </div>
          <div class="card-body" style="padding:${(task.links || []).length > 0 ? '0' : '12px 16px'};">
            ${(task.links || []).length > 0 ? (task.links || []).map(l => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border-light);">
                <span style="font-size:16px;">🌐</span>
                <div style="flex:1;min-width:0;">
                  <a href="${escapeHtml(l.url)}" target="_blank" style="font-size:13px;font-weight:500;color:var(--primary);text-decoration:none;">${escapeHtml(l.title || l.url)}</a>
                  <div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(l.url)}</div>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);font-size:12px;" onclick="removeLink(${task.id}, ${l.id})" title="Удалить">✕</button>
              </div>
            `).join('') : '<div style="text-align:center;color:var(--text-muted);font-size:13px;">Нет ссылок</div>'}
          </div>
        </div>

        <!-- Contacts -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">📞 Контакты (${(task.contacts || []).length})</span>
            <button class="btn btn-ghost btn-sm" onclick="addContact(${task.id})">+ Контакт</button>
          </div>
          <div class="card-body" style="padding:${(task.contacts || []).length > 0 ? '0' : '12px 16px'};">
            ${(task.contacts || []).length > 0 ? (task.contacts || []).map(c => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border-light);">
                <div style="width:36px;height:36px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:16px;">👤</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;">${escapeHtml(c.name)}${c.role ? ` <span style="font-weight:400;color:var(--text-muted);">— ${escapeHtml(c.role)}</span>` : ''}</div>
                  <div style="font-size:11px;color:var(--text-muted);display:flex;gap:12px;margin-top:2px;">
                    ${c.phone ? `<span>📞 <a href="tel:${c.phone}" style="color:var(--primary);text-decoration:none;">${escapeHtml(c.phone)}</a></span>` : ''}
                    ${c.email ? `<span>📧 <a href="mailto:${c.email}" style="color:var(--primary);text-decoration:none;">${escapeHtml(c.email)}</a></span>` : ''}
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);font-size:12px;" onclick="removeContact(${task.id}, ${c.id})" title="Удалить">✕</button>
              </div>
            `).join('') : '<div style="text-align:center;color:var(--text-muted);font-size:13px;">Нет контактов</div>'}
          </div>
        </div>

        <!-- Relations -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🔗 Связи (${getTaskRelations(task).length})</span>
            <button class="btn btn-ghost btn-sm" onclick="addRelation(${task.id})">+ Связь</button>
          </div>
          <div class="card-body" style="padding:${getTaskRelations(task).length > 0 ? '0' : '12px 16px'};">
            ${getTaskRelations(task).length > 0 ? getTaskRelations(task).map(r => {
              const rel = RELATION_TYPES[r.type] || RELATION_TYPES.related;
              const relTask = taskStore.getById(r.taskId);
              if (!relTask) return '';
              const statusObj = getStatusObj(relTask.status);
              return `<div style="display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border-light);">
                <span style="font-size:16px;" title="${rel.label}">${rel.icon}</span>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="badge" style="background:${rel.color}15;color:${rel.color};font-size:10px;">${rel.label}</span>
                    <span class="badge badge-status-${relTask.status}" style="font-size:9px;">${statusObj.label}</span>
                  </div>
                  <div style="font-size:13px;font-weight:500;margin-top:2px;cursor:pointer;color:var(--primary);" 
                       onclick="navigateTo('task-detail/${r.taskId}')">#${r.taskId} ${escapeHtml(relTask.title)}</div>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);font-size:12px;" 
                        onclick="removeRelation(${task.id}, ${r.taskId}, '${r.type}')" title="Удалить связь">✕</button>
              </div>`;
            }).join('') : '<div style="text-align:center;color:var(--text-muted);font-size:13px;">Нет связей</div>'}
          </div>
        </div>

        <!-- Time Tracking -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">⏱️ Время (${formatMinutes((task.timeEntries || []).reduce((sum, e) => sum + e.minutes, 0))})</span>
            <button class="btn btn-ghost btn-sm" onclick="addTimeEntry(${task.id})">+ Время</button>
          </div>
          <div class="card-body" style="padding:${(task.timeEntries || []).length > 0 ? '0' : '12px 16px'};">
            ${(task.timeEntries || []).length > 0 ? (task.timeEntries || []).map(e => {
              const user = getUserById(e.userId);
              return '<div style="display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border-light);">' +
                '<div class="avatar" style="width:28px;height:28px;font-size:10px;background:' + user.color + ';">' + user.avatar + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                  '<div style="font-size:12px;">' + escapeHtml(e.description || 'Без описания') + '</div>' +
                  '<div style="font-size:10px;color:var(--text-muted);">' + user.name + ' · ' + e.date + '</div>' +
                '</div>' +
                '<span style="font-size:13px;font-weight:600;color:var(--primary);white-space:nowrap;">' + formatMinutes(e.minutes) + '</span>' +
                '<button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);font-size:12px;" onclick="removeTimeEntry(' + task.id + ', ' + e.id + ')" title="Удалить">✕</button>' +
              '</div>';
            }).join('') : '<div style="text-align:center;color:var(--text-muted);font-size:13px;">Нет записей</div>'}
          </div>
        </div>

        <!-- Calendar Export -->
        <div style="text-align:center;margin:8px 0;">
          <button class="btn btn-secondary btn-sm" onclick="exportToCalendar(${task.id})" style="width:100%;">
            📅 Добавить в календарь (.ics)
          </button>
        </div>

        <!-- History / Audit Log -->
        <div class="card">
          <div class="card-header" style="cursor:pointer;" onclick="document.getElementById('history-body-${task.id}').style.display = document.getElementById('history-body-${task.id}').style.display === 'none' ? 'block' : 'none'">
            <span class="card-title">📜 История изменений (${(task.history || []).length})</span>
            <span style="font-size:11px;color:var(--text-muted);">${ (task.history || []).length > 0 ? '▼' : ''}</span>
          </div>
          <div class="card-body" id="history-body-${task.id}" style="display:${(task.history || []).length > 3 ? 'none' : 'block'};padding:0;">
            ${(task.history || []).length > 0 ? [...(task.history || [])].reverse().map(h => {
              const user = getUserById(h.userId);
              const fieldLabels = { status: 'Статус', priority: 'Приоритет', deadline: 'Дедлайн', title: 'Название', assigneeIds: 'Исполнители', projectId: 'Проект', category: 'Категория' };
              return `<div style="display:flex;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border-light);font-size:12px;">
                <div class="avatar" style="width:28px;height:28px;font-size:10px;background:${user.color};flex-shrink:0;">${user.avatar}</div>
                <div style="flex:1;min-width:0;">
                  <div><strong>${user.name}</strong> изменил(a) <span style="color:var(--primary);font-weight:600;">${fieldLabels[h.field] || h.field}</span></div>
                  <div style="margin-top:2px;color:var(--text-muted);">
                    <span style="text-decoration:line-through;">${escapeHtml(String(h.oldValue))}</span>
                    <span style="margin:0 4px;">→</span>
                    <span style="color:var(--text-primary);font-weight:500;">${escapeHtml(String(h.newValue))}</span>
                  </div>
                </div>
                <div style="color:var(--text-muted);font-size:10px;white-space:nowrap;">${timeAgo(h.timestamp)}</div>
              </div>`;
            }).join('') : '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:12px 16px;">Нет изменений</div>'}
          </div>
        </div>

        <!-- Comments -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">💬 Комментарии (${task.comments.length})</span>
          </div>
          <div class="card-body">
            <div class="comment-list">
              ${task.comments.map(c => {
    const user = getUserById(c.userId);
    return `
                  <div class="comment-item">
                    <div class="avatar" style="background:${user.color}">${user.avatar}</div>
                    <div class="comment-body">
                      <div class="comment-header">
                        <span class="comment-author">${user.name}</span>
                        <span class="comment-time">${timeAgo(c.createdAt)}</span>
                      </div>
                      <div class="comment-text">${escapeHtml(c.text)}</div>
                    </div>
                  </div>`;
  }).join('')}
            </div>
            <div class="comment-form">
              <div class="avatar" style="background:${getUserById(CURRENT_USER_ID).color}">${getUserById(CURRENT_USER_ID).avatar}</div>
              <input type="text" class="comment-input" placeholder="Написать комментарий..." id="comment-input"
                     onkeypress="if(event.key==='Enter')addComment(${task.id})">
              <button class="btn btn-primary btn-sm" onclick="addComment(${task.id})">Отправить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="task-detail-sidebar">
        <div class="card">
          <div class="card-header"><span class="card-title">Детали</span></div>
          <div class="card-body" style="padding:12px 20px;">
            <div class="detail-field">
              <span class="detail-field-label">Статус</span>
              <span class="detail-field-value">
                <select class="filter-select" style="min-width:120px;" onchange="changeTaskStatus(${task.id}, this.value)">
                  ${Object.values(STATUSES).map(s =>
    `<option value="${s.id}" ${task.status === s.id ? 'selected' : ''}>${s.label}</option>`
  ).join('')}
                </select>
              </span>
            </div>
            <div class="detail-field">
              <span class="detail-field-label">Приоритет</span>
              <span class="detail-field-value"><span class="badge badge-priority-${task.priority}">${priority.icon} ${priority.label}</span></span>
            </div>
            <div class="detail-field">
              <span class="detail-field-label">Категория</span>
              <span class="detail-field-value"><span class="badge" style="background:${category.color}15;color:${category.color}">${category.label}</span></span>
            </div>
            ${assigneeDetailHtml}
            ${projectDetailHtml}
            <div class="detail-field">
              <span class="detail-field-label">Автор</span>
              <span class="detail-field-value">
                <div class="avatar avatar-sm" style="background:${creator.color}">${creator.avatar}</div>
                ${creator.name}
              </span>
            </div>
            ${watchersHtml}
            <div class="detail-field" ${overdue ? 'style="color:var(--danger)"' : ''}>
              <span class="detail-field-label">Дедлайн</span>
              <span class="detail-field-value">${overdue ? '⚠ ' : ''}${formatDate(task.deadline)}</span>
            </div>
            ${task.reminderMinutes > 0 ? `
            <div class="detail-field">
              <span class="detail-field-label">⏰ Напоминание</span>
              <span class="detail-field-value" style="flex-direction:column;align-items:flex-start;gap:4px;">
                <span style="font-size:12px;">${REMINDER_PRESETS.find(r => r.value === task.reminderMinutes)?.label || task.reminderMinutes + ' мин.'}</span>
                <div style="display:flex;gap:4px;">
                  ${task.reminderChannels.map(chId => {
    const ch = REMINDER_CHANNELS.find(c => c.id === chId);
    return ch ? `<span class="badge" style="background:var(--primary-lighter);color:var(--primary);font-size:10px;">${ch.icon} ${ch.id === 'push' ? 'Пуш' : ch.id === 'telegram' ? 'Telegram' : 'Email'}</span>` : '';
  }).join('')}
                </div>
              </span>
            </div>` : ''}
            <div class="detail-field">
              <span class="detail-field-label">Создана</span>
              <span class="detail-field-value">${formatDateTime(task.createdAt)}</span>
            </div>
            <div class="detail-field" style="border-bottom:none;">
              <span class="detail-field-label">Обновлена</span>
              <span class="detail-field-value">${timeAgo(task.updatedAt)}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header"><span class="card-title">Быстрые действия</span></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:6px;">
            ${task.status !== 'in_progress' ? `<button class="btn btn-secondary btn-sm" style="justify-content:flex-start;" onclick="changeTaskStatus(${task.id}, 'in_progress')">🔄 Взять в работу</button>` : ''}
            ${task.status !== 'review' ? `<button class="btn btn-secondary btn-sm" style="justify-content:flex-start;" onclick="changeTaskStatus(${task.id}, 'review')">👁 На проверку</button>` : ''}
            ${task.status !== 'done' ? `<button class="btn btn-primary btn-sm" style="justify-content:flex-start;" onclick="changeTaskStatus(${task.id}, 'done')">✅ Выполнена</button>` : ''}
            ${task.status === 'done' ? `<button class="btn btn-secondary btn-sm" style="justify-content:flex-start;" onclick="changeTaskStatus(${task.id}, 'new')">↩ Переоткрыть</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

// ==========================================
// Task Modal (Create/Edit)
// ==========================================
let modalOpen = false;
let editingTaskId = null;
let modalDefaults = {};

function openTaskModal(taskId = null, defaultStatus = null) {
  editingTaskId = taskId;
  modalDefaults = {};
  if (defaultStatus) modalDefaults.status = defaultStatus;
  modalOpen = true;
  render();
  setTimeout(() => {
    document.querySelector('.modal-overlay')?.classList.add('open');
  }, 10);
}

function closeTaskModal() {
  document.querySelector('.modal-overlay')?.classList.remove('open');
  setTimeout(() => {
    modalOpen = false;
    editingTaskId = null;
    modalDefaults = {};
    render();
  }, 200);
}

function renderTaskModal() {
  if (!modalOpen) return '';

  const task = editingTaskId ? taskStore.getById(editingTaskId) : null;
  const title = task ? 'Редактировать задачу' : 'Новая задача';
  const assigneeType = task ? task.assigneeType : 'user';
  const groupType = task ? task.groupType : 'single';
  const watcherIds = task ? task.watcherIds : [];
  const departmentIds = task ? task.departmentIds : [];

  return `
    <div class="modal-overlay" onclick="if(event.target===this)closeTaskModal()">
      <div class="modal" style="max-height:90vh;overflow-y:auto;">
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <button class="modal-close" onclick="closeTaskModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Название задачи *</label>
            <input type="text" class="form-input" id="task-title" placeholder="Введите название задачи"
                   value="${task ? escapeHtml(task.title) : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea class="form-textarea" id="task-description" placeholder="Опишите задачу подробнее..."
                      rows="3">${task ? escapeHtml(task.description) : ''}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Статус</label>
              <select class="form-select" id="task-status">
                ${Object.values(STATUSES).map(s =>
    `<option value="${s.id}" ${(task ? task.status : (modalDefaults.status || 'new')) === s.id ? 'selected' : ''}>${s.label}</option>`
  ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Приоритет</label>
              <select class="form-select" id="task-priority">
                ${Object.values(PRIORITIES).map(p =>
    `<option value="${p.id}" ${(task ? task.priority : 'medium') === p.id ? 'selected' : ''}>${p.icon} ${p.label}</option>`
  ).join('')}
              </select>
            </div>
          </div>

          <!-- Assignment type toggle -->
          <div class="form-group">
            <label class="form-label">Назначить на</label>
            <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">
              <button type="button" class="btn btn-sm ${assigneeType === 'user' ? 'btn-primary' : 'btn-ghost'}" 
                      style="flex:1;border-radius:0;border:none;" id="assign-type-user"
                      onclick="toggleAssigneeType('user')">👤 Одного</button>
              <button type="button" class="btn btn-sm ${assigneeType === 'team' ? 'btn-primary' : 'btn-ghost'}" 
                      style="flex:1;border-radius:0;border:none;" id="assign-type-team"
                      onclick="toggleAssigneeType('team')">👥 Команду</button>
              <button type="button" class="btn btn-sm ${assigneeType === 'department' ? 'btn-primary' : 'btn-ghost'}" 
                      style="flex:1;border-radius:0;border:none;" id="assign-type-dept"
                      onclick="toggleAssigneeType('department')">🏢 Отдел(ы)</button>
            </div>
          </div>

          <!-- User assignee (single) -->
          <div id="user-assignee-section" style="${assigneeType === 'user' ? '' : 'display:none;'}">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Исполнитель</label>
                <select class="form-select" id="task-assignee">
                  ${USERS.map(u =>
    `<option value="${u.id}" ${(task ? task.assigneeId : CURRENT_USER_ID) === u.id ? 'selected' : ''}>${u.name}</option>`
  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Категория</label>
                <select class="form-select" id="task-category">
                  ${CATEGORIES.map(c =>
    `<option value="${c.id}" ${(task ? task.category : 'other') === c.id ? 'selected' : ''}>${c.label}</option>`
  ).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Team assignee (multiple users) -->
          <div id="team-assignee-section" style="${assigneeType === 'team' ? '' : 'display:none;'}">
            <div class="form-group">
              <label class="form-label">Члены команды</label>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${USERS.map(u => {
    const isTeamMember = task && task.assigneeIds && task.assigneeIds.includes(u.id);
    return `
                    <label style="display:flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:12px;transition:all 150ms;${isTeamMember ? `background:${u.color}15;border-color:${u.color};` : ''}">
                      <input type="checkbox" class="team-member-checkbox" value="${u.id}" ${isTeamMember ? 'checked' : ''} style="accent-color:${u.color};">
                      <span class="avatar" style="background:${u.color};width:18px;height:18px;font-size:8px;">${u.avatar}</span>
                      ${u.name}
                    </label>`;
  }).join('')}
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Категория</label>
              <select class="form-select" id="task-category-team">
                ${CATEGORIES.map(c =>
    `<option value="${c.id}" ${(task ? task.category : 'other') === c.id ? 'selected' : ''}>${c.label}</option>`
  ).join('')}
              </select>
            </div>
          </div>

          <!-- Department assignee -->
          <div id="dept-assignee-section" style="${assigneeType === 'department' ? '' : 'display:none;'}">
            <div class="form-group">
              <label class="form-label">Отделы</label>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${DEPARTMENTS.map(d => `
                  <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:13px;transition:all 150ms;${departmentIds.includes(d.id) ? `background:${d.color}15;border-color:${d.color};` : ''}">
                    <input type="checkbox" class="dept-checkbox" value="${d.id}" ${departmentIds.includes(d.id) ? 'checked' : ''} style="accent-color:${d.color};">
                    ${d.name}
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Тип групповой задачи</label>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <label style="display:flex;align-items:flex-start;gap:8px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:13px;${groupType === 'first_done' || groupType === 'single' ? 'background:var(--primary-lighter);border-color:var(--primary);' : ''}">
                  <input type="radio" name="group-type" value="first_done" ${groupType === 'first_done' || groupType === 'single' ? 'checked' : ''} style="margin-top:2px;">
                  <div>
                    <div style="font-weight:500;">🔹 Любой может выполнить</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Кто первый сделал — задача закрыта</div>
                  </div>
                </label>
                <label style="display:flex;align-items:flex-start;gap:8px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:13px;${groupType === 'each_done' ? 'background:var(--primary-lighter);border-color:var(--primary);' : ''}">
                  <input type="radio" name="group-type" value="each_done" ${groupType === 'each_done' ? 'checked' : ''} style="margin-top:2px;">
                  <div>
                    <div style="font-weight:500;">🔸 Каждый выполняет отдельно</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Каждый сотрудник отмечает своё выполнение</div>
                  </div>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Категория</label>
              <select class="form-select" id="task-category-dept">
                ${CATEGORIES.map(c =>
    `<option value="${c.id}" ${(task ? task.category : 'other') === c.id ? 'selected' : ''}>${c.label}</option>`
  ).join('')}
              </select>
            </div>
          </div>

          <!-- Watchers -->
          <div class="form-group">
            <label class="form-label">👁 Наблюдатели</label>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${USERS.map(u => `
                <label style="display:flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:12px;transition:all 150ms;${watcherIds.includes(u.id) ? `background:${u.color}15;border-color:${u.color};` : ''}">
                  <input type="checkbox" class="watcher-checkbox" value="${u.id}" ${watcherIds.includes(u.id) ? 'checked' : ''} style="accent-color:${u.color};">
                  <span class="avatar" style="background:${u.color};width:18px;height:18px;font-size:8px;">${u.avatar}</span>
                  ${u.name}
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Project -->
          <div class="form-group">
            <label class="form-label">📂 Проект</label>
            <select class="form-select" id="task-project">
              <option value="" ${!task || !task.projectId ? 'selected' : ''}>Без проекта</option>
              ${PROJECTS.map(p =>
    `<option value="${p.id}" ${(task && task.projectId === p.id) ? 'selected' : ''}>${p.name}</option>`
  ).join('')}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:2;">
              <label class="form-label">📅 Дедлайн (дата и время)</label>
              <input type="datetime-local" class="form-input" id="task-deadline" 
                     value="${task ? task.deadline : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16)}">
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">⏰ Напоминание</label>
              <select class="form-select" id="task-reminder" onchange="toggleReminderChannels()">
                ${REMINDER_PRESETS.map(r =>
    `<option value="${r.value}" ${(task ? task.reminderMinutes : 0) === r.value ? 'selected' : ''}>${r.label}</option>`
  ).join('')}
              </select>
            </div>
          </div>
          <div class="form-group" id="reminder-channels-section" style="${(task && task.reminderMinutes > 0) ? '' : 'display:none;'}">
            <label class="form-label">Куда отправить напоминание</label>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${REMINDER_CHANNELS.map(ch => {
    const checked = task && task.reminderChannels && task.reminderChannels.includes(ch.id);
    return `
                  <label style="display:flex;align-items:center;gap:6px;padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:13px;transition:all 150ms;${checked ? 'background:var(--primary-lighter);border-color:var(--primary);' : ''}">
                    <input type="checkbox" class="reminder-channel-checkbox" value="${ch.id}" ${checked ? 'checked' : ''}>
                    ${ch.label}
                  </label>`;
  }).join('')}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeTaskModal()">Отмена</button>
          <button class="btn btn-primary" onclick="saveTask()">
            ${task ? 'Сохранить' : 'Создать задачу'}
          </button>
        </div>
      </div>
    </div>`;
}

function toggleAssigneeType(type) {
  document.getElementById('user-assignee-section').style.display = type === 'user' ? '' : 'none';
  document.getElementById('team-assignee-section').style.display = type === 'team' ? '' : 'none';
  document.getElementById('dept-assignee-section').style.display = type === 'department' ? '' : 'none';
  document.getElementById('assign-type-user').className = `btn btn-sm ${type === 'user' ? 'btn-primary' : 'btn-ghost'}`;
  document.getElementById('assign-type-team').className = `btn btn-sm ${type === 'team' ? 'btn-primary' : 'btn-ghost'}`;
  document.getElementById('assign-type-dept').className = `btn btn-sm ${type === 'department' ? 'btn-primary' : 'btn-ghost'}`;
}

function toggleReminderChannels() {
  const reminderVal = parseInt(document.getElementById('task-reminder').value);
  const channelsSection = document.getElementById('reminder-channels-section');
  if (channelsSection) {
    channelsSection.style.display = reminderVal > 0 ? '' : 'none';
  }
}

function saveTask() {
  const title = document.getElementById('task-title').value.trim();
  if (!title) {
    showToast('Введите название задачи', 'error');
    return;
  }

  const isTeam = document.getElementById('team-assignee-section').style.display !== 'none';
  const isDept = document.getElementById('dept-assignee-section').style.display !== 'none';
  const assigneeType = isDept ? 'department' : (isTeam ? 'team' : 'user');
  const watcherIds = [...document.querySelectorAll('.watcher-checkbox:checked')].map(cb => parseInt(cb.value));
  const reminderMinutes = parseInt(document.getElementById('task-reminder').value) || 0;
  const reminderChannels = reminderMinutes > 0
    ? [...document.querySelectorAll('.reminder-channel-checkbox:checked')].map(cb => cb.value)
    : [];
  const projectId = document.getElementById('task-project').value || null;

  const data = {
    title,
    description: document.getElementById('task-description').value.trim(),
    status: document.getElementById('task-status').value,
    priority: document.getElementById('task-priority').value,
    creatorId: CURRENT_USER_ID,
    deadline: document.getElementById('task-deadline').value,
    watcherIds,
    assigneeType,
    reminderMinutes,
    reminderChannels,
    projectId,
  };

  if (assigneeType === 'user') {
    data.assigneeId = parseInt(document.getElementById('task-assignee').value);
    data.assigneeIds = [data.assigneeId];
    data.category = document.getElementById('task-category').value;
    data.departmentIds = [];
    data.groupType = 'single';
  } else if (assigneeType === 'team') {
    data.assigneeIds = [...document.querySelectorAll('.team-member-checkbox:checked')].map(cb => parseInt(cb.value));
    data.assigneeId = null;
    data.category = document.getElementById('task-category-team').value;
    data.departmentIds = [];
    data.groupType = 'single';
    if (data.assigneeIds.length < 2) {
      showToast('Выберите минимум 2 членов команды', 'error');
      return;
    }
  } else {
    data.assigneeId = null;
    data.assigneeIds = [];
    data.departmentIds = [...document.querySelectorAll('.dept-checkbox:checked')].map(cb => cb.value);
    data.category = document.getElementById('task-category-dept').value;
    const groupRadio = document.querySelector('input[name="group-type"]:checked');
    data.groupType = groupRadio ? groupRadio.value : 'first_done';

    if (data.departmentIds.length === 0) {
      showToast('Выберите хотя бы один отдел', 'error');
      return;
    }
  }

  if (editingTaskId) {
    taskStore.update(editingTaskId, data);
    showToast('Задача обновлена');
  } else {
    taskStore.create(data);
    showToast('Задача создана');
  }

  closeTaskModal();
}

// ==========================================
// Actions
// ==========================================
function toggleActionMenu(taskId, e) {
  e.stopPropagation();
  const menu = document.getElementById(`action-menu-${taskId}`);
  if (!menu) return;

  const wasOpen = menu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) {
    menu.classList.add('open');
    openMenuId = taskId;
  }
}

function changeTaskStatus(taskId, newStatus) {
  taskStore.update(taskId, { status: newStatus });
  const statusObj = getStatusObj(newStatus);
  showToast(`Статус изменён: ${statusObj.label}`);
  closeAllMenus();
  render();
}

function deleteTask(taskId) {
  if (!confirm('Удалить задачу?')) return;
  taskStore.delete(taskId);
  showToast('Задача удалена');
  if (currentPage === 'task-detail') navigate('tasks');
  else render();
}

function toggleSubtask(taskId, subtaskId) {
  taskStore.toggleSubtask(taskId, subtaskId);
  render();
}

function addSubtask(taskId) {
  const input = document.getElementById('new-subtask-input');
  if (!input || !input.value.trim()) return;
  taskStore.addSubtask(taskId, input.value.trim());
  showToast('Подзадача добавлена');
  render();
}

function addComment(taskId) {
  const input = document.getElementById('comment-input');
  if (!input || !input.value.trim()) return;
  taskStore.addComment(taskId, CURRENT_USER_ID, input.value.trim());
  showToast('Комментарий добавлен');
  render();
}

function handleGroupComplete(taskId, userId) {
  const task = taskStore.getById(taskId);
  if (!task) return;

  if (task.completedBy.includes(userId)) {
    taskStore.uncompleteGroupTask(taskId, userId);
    showToast('Выполнение отменено');
  } else {
    taskStore.completeGroupTask(taskId, userId);
    if (task.groupType === 'first_done') {
      showToast('Задача выполнена! 🎉');
    } else {
      showToast('Отмечено как выполненное ✅');
    }
  }
  render();
}

function handleSearch(value) {
  currentFilter.search = value;
  currentPageNum = 1;
  // Re-render just the content area
  const contentArea = document.getElementById('content-area');
  if (contentArea) contentArea.innerHTML = renderPage();
  attachEventListeners();
}

function setFilter(key, value) {
  currentFilter[key] = value;
  currentPageNum = 1;
  render();
}

function resetFilters() {
  currentFilter = { status: 'all', priority: 'all', assignee: 'all', category: 'all', search: '' };
  currentPageNum = 1;
  render();
}

function hasActiveFilters() {
  return currentFilter.status !== 'all' || currentFilter.priority !== 'all' ||
    currentFilter.assignee !== 'all' || currentFilter.category !== 'all';
}

function toggleSort(field) {
  if (currentSort.field === field) {
    currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.field = field;
    currentSort.dir = 'asc';
  }
  render();
}

function sortIcon(field) {
  if (currentSort.field !== field) return '';
  return currentSort.dir === 'asc' ? ' ↑' : ' ↓';
}

function changePageSize(size) {
  pageSize = parseInt(size);
  currentPageNum = 1;
  render();
}

function goToPage(page) {
  if (page < 1) return;
  currentPageNum = page;
  render();
}

function attachEventListeners() {
  // Focus on search input if exists
  const searchInput = document.getElementById('search-input');
  if (searchInput && currentFilter.search) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
  }
}

// ── Time Tracking ──

function formatMinutes(minutes) {
  if (minutes === 0) return '0м';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (h > 0 ? h + 'ч ' : '') + (m > 0 ? m + 'м' : '');
}

function addTimeEntry(taskId) {
  const hoursStr = prompt('Сколько времени потрачено? (например: 1.5 = 1ч 30м)');
  if (!hoursStr) return;
  const hours = parseFloat(hoursStr.replace(',', '.'));
  if (isNaN(hours) || hours <= 0) {
    showToast('Неверный формат времени', 'error');
    return;
  }
  const description = prompt('Описание работы:') || '';
  const task = taskStore.getById(taskId);
  if (!task) return;

  const entries = [...(task.timeEntries || [])];
  const maxId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) : 0;
  entries.push({
    id: maxId + 1,
    userId: CURRENT_USER_ID,
    minutes: Math.round(hours * 60),
    description: description,
    date: new Date().toISOString().slice(0, 10),
  });
  taskStore.update(taskId, { timeEntries: entries });
  showToast('Время добавлено: ' + formatMinutes(Math.round(hours * 60)));
  render();
}

function removeTimeEntry(taskId, entryId) {
  const task = taskStore.getById(taskId);
  if (!task) return;
  taskStore.update(taskId, { timeEntries: (task.timeEntries || []).filter(e => e.id !== entryId) });
  showToast('Запись удалена');
  render();
}

// ── Task Enrichments ──

// Tags
function toggleTagDropdown(taskId) {
  const dd = document.getElementById('tag-dropdown-' + taskId);
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

function addTag(taskId, tagLabel) {
  const task = taskStore.getById(taskId);
  if (!task) return;
  const tags = [...(task.tags || [])];
  if (!tags.includes(tagLabel)) tags.push(tagLabel);
  taskStore.update(taskId, { tags });
  render();
}

function removeTag(taskId, tagLabel) {
  const task = taskStore.getById(taskId);
  if (!task) return;
  taskStore.update(taskId, { tags: (task.tags || []).filter(t => t !== tagLabel) });
  render();
}

// Attachments
function addAttachment(taskId) {
  const name = prompt('Имя файла (например: Договор_2026.pdf):');
  if (!name) return;
  const task = taskStore.getById(taskId);
  if (!task) return;
  const attachments = [...(task.attachments || [])];
  const ext = name.split('.').pop().toLowerCase();
  const type = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' : ext === 'pdf' ? 'pdf' : 'file';
  attachments.push({
    id: Date.now(),
    name,
    type,
    size: '—',
    addedAt: new Date().toISOString(),
    addedBy: CURRENT_USER_ID,
  });
  taskStore.update(taskId, { attachments });
  showToast('Файл добавлен');
  render();
}

function removeAttachment(taskId, attachmentId) {
  const task = taskStore.getById(taskId);
  if (!task) return;
  taskStore.update(taskId, { attachments: (task.attachments || []).filter(a => a.id !== attachmentId) });
  showToast('Файл удалён');
  render();
}

// Links
function addLink(taskId) {
  const url = prompt('URL ссылки:');
  if (!url) return;
  const title = prompt('Название (необязательно):') || '';
  const task = taskStore.getById(taskId);
  if (!task) return;
  const links = [...(task.links || [])];
  links.push({ id: Date.now(), title: title || url, url, addedBy: CURRENT_USER_ID });
  taskStore.update(taskId, { links });
  showToast('Ссылка добавлена');
  render();
}

function removeLink(taskId, linkId) {
  const task = taskStore.getById(taskId);
  if (!task) return;
  taskStore.update(taskId, { links: (task.links || []).filter(l => l.id !== linkId) });
  showToast('Ссылка удалена');
  render();
}

// Contacts
function addContact(taskId) {
  const name = prompt('Имя контакта:');
  if (!name) return;
  const phone = prompt('Телефон (необязательно):') || '';
  const email = prompt('Email (необязательно):') || '';
  const role = prompt('Должность (необязательно):') || '';
  const task = taskStore.getById(taskId);
  if (!task) return;
  const contacts = [...(task.contacts || [])];
  contacts.push({ id: Date.now(), name, phone, email, role });
  taskStore.update(taskId, { contacts });
  showToast('Контакт добавлен');
  render();
}

function removeContact(taskId, contactId) {
  const task = taskStore.getById(taskId);
  if (!task) return;
  taskStore.update(taskId, { contacts: (task.contacts || []).filter(c => c.id !== contactId) });
  showToast('Контакт удалён');
  render();
}

// Calendar Export (.ics)
function exportToCalendar(taskId) {
  const task = taskStore.getById(taskId);
  if (!task) return;
  const start = task.deadline ? new Date(task.deadline) : new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mrowki CRM//Task//RU',
    'BEGIN:VEVENT',
    `DTSTART:${fmtDate(start)}`,
    `DTEND:${fmtDate(end)}`,
    `SUMMARY:${task.title}`,
    `DESCRIPTION:${(task.description || '').replace(/\n/g, '\\n')}`,
    `UID:task-${task.id}@mrowki-crm`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `task_${task.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Файл .ics скачан — откройте его в Google Calendar или Outlook');
}

// ── Task Relations ──

function getTaskRelations(task) {
  const own = (task.relations || []).slice();
  // Also find inverse relations from other tasks pointing to this task
  taskStore.getAll().forEach(t => {
    if (t.id === task.id) return;
    (t.relations || []).forEach(r => {
      if (r.taskId === task.id) {
        const inv = RELATION_TYPES[r.type];
        if (inv) own.push({ taskId: t.id, type: inv.inverse });
      }
    });
  });
  return own;
}

function addRelation(taskId) {
  const types = Object.entries(RELATION_TYPES)
    .filter(([k]) => k !== 'blocked_by') // user picks blocks/related/duplicate; blocked_by is auto-generated
    .map(([k, v], i) => `${i+1}. ${v.icon} ${v.label}`)
    .join('\n');
  const typeKeys = Object.keys(RELATION_TYPES).filter(k => k !== 'blocked_by');

  const choice = prompt(`Тип связи:\n${types}\n\nВведите номер (1-${typeKeys.length}):`);
  if (!choice) return;
  const typeIdx = parseInt(choice) - 1;
  if (isNaN(typeIdx) || typeIdx < 0 || typeIdx >= typeKeys.length) {
    showToast('Неверный выбор', 'error');
    return;
  }
  const relType = typeKeys[typeIdx];

  // Build task list excluding self and already related
  const existing = getTaskRelations(taskStore.getById(taskId)).map(r => r.taskId);
  const available = taskStore.getAll().filter(t => t.id !== taskId && !existing.includes(t.id));
  if (available.length === 0) {
    showToast('Нет доступных задач для связи', 'error');
    return;
  }

  const taskList = available.map(t => `#${t.id} — ${t.title}`).join('\n');
  const targetIdStr = prompt(`Введите ID задачи:\n\n${taskList}`);
  if (!targetIdStr) return;
  const targetId = parseInt(targetIdStr.replace('#', ''));
  const targetTask = taskStore.getById(targetId);
  if (!targetTask) {
    showToast('Задача не найдена', 'error');
    return;
  }

  // Add relation to source task
  const task = taskStore.getById(taskId);
  const relations = [...(task.relations || [])];
  relations.push({ taskId: targetId, type: relType });
  taskStore.update(taskId, { relations });

  showToast(`Связь добавлена: ${RELATION_TYPES[relType].icon} ${RELATION_TYPES[relType].label} #${targetId}`);
  render();
}

function removeRelation(taskId, targetId, relType) {
  const task = taskStore.getById(taskId);
  if (!task) return;

  // Check if this relation is stored in OUR task
  const ownRels = (task.relations || []);
  const ownIdx = ownRels.findIndex(r => r.taskId === targetId && r.type === relType);
  if (ownIdx >= 0) {
    const newRels = ownRels.filter((_, i) => i !== ownIdx);
    taskStore.update(taskId, { relations: newRels });
  } else {
    // It's an inverse relation — remove from the OTHER task
    const inv = RELATION_TYPES[relType];
    if (inv) {
      const targetTask = taskStore.getById(targetId);
      if (targetTask) {
        const targetRels = (targetTask.relations || []).filter(r => !(r.taskId === taskId && r.type === inv.inverse));
        taskStore.update(targetId, { relations: targetRels });
      }
    }
  }
  showToast('Связь удалена');
  render();
}

// ==========================================
// Project Modal
// ==========================================
let editingProjectId = null;

function openProjectModal(editId = null) {
  editingProjectId = editId;
  const project = editId ? getProjectById(editId) : null;
  const isEdit = !!project;
  const title = isEdit ? '✏️ Редактировать проект' : '📂 Новый проект';
  const btnText = isEdit ? 'Сохранить' : 'Создать проект';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'project-modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeProjectModal(); };

  overlay.innerHTML = `
    <div class="modal" style="max-width:520px;">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="closeProjectModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Название проекта *</label>
          <input type="text" class="form-input" id="project-name" placeholder="Например: Подряд FIRMA XYZ — сварщики"
                 value="${project ? escapeHtml(project.name) : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Описание</label>
          <textarea class="form-textarea" id="project-description" rows="3" placeholder="Кратко опишите проект...">${project ? escapeHtml(project.description || '') : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Тип проекта</label>
            <select class="form-select" id="project-type">
              <option value="contract" ${!project || project.type === 'contract' ? 'selected' : ''}>📋 Подряд (постоянный)</option>
              <option value="one_time" ${project && project.type === 'one_time' ? 'selected' : ''}>📌 Разовый (с дедлайном)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Статус</label>
            <select class="form-select" id="project-status">
              <option value="active" ${!project || project.status === 'active' ? 'selected' : ''}>🟢 Активный</option>
              <option value="planned" ${project && project.status === 'planned' ? 'selected' : ''}>📝 Планируется</option>
              <option value="completed" ${project && project.status === 'completed' ? 'selected' : ''}>✅ Завершён</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">👤 Координатор проекта</label>
            <select class="form-select" id="project-coordinator">
              <option value="">— Не назначен —</option>
              ${USERS.map(u => `<option value="${u.id}" ${project && project.coordinatorId === u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">🏢 Контрагент</label>
            <input type="text" class="form-input" id="project-contractor" placeholder="Название компании-работодателя"
                   value="${project && project.contractorName ? escapeHtml(project.contractorName) : ''}">
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">⚡ Позже — связь с CRM</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Цвет</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${PROJECT_COLORS.map((c, i) => {
    const isSelected = project ? project.color === c : i === 0;
    return `
              <label style="cursor:pointer;">
                <input type="radio" name="project-color" value="${c}" ${isSelected ? 'checked' : ''} style="display:none;">
                <div class="project-color-swatch" style="width:32px;height:32px;border-radius:8px;background:${c};border:3px solid ${isSelected ? c : 'transparent'};opacity:${isSelected ? '1' : '0.6'};transition:all 150ms;"
                     onclick="document.querySelectorAll('.project-color-swatch').forEach(s=>{s.style.border='3px solid transparent';s.style.opacity='0.6'});this.style.border='3px solid ${c}';this.style.opacity='1';this.previousElementSibling.checked=true;"></div>
              </label>`;
  }).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display:flex;justify-content:${isEdit ? 'space-between' : 'flex-end'};gap:8px;">
        ${isEdit ? `<button class="btn btn-ghost" style="color:var(--danger);" onclick="deleteProjectConfirm('${editId}')">🗑️ Удалить</button>` : ''}
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost" onclick="closeProjectModal()">Отмена</button>
          <button class="btn btn-primary" onclick="saveProject()">${btnText}</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('project-name').focus(), 100);
}

function closeProjectModal() {
  editingProjectId = null;
  const overlay = document.getElementById('project-modal-overlay');
  if (overlay) overlay.remove();
}

function saveProject() {
  const name = document.getElementById('project-name').value.trim();
  if (!name) {
    showToast('Введите название проекта', 'error');
    return;
  }

  const colorRadio = document.querySelector('input[name="project-color"]:checked');
  const coordVal = document.getElementById('project-coordinator').value;
  const data = {
    name,
    description: document.getElementById('project-description').value.trim(),
    type: document.getElementById('project-type').value,
    status: document.getElementById('project-status').value,
    color: colorRadio ? colorRadio.value : '#2563eb',
    coordinatorId: coordVal ? parseInt(coordVal) : null,
    contractorName: document.getElementById('project-contractor').value.trim() || null,
    contractorId: null, // TODO: связь с CRM
  };

  if (editingProjectId) {
    updateProject(editingProjectId, data);
    showToast('Проект обновлён');
  } else {
    addProject(data);
    showToast('Проект создан');
  }

  closeProjectModal();
  render();
}

function deleteProjectConfirm(projectId) {
  if (confirm('Удалить проект? Задачи, привязанные к нему, останутся, но потеряют привязку.')) {
    // Unlink tasks
    taskStore.getAll().filter(t => t.projectId === projectId).forEach(t => {
      taskStore.update(t.id, { projectId: null });
    });
    deleteProject(projectId);
    closeProjectModal();
    showToast('Проект удалён');
    navigate('projects');
  }
}

function archiveProject(projectId) {
  const project = getProjectById(projectId);
  if (!project) return;
  const newStatus = project.status === 'archived' ? 'active' : 'archived';
  updateProject(projectId, { status: newStatus });
  showToast(newStatus === 'archived' ? '🗂️ Проект архивирован' : '📂 Проект восстановлен');
  render();
}

function toggleShowArchived(show) {
  showArchivedProjects = show;
  render();
}

// ── Transfer project to another coordinator ──
function transferProjectCoordinator(projectId, newCoordinatorId) {
  const project = getProjectById(projectId);
  if (!project) return;
  
  const oldCoord = project.coordinatorId ? getUserById(project.coordinatorId) : null;
  const newCoord = getUserById(newCoordinatorId);
  
  if (!newCoord) return;
  if (project.coordinatorId === newCoordinatorId) {
    showToast('Этот координатор уже назначен', 'error');
    return;
  }
  
  const oldName = oldCoord ? oldCoord.name : 'Не назначен';
  
  if (!confirm(`Передать проект «${project.name}» от "${oldName}" к "${newCoord.name}"?\n\nИсторическая статистика (зарплаты, часы) за прошлые месяцы сохранится.`)) {
    return;
  }
  
  updateProject(projectId, { coordinatorId: newCoordinatorId });
  showToast(`✅ Проект передан: ${newCoord.name}`);
  render();
}

// ── Worker Detail Page ──
function renderWorkerDetailPage() {
  const workerName = currentWorkerName;
  if (!workerName) return '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-title">Работник не найден</div></div>';

  const fN = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fN2 = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const months = PAYROLL_MONTHS.slice().reverse(); // chronological

  // Gather data for this worker across all months and all projects
  const workerHistory = [];
  let totalHoursAll = 0, totalPayAll = 0, totalRevenueAll = 0, totalMarginAll = 0;
  const projectSet = {};

  months.forEach(m => {
    PROJECTS.forEach(p => {
      const pd = getProjectPayrollDetail(p.id, m.key);
      if (!pd.hasData) return;
      const w = pd.workers.find(x => x.name === workerName);
      if (!w || w.hours <= 0) return;
      workerHistory.push({
        month: m.label, monthKey: m.key,
        project: p.name, projectId: p.id, projectColor: p.color,
        hours: w.hours, hoursDay: w.hoursDay, hoursNight: w.hoursNight,
        rate: w.rate, rateNight: w.rateNight,
        pay: w.pay, revenue: w.revenue, margin: w.margin,
        hasDayNight: pd.hasDayNight,
        isForecast: pd.isForecast || false,
      });
      totalHoursAll += w.hours;
      totalPayAll += w.pay;
      totalRevenueAll += w.revenue;
      totalMarginAll += w.margin;
      if (!projectSet[p.id]) projectSet[p.id] = { name: p.name, color: p.color, months: new Set(), totalHours: 0, totalPay: 0, totalMargin: 0 };
      projectSet[p.id].months.add(m.key);
      projectSet[p.id].totalHours += w.hours;
      projectSet[p.id].totalPay += w.pay;
      projectSet[p.id].totalMargin += w.margin;
    });
  });

  if (workerHistory.length === 0) {
    return `<div class="animate-in"><div style="margin-bottom:12px;"><a href="#projects" style="font-size:13px;color:var(--primary);cursor:pointer;">← Проекты</a></div><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">Нет данных для «${workerName}»</div></div></div>`;
  }

  // Initials & color
  const nameParts = workerName.split(' ');
  const initials = nameParts.length >= 2 ? nameParts[0][0] + nameParts[1][0] : nameParts[0].slice(0, 2);
  const colors = ['#f59e0b', '#2563eb', '#7c3aed', '#dc2626', '#059669', '#0891b2', '#be185d', '#ea580c'];
  const avatarColor = colors[workerName.charCodeAt(0) % colors.length];

  // Monthly aggregation
  const monthlyAgg = {};
  months.forEach(m => { monthlyAgg[m.key] = { label: m.label.split(' ')[0].slice(0, 3), hours: 0, pay: 0, margin: 0 }; });
  workerHistory.forEach(h => { monthlyAgg[h.monthKey].hours += h.hours; monthlyAgg[h.monthKey].pay += h.pay; monthlyAgg[h.monthKey].margin += h.margin; });

  // Generate March forecast from Jan/Feb if March has no real data
  const janFebH = workerHistory.filter(h => h.monthKey === '2026-01' || h.monthKey === '2026-02');
  const janFebTotalH = janFebH.reduce((s, h) => s + h.hours, 0);
  const janFebWorkDays = 42; // Jan=22, Feb=20
  const avgDailyH = janFebTotalH > 0 ? janFebTotalH / janFebWorkDays : 8;

  // Seeded pseudo-random for daily variance
  const seedFn = (d) => {
    let h = workerName.length * 2654435761 + d * 16777619;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    return ((h >> 16) ^ h) & 0x7fffffff;
  };

  // Calculate forecast for March
  let marchForecastH = 0;
  const marchDays = [];
  const todayDt = new Date();
  const todayDay = todayDt.getFullYear() === 2026 && todayDt.getMonth() === 2 ? todayDt.getDate() : 31;
  for (let d = 1; d <= 31; d++) {
    const dow = new Date(2026, 2, d).getDay();
    const isWE = dow === 0 || dow === 6;
    let hrs = 0;
    if (!isWE) {
      const rnd = (seedFn(d) % 1000) / 1000;
      hrs = Math.round(avgDailyH * (0.75 + rnd * 0.5) * 100) / 100;
      if (dow === 5) hrs = Math.round(hrs * 0.85 * 100) / 100;
      marchForecastH += hrs;
    }
    marchDays.push({ d, hours: hrs, isWeekend: isWE, isToday: d === todayDay, isPast: d < todayDay, isFuture: d > todayDay });
  }

  // Inject forecast into March if no real data
  // Check if March data is actually forecast (came from getProjectPayrollDetail with isForecast)
  const marchIsForecast = workerHistory.some(h => h.monthKey === '2026-03' && h.isForecast);
  const marchHasReal = monthlyAgg['2026-03'] && monthlyAgg['2026-03'].hours > 0 && !marchIsForecast;

  // Average rate (needed for forecast too)
  const rates = workerHistory.map(h => h.rate).filter(r => r > 0);
  const avgRate = rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0;

  if (!marchHasReal && monthlyAgg['2026-03'] && marchForecastH > 0) {
    monthlyAgg['2026-03'].hours = marchForecastH;
    monthlyAgg['2026-03'].isForecast = true;
    const avgR = avgRate || 25;
    monthlyAgg['2026-03'].pay = Math.round(marchForecastH * avgR);
    monthlyAgg['2026-03'].margin = Math.round(marchForecastH * 15);
  }

  // Hours worked so far (past workdays only) and future forecast
  const marchWorkedSoFar = marchDays.filter(d => d.isPast && !d.isWeekend).reduce((s, d) => s + d.hours, 0);
  const marchFutureHours = marchDays.filter(d => (d.isFuture || d.isToday) && !d.isWeekend).reduce((s, d) => s + d.hours, 0);

  // Store split in monthlyAgg for stacked bar rendering
  if (monthlyAgg['2026-03'] && monthlyAgg['2026-03'].isForecast) {
    monthlyAgg['2026-03'].pastHours = marchWorkedSoFar;
    monthlyAgg['2026-03'].futureHours = marchFutureHours;
  }

  const mVals = months.map(m => monthlyAgg[m.key]);
  const maxHour = Math.max(...mVals.map(v => v.hours), 1);

  // Projects array
  const projects = Object.values(projectSet).sort((a, b) => b.totalHours - a.totalHours);
  const projMaxH = Math.max(...projects.map(p => p.totalHours), 1);

  // Active months count
  const activeMonths = new Set(workerHistory.map(h => h.monthKey)).size;

  // Avg hours/month
  const avgHoursMonth = activeMonths > 0 ? totalHoursAll / activeMonths : 0;

  // Progress circle (work time in % of max 220h/month) — use forecast for current month
  const lastMonthH = mVals[mVals.length - 1].hours || mVals[mVals.length - 2]?.hours || 0;
  const workPct = Math.min(Math.round(lastMonthH / 220 * 100), 100);
  const circR = 38;
  const circC = 2 * Math.PI * circR;
  const circOff = circC - (workPct / 100) * circC;

  return `
    <div class="animate-in">
      <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        <a href="#projects" style="font-size:13px;color:var(--text-muted);cursor:pointer;text-decoration:none;">Проекты</a>
        <span style="font-size:11px;color:var(--text-muted);">/</span>
        <span style="font-size:13px;color:var(--text-primary);font-weight:500;">${workerName}</span>
      </div>

      <!-- Worker Profile Card (Crextio-inspired) -->
      <div style="display:grid;grid-template-columns:280px 1fr;gap:16px;margin-bottom:20px;">

        <!-- Left: Profile + Compensation -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card" style="background:linear-gradient(135deg,#fef9c3,#fef3c7,#fff7ed);border:1px solid #fde68a;">
            <div class="card-body" style="padding:24px;text-align:center;">
              <div style="width:80px;height:80px;border-radius:50%;background:${avatarColor};color:white;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin:0 auto 12px;box-shadow:0 4px 12px ${avatarColor}44;">${initials}</div>
              <div style="font-size:18px;font-weight:700;color:#1a1a1a;">${workerName}</div>
              <div style="font-size:12px;color:#92400e;margin-top:4px;font-weight:500;">Работник подряда</div>
              <div style="display:flex;justify-content:center;gap:8px;margin-top:12px;">
                <span style="padding:4px 10px;background:#fbbf24;color:#78350f;border-radius:12px;font-size:11px;font-weight:600;">${fN(Math.round(avgRate))} zł/ч</span>
                <span style="padding:4px 10px;background:#34d399;color:#065f46;border-radius:12px;font-size:11px;font-weight:600;">${activeMonths} мес.</span>
              </div>
            </div>
          </div>

          <!-- Compensation Summary -->
          <div class="card">
            <div class="card-header"><span class="card-title" style="font-size:13px;">💰 Заработок (всего)</span></div>
            <div class="card-body" style="padding:12px 16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
                <span style="font-size:12px;color:var(--text-muted);">Зарплата</span>
                <span style="font-size:14px;font-weight:700;color:#d97706;">${fN(Math.round(totalPayAll))} zł</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
                <span style="font-size:12px;color:var(--text-muted);">Доход компании</span>
                <span style="font-size:14px;font-weight:700;color:#2563eb;">${fN(Math.round(totalRevenueAll))} zł</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
                <span style="font-size:12px;color:var(--text-muted);">Маржа</span>
                <span style="font-size:14px;font-weight:700;color:#15803d;">${fN(Math.round(totalMarginAll))} zł</span>
              </div>
            </div>
          </div>

          <!-- Projects List -->
          <div class="card">
            <div class="card-header"><span class="card-title" style="font-size:13px;">📁 Проекты (${projects.length})</span></div>
            <div class="card-body" style="padding:8px 16px;">
              ${projects.map(p => {
                const pPct = Math.round(p.totalHours / projMaxH * 100);
                return `<div style="padding:8px 0;${projects.indexOf(p) < projects.length - 1 ? 'border-bottom:1px solid var(--border-light);' : ''}">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:12px;font-weight:600;color:${p.color};cursor:pointer;" onclick="navigate('project-detail',{projectId:'${Object.keys(projectSet).find(k => projectSet[k] === p)}'})">${p.name}</span>
                    <span style="font-size:11px;color:var(--text-muted);">${fN(Math.round(p.totalHours))} ч</span>
                  </div>
                  <div style="height:4px;border-radius:2px;background:var(--border-light);"><div style="width:${pPct}%;height:100%;border-radius:2px;background:${p.color};transition:width 500ms;"></div></div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Stats Cards + Charts -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <!-- Top stats row -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr) auto;gap:12px;">
            <div class="card" style="padding:16px;">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">⏱ Всего часов</div>
              <div style="font-size:26px;font-weight:700;">${fN(Math.round(totalHoursAll))}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">~${fN(Math.round(avgHoursMonth))} ч/мес</div>
            </div>
            <div class="card" style="padding:16px;">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">💸 Зарплата/мес</div>
              <div style="font-size:26px;font-weight:700;color:#d97706;">${fN(Math.round(totalPayAll / activeMonths))}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">zł в среднем</div>
            </div>
            <div class="card" style="padding:16px;">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">💰 Маржа/мес</div>
              <div style="font-size:26px;font-weight:700;color:#15803d;">${fN(Math.round(totalMarginAll / activeMonths))}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">zł приносит</div>
            </div>
            <!-- Progress circle -->
            <div class="card" style="padding:16px;display:flex;align-items:center;justify-content:center;min-width:110px;">
              <div style="position:relative;width:88px;height:88px;">
                <svg width="88" height="88" viewBox="0 0 88 88" style="transform:rotate(-90deg);">
                  <circle cx="44" cy="44" r="${circR}" fill="none" stroke="#e5e7eb" stroke-width="6"/>
                  <circle cx="44" cy="44" r="${circR}" fill="none" stroke="${workPct > 80 ? '#15803d' : workPct > 50 ? '#f59e0b' : '#dc2626'}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${circC}" stroke-dashoffset="${circOff}" style="transition:stroke-dashoffset 800ms ease;"/>
                </svg>
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                  <div style="font-size:18px;font-weight:700;">${workPct}%</div>
                  <div style="font-size:8px;color:var(--text-muted);margin-top:1px;">нагрузка</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly hours chart -->
          <div class="card">
            <div class="card-header"><span class="card-title">📊 Часы по месяцам</span></div>
            <div class="card-body" style="padding:16px 20px;">
              <div style="display:flex;gap:16px;align-items:flex-end;height:140px;padding-top:10px;">
                ${mVals.map((v, vi) => {
                  const isFcast = v.isForecast;
                  const label = v.hours > 0 ? fN(Math.round(v.hours)) + ' ч' : '—';
                  if (isFcast && v.pastHours > 0) {
                    // Stacked bar: solid past + striped future
                    const totalPct = Math.max(v.hours / maxHour * 100, 3);
                    const pastPct = (v.pastHours / v.hours) * totalPct;
                    const futurePct = totalPct - pastPct;
                    const pastLabel = fN(Math.round(v.pastHours)) + ' ч';
                    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%;">
                    <div style="font-size:10px;font-weight:600;color:#92400e;">${label} <span style="font-size:9px;color:#b45309;">📈</span></div>
                    <div style="flex:1;width:100%;position:relative;">
                      <div style="position:absolute;bottom:0;left:15%;width:70%;height:${totalPct}%;border-radius:6px 6px 2px 2px;overflow:hidden;display:flex;flex-direction:column;transition:height 600ms cubic-bezier(.4,0,.2,1);">
                        <div style="height:${futurePct / totalPct * 100}%;background:repeating-linear-gradient(135deg,#fbbf24,#fbbf24 4px,#fde68a 4px,#fde68a 8px);border-bottom:1.5px dashed #d97706;opacity:0.75;"></div>
                        <div style="flex:1;background:linear-gradient(to top,#f59e0b,#fbbf24);position:relative;">
                          <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:10px;font-weight:700;color:#fff;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.3);">${pastLabel}</span>
                        </div>
                      </div>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${v.label}*</div>
                  </div>`;
                  }
                  // Normal bar
                  return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;">
                  <div style="font-size:12px;font-weight:600;">${label}</div>
                  <div style="flex:1;width:100%;position:relative;">
                    <div style="position:absolute;bottom:0;left:15%;width:70%;height:${Math.max(v.hours / maxHour * 100, 3)}%;background:linear-gradient(to top,#f59e0b,#fbbf24);border-radius:6px 6px 2px 2px;transition:height 600ms cubic-bezier(.4,0,.2,1);"></div>
                  </div>
                  <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${v.label}</div>
                </div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Calendar Forecast for Current Month -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📅 Март 2026 — Прогноз (на основе Янв/Фев)</span>
              <span style="font-size:11px;color:var(--text-muted);padding:2px 8px;background:var(--primary-lighter);border-radius:6px;">🤖 AI-прогноз</span>
            </div>
            <div class="card-body" style="padding:16px 20px;">
              ${(() => {
                const firstDow = new Date(2026, 2, 1).getDay();
                const startOffset = firstDow === 0 ? 6 : firstDow - 1;
                const days = marchDays;
                const daysWorked = marchDays.filter(d => !d.isWeekend).length;
                
                // Color intensity based on hours
                const maxDayH = Math.max(...days.map(d => d.hours), 1);
                const cellColor = (h, isPast, isToday, isFuture) => {
                  if (h === 0) return 'transparent';
                  const intensity = Math.round((h / maxDayH) * 100);
                  if (isPast) return `hsl(45, 90%, ${95 - intensity * 0.4}%)`;
                  if (isToday) return `hsl(200, 80%, ${90 - intensity * 0.35}%)`;
                  return `hsl(45, 60%, ${97 - intensity * 0.2}%)`;
                };
                
                const weekLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
                let calHTML = '<div style="margin-bottom:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
                calHTML += '<span style="font-size:12px;color:var(--text-muted);">Прогноз: <b style="color:var(--text-primary);">' + fN(Math.round(marchForecastH)) + ' ч</b> (' + daysWorked + ' раб. дн.)</span>';
                calHTML += '<span style="font-size:11px;color:var(--text-muted);">·</span>';
                calHTML += '<span style="font-size:12px;color:var(--text-muted);">Среднее: <b style="color:#d97706;">' + fN2(avgDailyH) + ' ч/день</b></span>';
                if (todayDay < 31) {
                  calHTML += '<span style="font-size:11px;color:var(--text-muted);">·</span>';
                  calHTML += '<span style="font-size:12px;color:var(--text-muted);">До сегодня: <b style="color:#15803d;">' + fN(Math.round(marchWorkedSoFar)) + ' ч</b></span>';
                }
                calHTML += '</div>';
                
                // Legend
                calHTML += '<div style="display:flex;gap:12px;margin-bottom:10px;font-size:10px;color:var(--text-muted);">';
                calHTML += '<span>◼ <span style="color:#b45309;">Факт (введено)</span></span>';
                calHTML += '<span>▨ <span style="color:#92400e;">Прогноз (AI)</span></span>';
                calHTML += '<span>🔵 <span style="color:#2563eb;">Сегодня</span></span>';
                calHTML += '<span>— <span style="color:#d1d5db;">Выходной</span></span>';
                calHTML += '</div>';
                
                // Calendar grid
                calHTML += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">';
                
                // Header
                weekLabels.forEach((l, i) => {
                  const isWE = i >= 5;
                  calHTML += '<div style="text-align:center;font-size:10px;font-weight:600;color:' + (isWE ? '#d1d5db' : 'var(--text-muted)') + ';padding:4px 0;">' + l + '</div>';
                });
                
                // Empty cells before day 1
                for (let i = 0; i < startOffset; i++) {
                  calHTML += '<div></div>';
                }
                
                // Day cells
                days.forEach(day => {
                  let bg;
                  if (day.isWeekend) {
                    bg = '#f9fafb';
                  } else if (day.isPast) {
                    // Past = solid (known data)
                    bg = cellColor(day.hours, true, false, false);
                  } else if (day.isToday) {
                    bg = cellColor(day.hours, false, true, false);
                  } else {
                    // Future = striped pattern (forecast)
                    if (day.hours > 0) {
                      bg = 'repeating-linear-gradient(135deg, #fef3c7, #fef3c7 3px, #fde68a 3px, #fde68a 6px)';
                    } else {
                      bg = '#f9fafb';
                    }
                  }
                  const border = day.isToday ? '2px solid #2563eb' : day.isPast && !day.isWeekend ? '1px solid #fde68a' : day.isFuture && !day.isWeekend && day.hours > 0 ? '1.5px dashed #d97706' : '1px solid #f3f4f6';
                  calHTML += '<div style="';
                  calHTML += 'background:' + bg + ';';
                  calHTML += 'border:' + border + ';';
                  calHTML += 'border-radius:8px;';
                  calHTML += 'padding:4px 2px;';
                  calHTML += 'text-align:center;';
                  calHTML += 'min-height:48px;';
                  calHTML += 'position:relative;';
                  calHTML += 'transition:transform 150ms;';
                  calHTML += '" ' + (day.hours > 0 ? 'onmouseover="this.style.transform=\'scale(1.08)\'" onmouseout="this.style.transform=\'scale(1)\'"' : '') + '>';
                  calHTML += '<div style="font-size:11px;font-weight:' + (day.isToday ? '700' : '500') + ';color:' + (day.isToday ? '#2563eb' : day.isWeekend ? '#d1d5db' : 'var(--text-primary)') + ';">' + day.d + '</div>';
                  if (day.hours > 0) {
                    const hColor = day.isToday ? '#2563eb' : day.isPast ? '#b45309' : '#92400e';
                    calHTML += '<div style="font-size:12px;font-weight:700;color:' + hColor + ';margin-top:2px;">' + day.hours.toFixed(1) + '</div>';
                    calHTML += '<div style="font-size:8px;color:' + (day.isPast ? '#d97706' : '#b45309') + ';">' + (day.isFuture ? '📈' : 'ч') + '</div>';
                  }
                  calHTML += '</div>';
                });
                
                calHTML += '</div>';
                return calHTML;
              })()}
            </div>
          </div>

          <!-- Detailed History Table -->
          <div class="card">
            <div class="card-header"><span class="card-title">📋 Детализация по месяцам</span></div>
            <div class="card-body" style="padding:0;">
              <div style="overflow-x:auto;">
                <table class="ppd-table" style="min-width:600px;">
                  <thead>
                    <tr>
                      <th>Месяц</th>
                      <th>Проект</th>
                      <th>Часы</th>
                      <th>Ставка</th>
                      <th>Зарплата</th>
                      <th>Маржа</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${workerHistory.map(h => `
                    <tr>
                      <td style="font-size:12px;font-weight:500;">${h.month}</td>
                      <td><span style="color:${h.projectColor};font-weight:600;cursor:pointer;font-size:12px;" onclick="navigate('project-detail',{projectId:'${h.projectId}'})">${h.project}</span></td>
                      <td style="font-weight:600;">${fN2(h.hours)}${h.hasDayNight ? ` <span style="font-size:10px;color:var(--text-muted);">(☀${fN2(h.hoursDay||0)} 🌙${fN2(h.hoursNight||0)})</span>` : ''}</td>
                      <td>${fN2(h.rate)} zł${h.rateNight ? '/' + fN2(h.rateNight) : ''}</td>
                      <td style="font-weight:600;color:#d97706;">${fN(h.pay)} zł</td>
                      <td style="font-weight:600;color:#15803d;">${fN(h.margin)} zł</td>
                    </tr>`).join('')}
                  </tbody>
                  <tfoot>
                    <tr class="ppd-table-total">
                      <td></td>
                      <td style="font-weight:700;">ИТОГО</td>
                      <td style="font-weight:700;">${fN2(totalHoursAll)}</td>
                      <td></td>
                      <td style="font-weight:700;color:#d97706;">${fN(Math.round(totalPayAll))} zł</td>
                      <td style="font-weight:700;color:#15803d;">${fN(Math.round(totalMarginAll))} zł</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`;
}

// ── Init (async bootstrap from CRM backend) ──
async function tmBootstrap() {
  try {
    const res = await fetch('/api/tm/bootstrap');
    if (!res.ok) throw new Error('bootstrap failed: ' + res.status);
    window.__TM_BOOT = await res.json();
    // Pick up current logged-in user ID from /api/auth/me
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.id) CURRENT_USER_ID = me.id;
      }
    } catch (e) { /* ignore */ }
    // Replace USERS (real CRM users — login-enabled accounts)
    if (typeof USERS !== 'undefined' && window.__TM_BOOT.users) {
      USERS.length = 0;
      window.__TM_BOOT.users.forEach(u => {
        // If user has image avatar URL, replace text avatar with <img>
        if (u.avatarUrl) {
          u.avatar = `<img class="avatar-img" src="${u.avatarUrl}" alt="${u.name}">`;
        }
        USERS.push(u);
      });
    }
    // Replace DEPARTMENTS
    if (typeof DEPARTMENTS !== 'undefined' && window.__TM_BOOT.departments) {
      DEPARTMENTS.length = 0;
      window.__TM_BOOT.departments.forEach(d => DEPARTMENTS.push(d));
    }
    // Replace tasks in TaskStore
    if (typeof taskStore !== 'undefined' && window.__TM_BOOT.tasks) {
      taskStore.tasks = window.__TM_BOOT.tasks.map(t => {
        // Migrate empty assigneeIds to use assigneeId
        let assigneeIds = t.assigneeIds || [];
        if (assigneeIds.length === 0 && t.assigneeId) {
          assigneeIds = [t.assigneeId];
        }
        const assigneeType = t.assigneeType || (assigneeIds.length > 1 ? 'team' : 'user');
        return {
          watcherIds: [], departmentIds: [], groupType: 'single', completedBy: [],
          reminderMinutes: 0, reminderChannels: [], projectId: null,
          ...t,
          assigneeIds,
          assigneeType,
          deadline: t.deadline && t.deadline.length === 10 ? t.deadline + 'T17:00' : t.deadline,
        };
      });
      taskStore.nextId = Math.max(...taskStore.tasks.map(t => t.id), 0) + 1;
    }
    // Replace projects
    if (typeof PROJECTS !== 'undefined' && window.__TM_BOOT.projects) {
      PROJECTS.length = 0;
      PROJECTS.push(...window.__TM_BOOT.projects);
    }
    console.log('✅ TM bootstrap:', window.__TM_BOOT.tasks?.length, 'tasks,', window.__TM_BOOT.projects?.length, 'projects');
  } catch (e) {
    console.warn('⚠️  TM bootstrap failed, using localStorage fallback:', e.message);
  }
}

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('DOMContentLoaded', async () => {
  await tmBootstrap();
  loadProjects();
  handleHashChange();
  if (!window.location.hash) render();
});
