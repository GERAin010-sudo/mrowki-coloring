// ==========================================
// Mock Data for Task Management Module
// ==========================================

// USERS — using `let` so tmBootstrap() can replace with real users from the CRM backend
let USERS = [
  { id: 1, name: 'Oleksandr Gerko', email: 'mrowki.ua@gmail.com', role: 'Директор', avatar: 'OG', color: '#1e40af', accessLevel: 'director' },
];

const ACCESS_LEVELS = {
  director:  { id: 'director',  label: '👑 Директор / Админ', description: 'Видит все задачи', rank: 3 },
  manager:   { id: 'manager',   label: '📋 Менеджер / Координатор', description: 'Свои + отдела + наблюдаемые', rank: 2 },
  employee:  { id: 'employee',  label: '👤 Сотрудник', description: 'Только свои + отделские + наблюдаемые', rank: 1 },
};

// Get departments a user belongs to
function getUserDepartments(userId) {
  return DEPARTMENTS.filter(d => d.memberIds.includes(userId)).map(d => d.id);
}

// Check if user can view a specific task
function canViewTask(task, userId) {
  const user = getUserById(userId);
  if (!user) return false;

  // Director/Admin sees everything
  if (user.accessLevel === 'director') return true;

  // Creator always sees their own task
  if (task.creatorId === userId) return true;

  // Assigned to this user directly
  if (task.assigneeId === userId) return true;

  // User is in assigneeIds (team task)
  if (task.assigneeIds && task.assigneeIds.includes(userId)) return true;

  // User is a watcher
  if (task.watcherIds && task.watcherIds.includes(userId)) return true;

  // Task assigned to a department where user is a member
  if (task.assigneeType === 'department' && task.departmentIds.length > 0) {
    const userDepts = getUserDepartments(userId);
    if (task.departmentIds.some(dId => userDepts.includes(dId))) return true;
  }

  return false;
}

const STATUSES = {
  NEW: { id: 'new', label: 'Новая', color: '#6b7280', bg: '#f3f4f6' },
  IN_PROGRESS: { id: 'in_progress', label: 'В работе', color: '#2563eb', bg: '#dbeafe' },
  REVIEW: { id: 'review', label: 'На проверке', color: '#d97706', bg: '#fef3c7' },
  DONE: { id: 'done', label: 'Выполнена', color: '#059669', bg: '#d1fae5' },
};

const PRIORITIES = {
  LOW: { id: 'low', label: 'Низкий', color: '#6b7280', bg: '#f3f4f6', icon: '↓' },
  MEDIUM: { id: 'medium', label: 'Средний', color: '#2563eb', bg: '#dbeafe', icon: '→' },
  HIGH: { id: 'high', label: 'Высокий', color: '#d97706', bg: '#fef3c7', icon: '↑' },
  CRITICAL: { id: 'critical', label: 'Критический', color: '#dc2626', bg: '#fee2e2', icon: '⚡' },
};

const CATEGORIES = [
  { id: 'hr', label: 'HR', color: '#7c3aed' },
  { id: 'sales', label: 'Продажи', color: '#2563eb' },
  { id: 'recruitment', label: 'Рекрутинг', color: '#059669' },
  { id: 'admin', label: 'Администрация', color: '#dc2626' },
  { id: 'logistics', label: 'Логистика', color: '#d97706' },
  { id: 'finance', label: 'Финансы', color: '#0891b2' },
  { id: 'it', label: 'IT', color: '#4f46e5' },
  { id: 'other', label: 'Другое', color: '#6b7280' },
];

// DEPARTMENTS — using `let` so tmBootstrap() can replace with real data from CRM backend
let DEPARTMENTS = [];

function getDepartmentById(id) {
  return DEPARTMENTS.find(d => d.id === id) || { id: 'unknown', name: 'Неизвестно', memberIds: [], color: '#6b7280' };
}

function getDepartmentMembers(departmentIds) {
  const memberIds = new Set();
  departmentIds.forEach(dId => {
    const dept = getDepartmentById(dId);
    dept.memberIds.forEach(uid => memberIds.add(uid));
  });
  return [...memberIds];
}

const REMINDER_PRESETS = [
  { value: 0, label: 'Без напоминания' },
  { value: 15, label: 'За 15 минут' },
  { value: 30, label: 'За 30 минут' },
  { value: 60, label: 'За 1 час' },
  { value: 120, label: 'За 2 часа' },
  { value: 480, label: 'За 8 часов' },
  { value: 1440, label: 'За 1 день' },
  { value: 2880, label: 'За 2 дня' },
];

const REMINDER_CHANNELS = [
  { id: 'push', label: '🔔 Пуш-уведомление', icon: '🔔' },
  { id: 'telegram', label: '📱 Telegram', icon: '📱' },
  { id: 'email', label: '📧 Email', icon: '📧' },
];

const AVAILABLE_TAGS = [
  { label: 'срочно', color: '#dc2626' },
  { label: 'документы', color: '#2563eb' },
  { label: 'рекрутинг', color: '#7c3aed' },
  { label: 'onboarding', color: '#059669' },
  { label: 'финансы', color: '#d97706' },
  { label: 'коммуникация', color: '#0891b2' },
  { label: 'проверка', color: '#be185d' },
  { label: 'ожидание', color: '#6b7280' },
];

const RELATION_TYPES = {
  blocks:     { label: 'Блокирует',         icon: '🚫', inverse: 'blocked_by', color: '#dc2626' },
  blocked_by: { label: 'Заблокирована',     icon: '⛔', inverse: 'blocks',     color: '#f97316' },
  related:    { label: 'Связана с',         icon: '🔗', inverse: 'related',    color: '#2563eb' },
  duplicate:  { label: 'Дубликат',          icon: '📋', inverse: 'duplicate',  color: '#6b7280' },
};

const TASK_TEMPLATES = [
  {
    id: 'new-worker',
    name: '👤 Новый работник',
    description: 'Набор задач для оформления нового работника на подряд',
    icon: '👤',
    color: '#059669',
    tasks: [
      { title: 'Получить документы от работника', category: 'hr', priority: 'high' },
      { title: 'Проверить разрешение на работу', category: 'hr', priority: 'critical' },
      { title: 'Оформить договор / umowa', category: 'hr', priority: 'high' },
      { title: 'Добавить работника в систему', category: 'admin', priority: 'medium' },
      { title: 'Провести инструктаж по безопасности', category: 'logistics', priority: 'high' },
      { title: 'Организовать транспорт на объект', category: 'logistics', priority: 'medium' },
    ],
  },
  {
    id: 'new-contract',
    name: '📋 Новый подряд',
    description: 'Задачи при запуске нового подряда с работодателем',
    icon: '📋',
    color: '#2563eb',
    tasks: [
      { title: 'Подготовить и подписать NDA', category: 'sales', priority: 'high' },
      { title: 'Составить и согласовать контракт', category: 'sales', priority: 'critical' },
      { title: 'Определить ставки и условия', category: 'sales', priority: 'high' },
      { title: 'Назначить координатора', category: 'admin', priority: 'medium' },
      { title: 'Начать рекрутинг на вакансии', category: 'recruitment', priority: 'high' },
    ],
  },
  {
    id: 'vacancy-recruitment',
    name: '🔍 Рекрутинг на вакансию',
    description: 'Стандартный процесс набора людей на вакансию',
    icon: '🔍',
    color: '#7c3aed',
    tasks: [
      { title: 'Разместить вакансию на площадках', category: 'recruitment', priority: 'high' },
      { title: 'Провести первичный отбор резюме', category: 'recruitment', priority: 'medium' },
      { title: 'Провести собеседования', category: 'recruitment', priority: 'medium' },
      { title: 'Отправить оффер кандидатам', category: 'recruitment', priority: 'high' },
    ],
  },
];

const INITIAL_PROJECTS = [
  { id: 'proj-doppelt', name: 'DOPPELT', description: 'Подряд с разделением на дневные и ночные смены', status: 'active', type: 'contract', color: '#2563eb', creatorId: 1, coordinatorId: 4, contractorName: 'DOPPELT', contractorId: null, createdAt: '2025-06-01T10:00:00' },
  { id: 'proj-netbox', name: 'NETBOX', description: 'Крупнейший подряд — 27 работников', status: 'active', type: 'contract', color: '#059669', creatorId: 1, coordinatorId: 4, contractorName: 'NETBOX', contractorId: null, createdAt: '2025-03-15T10:00:00' },
  { id: 'proj-switala', name: 'Świtała International', description: 'Подряд — 12 работников', status: 'active', type: 'contract', color: '#7c3aed', creatorId: 1, coordinatorId: 4, contractorName: 'Świtała International', contractorId: null, createdAt: '2025-05-01T10:00:00' },
  { id: 'proj-schnellecke', name: 'SCHNELLECKE', description: 'OWW и PM подразделения — 12 работников', status: 'active', type: 'contract', color: '#d97706', creatorId: 1, coordinatorId: 4, contractorName: 'SCHNELLECKE', contractorId: null, createdAt: '2025-07-01T10:00:00' },
  { id: 'proj-dromico', name: 'DROMICO', description: 'Подряд — 9 работников', status: 'active', type: 'contract', color: '#dc2626', creatorId: 1, coordinatorId: 4, contractorName: 'DROMICO', contractorId: null, createdAt: '2025-08-01T10:00:00' },
  { id: 'proj-cheko', name: 'CHEKO', description: 'Подряд — 6 работников', status: 'active', type: 'contract', color: '#0891b2', creatorId: 1, coordinatorId: 4, contractorName: 'CHEKO', contractorId: null, createdAt: '2025-09-01T10:00:00' },
  { id: 'proj-plastrol', name: 'PLASTROL', description: 'Подряд — 5 работников включая OWW', status: 'active', type: 'contract', color: '#be185d', creatorId: 1, coordinatorId: 4, contractorName: 'PLASTROL', contractorId: null, createdAt: '2025-04-01T10:00:00' },
  { id: 'proj-zbychpol', name: 'ZBYCH-POL', description: 'Подряд — 4 работника', status: 'active', type: 'contract', color: '#4f46e5', creatorId: 1, coordinatorId: 4, contractorName: 'ZBYCH-POL', contractorId: null, createdAt: '2025-10-01T10:00:00' },
  { id: 'proj-ekipa', name: 'EKIPA MONTAŻOWA', description: 'Монтажная бригада — 4 работника', status: 'active', type: 'contract', color: '#0d9488', creatorId: 1, coordinatorId: 4, contractorName: 'EKIPA MONTAŻOWA', contractorId: null, createdAt: '2025-11-01T10:00:00' },
  { id: 'proj-brovaria', name: 'BROVARIA', description: 'Подряд pomoc/zmyw — 4 работника', status: 'active', type: 'contract', color: '#b45309', creatorId: 1, coordinatorId: 4, contractorName: 'BROVARIA', contractorId: null, createdAt: '2025-12-01T10:00:00' },
  { id: 'proj-pekabex', name: 'PEKABEX', description: 'Подряд — 3 работника, высокие ставки', status: 'active', type: 'contract', color: '#6366f1', creatorId: 1, coordinatorId: 4, contractorName: 'PEKABEX', contractorId: null, createdAt: '2025-06-15T10:00:00' },
  { id: 'proj-komplexdom', name: 'KOMPLEX-DOM', description: 'Подряд — 3 работника', status: 'active', type: 'contract', color: '#ec4899', creatorId: 1, coordinatorId: 4, contractorName: 'KOMPLEX-DOM', contractorId: null, createdAt: '2025-07-15T10:00:00' },
  { id: 'proj-amokna', name: 'AM OKNA 1', description: 'Подряд — 1 работник', status: 'active', type: 'contract', color: '#14b8a6', creatorId: 1, coordinatorId: 4, contractorName: 'AM OKNA 1', contractorId: null, createdAt: '2026-01-01T10:00:00' },
  { id: 'proj-polraj', name: 'POLRAJ', description: 'Подряд — 1 работник', status: 'active', type: 'contract', color: '#f59e0b', creatorId: 1, coordinatorId: 4, contractorName: 'POLRAJ', contractorId: null, createdAt: '2026-01-15T10:00:00' },
  // ── Viktor Kosmin projects ──
  { id: 'proj-gembiak', name: 'GEMBIAK MIKSTACKI', description: 'Подряд — 20 работников', status: 'active', type: 'contract', color: '#a855f7', creatorId: 1, coordinatorId: 2, contractorName: 'GEMBIAK MIKSTACKI', contractorId: null, createdAt: '2025-04-01T10:00:00' },
  { id: 'proj-brokelmann', name: 'BROKELMANN', description: 'Подряд — 17 работников', status: 'active', type: 'contract', color: '#f97316', creatorId: 1, coordinatorId: 2, contractorName: 'BROKELMANN', contractorId: null, createdAt: '2025-05-01T10:00:00' },
  { id: 'proj-blaszki', name: 'BŁASZKI', description: 'Подряд — 2 работника', status: 'active', type: 'contract', color: '#84cc16', creatorId: 1, coordinatorId: 2, contractorName: 'BŁASZKI', contractorId: null, createdAt: '2025-06-01T10:00:00' },
  { id: 'proj-vipak', name: 'VIPAK', description: 'Подряд — 5 работников', status: 'active', type: 'contract', color: '#06b6d4', creatorId: 1, coordinatorId: 2, contractorName: 'VIPAK', contractorId: null, createdAt: '2025-07-01T10:00:00' },
  { id: 'proj-fugor', name: 'FUGOR', description: 'Подряд — 2 работника', status: 'active', type: 'contract', color: '#e11d48', creatorId: 1, coordinatorId: 2, contractorName: 'FUGOR', contractorId: null, createdAt: '2025-08-01T10:00:00' },
  { id: 'proj-florentyna', name: 'FLORENTYNA', description: 'Подряд — 8 работников', status: 'active', type: 'contract', color: '#8b5cf6', creatorId: 1, coordinatorId: 2, contractorName: 'FLORENTYNA', contractorId: null, createdAt: '2025-09-01T10:00:00' },
  { id: 'proj-bodychief', name: 'BodyChief', description: 'Подряд — 20 работников', status: 'active', type: 'contract', color: '#10b981', creatorId: 1, coordinatorId: 2, contractorName: 'BodyChief', contractorId: null, createdAt: '2025-10-01T10:00:00' },
  { id: 'proj-mdmdruk', name: 'MDM Druk', description: 'Подряд (все филиалы) — 35 работников', status: 'active', type: 'contract', color: '#ef4444', creatorId: 1, coordinatorId: 2, contractorName: 'MDM Druk', contractorId: null, createdAt: '2025-06-15T10:00:00' },
  { id: 'proj-htl', name: 'HT&L Fitting Polska', description: 'Подряд — 1 работник', status: 'active', type: 'contract', color: '#64748b', creatorId: 1, coordinatorId: 2, contractorName: 'HT&L Fitting Polska', contractorId: null, createdAt: '2025-11-01T10:00:00' },
  { id: 'proj-rolf', name: 'ROLF', description: 'Подряд — 8 работников', status: 'active', type: 'contract', color: '#ea580c', creatorId: 1, coordinatorId: 2, contractorName: 'ROLF', contractorId: null, createdAt: '2025-07-15T10:00:00' },
  { id: 'proj-miedzychod', name: 'MIEDZYCHOD', description: 'Подряд — 4 работника', status: 'active', type: 'contract', color: '#0284c7', creatorId: 1, coordinatorId: 2, contractorName: 'MIEDZYCHOD', contractorId: null, createdAt: '2025-12-01T10:00:00' },
  { id: 'proj-klafs', name: 'KLAFS', description: 'Подряд — 2 работника', status: 'active', type: 'contract', color: '#16a34a', creatorId: 1, coordinatorId: 2, contractorName: 'KLAFS', contractorId: null, createdAt: '2026-01-01T10:00:00' },
  { id: 'proj-garte', name: 'GARTE', description: 'Подряд — 1 работник', status: 'active', type: 'contract', color: '#ca8a04', creatorId: 1, coordinatorId: 2, contractorName: 'GARTE', contractorId: null, createdAt: '2026-01-15T10:00:00' },
  { id: 'proj-compact', name: 'Compact', description: 'Группа Compact — 3 работника', status: 'active', type: 'contract', color: '#9333ea', creatorId: 1, coordinatorId: 2, contractorName: 'Compact', contractorId: null, createdAt: '2025-08-15T10:00:00' },
  { id: 'proj-gpf', name: 'GPF', description: 'Подряд GPF + operator — 6 работников', status: 'active', type: 'contract', color: '#0e7490', creatorId: 1, coordinatorId: 2, contractorName: 'GPF', contractorId: null, createdAt: '2025-09-15T10:00:00' },
  { id: 'proj-gpfmiesz', name: 'GPF Mieszalnia', description: 'Подряд GPF Mieszalnia — 9 работников', status: 'active', type: 'contract', color: '#c026d3', creatorId: 1, coordinatorId: 2, contractorName: 'GPF Mieszalnia', contractorId: null, createdAt: '2025-10-15T10:00:00' },
  { id: 'proj-kierowcy', name: 'MRÓWKI KIEROWCY', description: 'Водители — 2 работника', status: 'active', type: 'contract', color: '#475569', creatorId: 1, coordinatorId: 2, contractorName: 'MRÓWKI KIEROWCY', contractorId: null, createdAt: '2025-03-01T10:00:00' },
  // ── New projects (March 2026) ──
  { id: 'proj-anteholz', name: 'Ante - Holz', description: 'Подряд — 7 работников', status: 'active', type: 'contract', color: '#65a30d', creatorId: 1, coordinatorId: 4, contractorName: 'Ante - Holz', contractorId: null, createdAt: '2026-03-01T10:00:00' },
  { id: 'proj-unibike', name: 'Unibike', description: 'Подряд — 2 работника', status: 'active', type: 'contract', color: '#d946ef', creatorId: 1, coordinatorId: 4, contractorName: 'Unibike', contractorId: null, createdAt: '2026-03-01T10:00:00' },
  { id: 'proj-mleczarnia', name: 'Mleczarnia "Turek"', description: 'Молочный завод — 34 работника', status: 'active', type: 'contract', color: '#0369a1', creatorId: 1, coordinatorId: 4, contractorName: 'Mleczarnia Turek', contractorId: null, createdAt: '2026-03-01T10:00:00' },
  { id: 'proj-ksh', name: 'KSH', description: 'Слесари и сварщики — 3 работника', status: 'active', type: 'contract', color: '#b91c1c', creatorId: 1, coordinatorId: 2, contractorName: 'KSH', contractorId: null, createdAt: '2026-03-01T10:00:00' },
  { id: 'proj-eurodruk', name: 'EURODRUK', description: 'Подряд — 3 работника', status: 'active', type: 'contract', color: '#4338ca', creatorId: 1, coordinatorId: 2, contractorName: 'EURODRUK', contractorId: null, createdAt: '2026-03-01T10:00:00' },
];

// ==========================================
// Payroll Data — February 2026 (BOTH coordinators)
// ==========================================
const PAYROLL_DATA = {
  month: '2026-02',
  monthLabel: 'Февраль 2026',
  revenueMarkup: 15, // +15 zł/hour company margin
  currency: 'PLN',
  projects: {
    // ── KORZHO PROJECTS ──
    'proj-doppelt': {
      coordinator: 'korzho', hasDayNight: true,
      workers: [
        { name: 'GEBRETSADIK RAHEL ABEBE', rateDay: 30, hoursDay: 197.18, rateNight: 30, hoursNight: 43.97, total: 7234.50 },
        { name: 'PANJAITAN EMRI FREDY', rateDay: 30, hoursDay: 201.5, rateNight: 30, hoursNight: 44, total: 7365.00 },
        { name: 'YAGIN MELANY', rateDay: 25.5, hoursDay: 261.5, rateNight: 30, hoursNight: 10, total: 6968.25 },
        { name: 'MYNDZIAK SOFIIA', rateDay: 31.4, hoursDay: 85.1, rateNight: 31.4, hoursNight: 94.57, total: 5641.64 },
        { name: 'ABIYO LEMLEM GETACHEW', rateDay: 31.4, hoursDay: 78.38, rateNight: 31.4, hoursNight: 63.12, total: 4443.10 },
        { name: 'SHEMA ROBERT', rateDay: 25.5, hoursDay: 236.02, rateNight: 0, hoursNight: 0, total: 6018.51 },
        { name: 'TUGIRIMANA JEANNE', rateDay: 25.5, hoursDay: 221.5, rateNight: 30, hoursNight: 15, total: 6098.25 },
        { name: 'MUHAYIMANA VALENTINE', rateDay: 25.5, hoursDay: 175, rateNight: 30, hoursNight: 35, total: 5512.50 },
        { name: 'UWIMANA DIANE', rateDay: 25.5, hoursDay: 210, rateNight: 30, hoursNight: 20, total: 5955.00 },
        { name: 'HABYARIMANA JEAN PAUL', rateDay: 25.5, hoursDay: 230, rateNight: 30, hoursNight: 25, total: 6615.00 },
        { name: 'GASANA EMMANUEL', rateDay: 25.5, hoursDay: 190, rateNight: 30, hoursNight: 40, total: 6045.00 },
        { name: 'NIYONSABA FRANCOIS', rateDay: 25.5, hoursDay: 205, rateNight: 30, hoursNight: 18, total: 5767.50 },
        { name: 'INGABIRE JOSIANE', rateDay: 25.5, hoursDay: 180, rateNight: 30, hoursNight: 22, total: 5250.00 },
        { name: 'TEMBERO TAMENECH HAILE', rateDay: 25.5, hoursDay: 0, rateNight: 30, hoursNight: 0, total: 0 },
        { name: 'LUMAKANDA WYCLIFFE', rateDay: 25.5, hoursDay: 0, rateNight: 30, hoursNight: 0, total: 0 },
      ],
    },
    'proj-zbychpol': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MYRNYI MYKOLA', rate: 27.5, hours: 195, total: 5362.50 },
        { name: 'SAVELIEV DENYS', rate: 28.5, hours: 179, total: 5101.50 },
        { name: 'MYRNA TETIANA', rate: 28, hours: 171.5, total: 4802.00 },
        { name: 'SEMENIUK DMYTRO', rate: 26, hours: 162.5, total: 4225.00 },
      ],
    },
    'proj-netbox': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MEPISOVI ZVIADI', rate: 27, hours: 271, total: 7317.00 },
        { name: 'KATKOV PYLYP', rate: 27, hours: 254, total: 6858.00 },
        { name: 'HAREA VLADIMIR', rate: 27, hours: 226, total: 6102.00 },
        { name: 'GROSU MAKSIM', rate: 28, hours: 219.5, total: 6146.00 },
        { name: 'PARFENI NATALIA', rate: 27, hours: 259.5, total: 7266.00 },
        { name: 'LYTVYNENKO SERHII', rate: 28, hours: 228, total: 6384.00 },
        { name: 'CHAIKA VIKTORIIA', rate: 32.4, hours: 244.5, total: 7921.80 },
        { name: 'OBUKHIVSKA TETIANA', rate: 28, hours: 247, total: 6916.00 },
        { name: 'HOLOVATENKO NATALIIA', rate: 28, hours: 250.5, total: 7014.00 },
        { name: 'SYDORIAK MARIANA', rate: 28, hours: 245.5, total: 6874.00 },
        { name: 'LISNIAK IRYNA', rate: 28, hours: 252, total: 7056.00 },
        { name: 'LEONENKO ANTON', rate: 28, hours: 228, total: 6384.00 },
        { name: 'KONOVALOV SERHII', rate: 27, hours: 216, total: 5832.00 },
        { name: 'BOICHUK VITALII', rate: 28, hours: 241.5, total: 6762.00 },
        { name: 'DOVBENIUK OLEH', rate: 28, hours: 206.5, total: 5782.00 },
        { name: 'NAUMETS MAKSYM', rate: 27, hours: 216.5, total: 5845.50 },
        { name: 'MEKH OLEH', rate: 27, hours: 201.5, total: 5440.50 },
        { name: 'PEDCHENKO LIUDMYLA', rate: 28, hours: 119, total: 3332.00 },
        { name: 'IVASHCHUK OKSANA', rate: 27, hours: 241.5, total: 6520.50 },
        { name: 'PAVLENKO LIUSIENA', rate: 27, hours: 255.5, total: 6898.50 },
        { name: 'SHMAT YULIIA', rate: 27, hours: 261, total: 7047.00 },
        { name: 'SIUSEL IRYNA', rate: 27, hours: 144, total: 3888.00 },
        { name: 'KRYLOVA KARYNA', rate: 27, hours: 227.5, total: 6142.50 },
        { name: 'DRUMOVA DARYNA', rate: 27, hours: 239.5, total: 6466.50 },
        { name: 'VOVIK NADIIA', rate: 27, hours: 152, total: 4104.00 },
        { name: 'DMYTRASHENKO OLEKSANDR', rate: 28, hours: 155.5, total: 4354.00 },
        { name: 'LYTVYNENKO OLENA', rate: 28, hours: 53.5, total: 1498.00 },
      ],
    },
    'proj-plastrol': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SHTATSKYI RUSLAN', rate: 26.5, hours: 255, total: 6757.50 },
        { name: 'KRAVCHENKO SVITLANA', rate: 25.5, hours: 196, total: 4998.00 },
        { name: 'SHCHESNIUK VALERII', rate: 25.5, hours: 204, total: 5202.00 },
        { name: 'MINIAILO OLHA', rate: 24.5, hours: 216, total: 5292.00 },
        { name: 'LUSHCHAK OLHA', rate: 24.5, hours: 240, total: 5880.00 },
      ],
    },
    'proj-schnellecke': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'BATRAKOV OLEKSII', rate: 26, hours: 136, total: 3536.00, sub: 'OWW' },
        { name: 'SIMONCHUK IHOR', rate: 26, hours: 152, total: 3952.00, sub: 'OWW' },
        { name: 'KRUTII VALERII', rate: 24.9, hours: 120, total: 2988.00, sub: 'PM' },
        { name: 'SHELEKHOV BOHDAN', rate: 25.9, hours: 170, total: 4403.00, sub: 'PM' },
        { name: 'PALIANYCHUK KATERYNA', rate: 24.9, hours: 136, total: 3386.40, sub: 'PM' },
        { name: 'HLADUN NATALIIA', rate: 24.9, hours: 136, total: 3386.40, sub: 'PM' },
        { name: 'LYMAR YURII', rate: 24.9, hours: 136, total: 3386.40, sub: 'PM' },
        { name: 'TAFTAI SVITLANA', rate: 25.9, hours: 144, total: 3729.60, sub: 'PM' },
        { name: 'DOMNICH-CHARETS ANASTASIYA', rate: 25.9, hours: 164, total: 4247.60 },
        { name: 'DUBADZEL SIARHEI', rate: 26, hours: 172, total: 4472.00, sub: 'OWW' },
        { name: 'KRAVETS VLADYSLAV', rate: 24.9, hours: 136, total: 3386.40, sub: 'PM' },
      ],
    },
    'proj-cheko': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'DIDYCHUK DMYTRO', rate: 26, hours: 200, total: 5200.00 },
        { name: 'BONDARENKO IVAN', rate: 26, hours: 136, total: 3536.00 },
        { name: 'MARTYNIUK NAZARII', rate: 26, hours: 196, total: 5096.00 },
        { name: 'SHVETS BOHDAN', rate: 26, hours: 196, total: 5096.00 },
        { name: 'KHIRENKO YAROSLAV', rate: 26, hours: 168, total: 4368.00 },
        { name: 'TERESHKINA ALINA', rate: 26, hours: 168, total: 4368.00 },
      ],
    },
    'proj-dromico': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'YANCE ARRIETA DILAN DANIEL', rate: 24.5, hours: 193, total: 4728.50 },
        { name: 'YANCE ARRIETA JOHN DAVID', rate: 24.5, hours: 147.16, total: 3605.42 },
        { name: 'GARCIA PAYARES JAIRO', rate: 24.5, hours: 185, total: 4532.50 },
        { name: 'SARMIENTO SARMIENTO ANDRES R.', rate: 25.5, hours: 191.2, total: 4875.60 },
        { name: 'BANQUE MARTINEZ LESKIN JOSE', rate: 24.5, hours: 142, total: 3479.00 },
        { name: 'FLOREZ MADRID YANEDYS MARIA', rate: 24.5, hours: 146.55, total: 3590.48 },
        { name: 'MORENO CARRILLO MARILIS', rate: 24.5, hours: 183.25, total: 4489.63 },
      ],
    },
    'proj-amokna': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'OMOROV SEMETEI', rate: 25.5, hours: 186, total: 4743.00 },
      ],
    },
    'proj-pekabex': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'DUBITSKYI SERHII', rate: 35.5, hours: 220.25, total: 7818.88 },
        { name: 'BRODZINSKYI OLEKSANDR', rate: 30.5, hours: 160.25, total: 4887.63 },
        { name: 'KRASNIKOV SERHII', rate: 30.5, hours: 179.25, total: 5467.13 },
      ],
    },
    'proj-komplexdom': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SHULIKA RUSLAN', rate: 27, hours: 180, total: 4860.00 },
        { name: 'DANKO OLEKSII', rate: 27, hours: 170, total: 4590.00 },
        { name: 'BORTCHENKO ARTEM', rate: 27, hours: 117, total: 3159.00 },
      ],
    },
    'proj-brovaria': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MAJDECKI MARIJANE', rate: 25, hours: 164, total: 4100.00 },
        { name: 'LIETOSHKO YANA', rate: 25, hours: 178.5, total: 4462.50 },
        { name: 'SAMBOLA AIZA', rate: 25, hours: 168.5, total: 4212.50 },
        { name: 'KRAVETS VIKTORRIIA', rate: 25, hours: 84.5, total: 2112.50 },
      ],
    },
    'proj-polraj': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'ARIZA COLL ALEXANDER ALEXIS', rate: 27, hours: 72, total: 1944.00 },
      ],
    },
    'proj-switala': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SERVETNYK MYROSLAVA', rate: 24, hours: 158, total: 3792.00 },
        { name: 'KALYTA OLENA', rate: 24, hours: 148, total: 3552.00 },
        { name: 'KALYTA YELYZAVETA', rate: 24, hours: 204, total: 4896.00 },
        { name: 'KOPYL HALYNA', rate: 24, hours: 214, total: 5136.00 },
        { name: 'SHESTAK NADIIA', rate: 24, hours: 214, total: 5136.00 },
        { name: 'MYROSHNYCHENKO PAVLO', rate: 25, hours: 212, total: 5300.00 },
        { name: 'STESHENKO MARGARYTA', rate: 24, hours: 120, total: 2880.00 },
        { name: 'FRAI MARIANA', rate: 25, hours: 138, total: 3450.00 },
        { name: 'TRETIAK OKSANA', rate: 24, hours: 105, total: 2520.00 },
        { name: 'IRANIUKHTA', rate: 25, hours: 38, total: 950.00 },
        { name: 'MYROSHNYCHENKO SVITLANA', rate: 25, hours: 11, total: 275.00 },
        { name: 'NIKANCHUK SVITLANA', rate: 25, hours: 11, total: 275.00 },
      ],
    },
    'proj-ekipa': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SOKOLENKO ANDRII', rate: 29, hours: 196, total: 5684.00 },
        { name: 'ZAIAT SERGHEI', rate: 29, hours: 188, total: 5452.00 },
        { name: 'VASYLIUK IVAN', rate: 30, hours: 199.5, total: 5985.00 },
        { name: 'KOVALENKO ANDRII', rate: 30, hours: 168, total: 5040.00 },
      ],
    },
    // ── KOSMIN PROJECTS ──
    'proj-gembiak': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ZIMA VOLODYMYR', rate: 30, hours: 84.5, total: 2535.00 },
        { name: 'HALCHENKO VOLODYMYR', rate: 29, hours: 117, total: 3593.00 },
        { name: 'OVERKOV DMYTRO', rate: 29, hours: 146.5, total: 4248.50 },
        { name: 'KUZAN ANATOLII', rate: 29, hours: 92.5, total: 2682.50 },
        { name: 'STEBLYNA ILLIA', rate: 30, hours: 97, total: 3322.50 },
        { name: 'TEMCHENKO YULIAN', rate: 29, hours: 100, total: 2900.00 },
        { name: 'STEBLYNA SERHII', rate: 29, hours: 95, total: 2755.00 },
        { name: 'SHEVTSOV OLEH', rate: 25, hours: 95, total: 2375.00 },
        { name: 'BUTENKO YURII', rate: 25, hours: 87, total: 2175.00 },
        { name: 'HONCHARIUK SERHII', rate: 25, hours: 158, total: 3950.00 },
        { name: 'USTYMENKO ROMAN', rate: 25, hours: 77, total: 1925.00 },
        { name: 'USTYMENKO ANDRII', rate: 25, hours: 69, total: 1725.00 },
        { name: 'RACHKOVSKYI IVAN', rate: 26, hours: 89.5, total: 2327.00 },
        { name: 'HUTSULIAK VASYL', rate: 25, hours: 75, total: 1875.00 },
        { name: 'MOLINSKYI MYKOLA', rate: 26, hours: 81.5, total: 2119.00 },
        { name: 'FIDRIA YEVHENII', rate: 26, hours: 80.5, total: 2093.00 },
        { name: 'SHEVTSOV OLEH 2', rate: 26, hours: 95, total: 2470.00 },
      ],
    },
    'proj-brokelmann': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'SYMONENKO IVAN', rate: 29.5, hours: 191, total: 5634.50 },
        { name: 'MATVIIENKO IHOR', rate: 28.5, hours: 171, total: 4873.50 },
        { name: 'SAMAR ARTUR', rate: 28.5, hours: 203, total: 5785.50 },
        { name: 'SHLINK MYKOLA', rate: 28.5, hours: 182, total: 5187.00 },
        { name: 'VUKOVSKYI DMYTRO', rate: 29.5, hours: 198, total: 5841.00 },
        { name: 'UTSUNASHVILI TORNIKE', rate: 28.5, hours: 117, total: 3334.50 },
        { name: 'ENOKHOVI IVANE', rate: 29.5, hours: 182, total: 5369.00 },
        { name: 'KHALMIRZAIEV DMYTRO', rate: 28.5, hours: 182, total: 5187.00 },
        { name: 'MELKUASHVILI MAMUKA', rate: 28.5, hours: 132, total: 3762.00 },
        { name: 'SHPOTA SERHII', rate: 28.5, hours: 170, total: 4845.00 },
        { name: 'SHEVCHENKO VLADYSLAV', rate: 29.5, hours: 166, total: 4897.00 },
        { name: 'HALYCH MYKOLA', rate: 37.5, hours: 191, total: 7162.50 },
        { name: 'ZAHRIVYI VITALII', rate: 36.5, hours: 174, total: 6351.00 },
        { name: 'YUKHYMCHUK SERGIY', rate: 36.5, hours: 192, total: 7008.00 },
        { name: 'LIUTA NATALIIA', rate: 24.5, hours: 160, total: 3920.00 },
      ],
    },
    'proj-blaszki': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'UTKIN VIKTOR', rate: 29.2, hours: 177.5, total: 5183.00 },
        { name: 'BOHACH OLEH', rate: 28.2, hours: 178, total: 5019.60 },
      ],
    },
    'proj-vipak': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'NADTOCHII OLEKSANDR', rate: 26, hours: 206, total: 5356.00 },
        { name: 'BABAK ILLIA', rate: 25, hours: 136, total: 3400.00 },
        { name: 'PODOLSKYI DMYTRO', rate: 26, hours: 178, total: 4628.00 },
        { name: 'RADCHENKO OLEKSANDR', rate: 26, hours: 153, total: 3978.00 },
        { name: 'KUCHIRKA STANISLAV', rate: 26, hours: 137, total: 3562.00 },
      ],
    },
    'proj-fugor': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'SIRUNANIANI NIKOLAI', rate: 36.5, hours: 157.5, total: 5748.75 },
        { name: 'ZIAZIULIA PAVEL', rate: 37.5, hours: 142, total: 5325.00 },
      ],
    },
    'proj-florentyna': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ONUFREICHUK SVITLANA', rate: 27, hours: 179, total: 4833.00 },
        { name: 'LIEPSHYNA OLENA', rate: 27, hours: 176, total: 4752.00 },
        { name: 'MALOSHTAN NATALIIA', rate: 26, hours: 184, total: 4784.00 },
        { name: 'VASYLCHUK IVANNA', rate: 26.5, hours: 185, total: 4902.50 },
        { name: 'DOTSENKO OLEH', rate: 25.5, hours: 197, total: 5023.50 },
        { name: 'KERIMOV RENAT', rate: 27, hours: 27, total: 729.00 },
        { name: 'VOSKOBIINYK NADIIA', rate: 27, hours: 181, total: 4887.00 },
      ],
    },
    'proj-bodychief': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'BOCHKO YANA', rate: 27, hours: 179.08, total: 4835.16 },
        { name: 'BEREZDETSKA ALLA', rate: 26, hours: 207, total: 5382.00 },
        { name: 'LELENKO LIUDMYLA', rate: 25.5, hours: 201.92, total: 5148.96 },
        { name: 'LELENKO YURII', rate: 25.5, hours: 205.33, total: 5235.92 },
        { name: 'TSIVAN OLHA', rate: 24.5, hours: 220.25, total: 5396.13 },
        { name: 'SUVOROVA IVANNA', rate: 26, hours: 161.67, total: 4203.42 },
        { name: 'PLIUSHKO SVITLANA', rate: 25.5, hours: 136, total: 3468.00 },
        { name: 'SINELNIK ALINA', rate: 31.4, hours: 161.75, total: 5078.95 },
        { name: 'SINELNIK YANA', rate: 31.4, hours: 156.33, total: 4908.76 },
        { name: 'MAKUS ALESIA', rate: 27, hours: 208.08, total: 5618.16 },
        { name: 'SHAPOSHNYK OKSANA', rate: 26, hours: 218.08, total: 5670.08 },
        { name: 'IVANIUK RUSLAN', rate: 27, hours: 153.17, total: 4135.59 },
        { name: 'BILOVUS MAKSYM', rate: 27, hours: 96.17, total: 2596.59 },
        { name: 'GASANIANI LORETA', rate: 26, hours: 87.5, total: 2275.00 },
        { name: 'ILCHUK MYKOLA', rate: 26, hours: 102.17, total: 2656.42 },
        { name: 'SMIRNOVA ALONA', rate: 27, hours: 101.5, total: 2740.50 },
        { name: 'DAVTIAN GIORGI', rate: 26, hours: 104.33, total: 2712.58 },
      ],
    },
    'proj-mdmdruk': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'LYTVYNOVA OKSANA', rate: 24, hours: 266, total: 6384.00 },
        { name: 'SIRENKO SVITLANA', rate: 24, hours: 265, total: 6360.00 },
        { name: 'KONONENKO YEVHENIIA', rate: 24, hours: 255, total: 6120.00 },
        { name: 'KRASNOBRYZHA OLENA', rate: 24, hours: 126, total: 3024.00 },
        { name: 'MALIUHIN OLEKSANDR', rate: 24, hours: 240, total: 5760.00 },
        { name: 'RUDYI YURII', rate: 24, hours: 128, total: 3072.00 },
        { name: 'VORONOI VOLODYMYR', rate: 24, hours: 259, total: 6216.00 },
        { name: 'DOSIAK MARIIA', rate: 25, hours: 254, total: 6350.00 },
        { name: 'PUHACH NATALIIA', rate: 25, hours: 254, total: 6350.00 },
        { name: 'SKYBA ALINA', rate: 24, hours: 174, total: 4176.00 },
        { name: 'ZAIDI SYED SHAHZAIB', rate: 24, hours: 270, total: 6480.00 },
        { name: 'ZASTAVSKA IRYNA', rate: 24, hours: 160, total: 3840.00 },
        { name: 'KOMERYSTYI OLEKSANDR', rate: 25, hours: 270, total: 6750.00 },
        { name: 'SYDORENKO VLADYSLAV', rate: 25, hours: 196, total: 4900.00 },
        { name: 'SYDORENKO TETIANA', rate: 25, hours: 220, total: 5500.00 },
        { name: 'HRYSHA OLEKSANDR', rate: 25, hours: 261, total: 6525.00 },
        { name: 'YEFANOVA NATALIIA', rate: 24, hours: 208, total: 4992.00 },
        { name: 'HOHA INNA', rate: 24, hours: 209, total: 5016.00 },
        { name: 'KALICHENKO TETIANA', rate: 24, hours: 239, total: 5736.00 },
        { name: 'HAVRYSH OLEKSANDR', rate: 24, hours: 227, total: 5448.00 },
        { name: 'VOLOSHYN YEVHEN', rate: 24, hours: 221, total: 5304.00 },
        { name: 'VASYLCHENKO DMYTRO', rate: 25, hours: 272, total: 6800.00 },
        { name: 'HLADKA RIMMA', rate: 24, hours: 262, total: 6288.00 },
        { name: 'LEVSHENKOVA MARIIA', rate: 25, hours: 161.5, total: 4037.50 },
        { name: 'RUDENKO NAZAR', rate: 25, hours: 256, total: 6400.00 },
        { name: 'SAKHNEVYCH YULIIA', rate: 25, hours: 262, total: 6550.00 },
        { name: 'KARAS NATALIIA', rate: 24, hours: 208, total: 4992.00 },
        { name: 'BONDARENKO ANNA', rate: 24, hours: 272, total: 6528.00 },
        { name: 'BONDARENKO YURII', rate: 25, hours: 233.5, total: 5837.50 },
        { name: 'SILINSKYI ARTEM', rate: 25, hours: 44, total: 1100.00 },
        { name: 'RABOZEL OLENA', rate: 24, hours: 48, total: 1152.00 },
      ],
    },
    'proj-htl': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [{ name: 'TELIATNYK VOLODYMYR', rate: 24, hours: 224, total: 5376.00 }],
    },
    'proj-rolf': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'POHRIBNYI ARTEM', rate: 25, hours: 192, total: 4800.00 },
        { name: 'TSYMBALENKO MYKHAILO', rate: 23, hours: 210, total: 4830.00 },
        { name: 'BILONOZHKO VIKTOR', rate: 23, hours: 215, total: 4945.00 },
        { name: 'VARAVA SERHII', rate: 23, hours: 235, total: 5405.00 },
        { name: 'SHKOPA RUSLAN', rate: 23, hours: 207, total: 4761.00 },
        { name: 'ZAKHARCHENKO ANATOLII', rate: 23, hours: 201, total: 4623.00 },
        { name: 'SHULHA SERHII', rate: 23, hours: 203, total: 4669.00 },
      ],
    },
    'proj-miedzychod': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KRYVENTSOVA NATALIIA', rate: 24.5, hours: 191, total: 4679.50 },
        { name: 'HERASYMENKO ALONA', rate: 24.5, hours: 181, total: 4434.50 },
        { name: 'ZUIEVA TETIANA', rate: 24.5, hours: 163, total: 3993.50 },
        { name: 'OMELCHENKO NINA', rate: 24.5, hours: 165, total: 4042.50 },
      ],
    },
    'proj-klafs': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KASHENKOV DENYS', rate: 25, hours: 152, total: 3800.00 },
        { name: 'LUZHYNSKI SAKHRII', rate: 25, hours: 122, total: 3050.00 },
      ],
    },
    'proj-garte': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [{ name: 'KUTALIA ZURIKO', rate: 26, hours: 119, total: 3094.00 }],
    },
    'proj-compact': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KNIHNITSKYI MYKHAILO', rate: 27, hours: 220, total: 5940.00 },
        { name: 'KUVSHYNOV MAKSYM', rate: 30, hours: 164, total: 4920.00 },
        { name: 'SOPILNIAK YEVHENII', rate: 28, hours: 93, total: 2604.00 },
      ],
    },
    'proj-gpf': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ROSIP IAN', rate: 26.5, hours: 228.75, total: 6061.88 },
        { name: 'HUMENIUK ZOIA', rate: 24.5, hours: 230, total: 5635.00 },
        { name: 'KHAREBAVA KOBA', rate: 24.5, hours: 68.5, total: 1678.25 },
        { name: 'MANJAVIDZE TEIMURAZ', rate: 24.5, hours: 241.25, total: 5910.63 },
        { name: 'MUTINYU DAVIS SIMIYU', rate: 23.5, hours: 252.5, total: 5933.75 },
        { name: 'PANKOVSKA OLENA', rate: 25.5, hours: 158.25, total: 4035.38 },
      ],
    },
    'proj-gpfmiesz': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'MOGASHOA MATEE ELICON', rate: 27, hours: 299, total: 8073.00 },
        { name: 'KURIAKOSE BASIL', rate: 26, hours: 253, total: 6578.00 },
        { name: 'PAL DHARAM', rate: 26, hours: 241.5, total: 6279.00 },
        { name: 'SHIGUTE ZERAWEK MELESE', rate: 26, hours: 264.5, total: 6877.00 },
        { name: 'MBUNGE TALENT', rate: 31.4, hours: 190, total: 5966.00 },
        { name: 'GWENJE KUDAKWASHE GEOFFREY', rate: 31.4, hours: 179.5, total: 5636.30 },
        { name: 'ZHERDIEV VIKTOR', rate: 28, hours: 232.5, total: 6510.00 },
        { name: 'SHALNIEV DMYTRO', rate: 27, hours: 238, total: 6426.00 },
      ],
    },
    'proj-kierowcy': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ABDULLAEV SHIRKHAN', rate: 27, hours: 248, total: 6200.00 },
      ],
    },
  },
};

function getPayrollStats() {
  const data = PAYROLL_DATA;
  const markup = data.revenueMarkup;
  const projectList = [];
  let totalWorkers = 0;
  let grandHours = 0;
  let grandPayroll = 0;
  let grandRevenue = 0;

  Object.keys(data.projects).forEach(projId => {
    const proj = data.projects[projId];
    const project = getProjectById(projId);
    if (!project) return;

    let projHours = 0;
    let projPay = 0;
    const activeWorkers = proj.workers.filter(w => {
      const h = proj.hasDayNight ? ((w.hoursDay || 0) + (w.hoursNight || 0)) : (w.hours || 0);
      return h > 0;
    });

    activeWorkers.forEach(w => {
      let wHours = 0;
      if (proj.hasDayNight) {
        wHours = (w.hoursDay || 0) + (w.hoursNight || 0);
      } else {
        wHours = w.hours || 0;
      }
      projHours += wHours;
      projPay += w.total || 0;
    });

    const projRevenue = projPay + (markup * projHours);
    const projMargin = markup * projHours;

    totalWorkers += activeWorkers.length;
    grandHours += projHours;
    grandPayroll += projPay;
    grandRevenue += projRevenue;

    projectList.push({
      id: projId,
      name: project.name,
      color: project.color,
      coordinator: proj.coordinator || 'unknown',
      workerCount: activeWorkers.length,
      totalHours: Math.round(projHours * 100) / 100,
      totalPay: Math.round(projPay * 100) / 100,
      totalRevenue: Math.round(projRevenue * 100) / 100,
      margin: Math.round(projMargin * 100) / 100,
      hasDayNight: proj.hasDayNight,
    });
  });

  // Sort by total pay descending
  projectList.sort((a, b) => b.totalPay - a.totalPay);

  return {
    month: data.monthLabel,
    totalHours: Math.round(grandHours * 100) / 100,
    totalPayroll: Math.round(grandPayroll * 100) / 100,
    totalRevenue: Math.round(grandRevenue * 100) / 100,
    totalMargin: Math.round((grandRevenue - grandPayroll) * 100) / 100,
    totalWorkers,
    totalProjects: projectList.length,
    projects: projectList,
    markup,
  };
}

// ── Get payroll stats for current month (March 2026) using forecasts ──
function getPayrollStatsCurrent() {
  const marchProjects = Object.keys(PAYROLL_DATA_MARCH.projects);
  const projectList = [];
  let totalWorkers = 0, grandHours = 0, grandPayroll = 0, grandRevenue = 0;
  let grandPastHours = 0, grandFutureHours = 0;
  let isForecast = false;

  marchProjects.forEach(projId => {
    const detail = getProjectPayrollDetail(projId, '2026-03');
    if (!detail || !detail.hasData) return;
    const project = getProjectById(projId);
    if (!project) return;

    if (detail.isForecast) isForecast = true;

    totalWorkers += detail.totals.workers;
    grandHours += detail.totals.hours;
    grandPayroll += detail.totals.pay;
    grandRevenue += detail.totals.revenue;
    grandPastHours += detail.totals.pastHours || 0;
    grandFutureHours += detail.totals.futureHours || 0;

    projectList.push({
      id: projId,
      name: project.name,
      color: project.color,
      coordinator: detail.coordinator || 'unknown',
      workerCount: detail.totals.workers,
      totalHours: detail.totals.hours,
      totalPay: detail.totals.pay,
      totalRevenue: detail.totals.revenue,
      margin: detail.totals.margin,
      hasDayNight: detail.hasDayNight,
      isForecast: detail.isForecast,
      pastHours: detail.totals.pastHours || 0,
      futureHours: detail.totals.futureHours || 0,
    });
  });

  // Also include Feb-only projects that aren't in March
  const febProjects = Object.keys(PAYROLL_DATA.projects);
  febProjects.forEach(projId => {
    if (marchProjects.includes(projId)) return;
    // Projects that existed in Feb but not in March — they ended
  });

  projectList.sort((a, b) => b.totalPay - a.totalPay);

  const pastRatio = grandHours > 0 ? grandPastHours / grandHours : 1;

  return {
    month: 'Март 2026',
    monthKey: '2026-03',
    totalHours: Math.round(grandHours * 100) / 100,
    totalPayroll: Math.round(grandPayroll * 100) / 100,
    totalRevenue: Math.round(grandRevenue * 100) / 100,
    totalMargin: Math.round((grandRevenue - grandPayroll) * 100) / 100,
    totalWorkers,
    totalProjects: projectList.length,
    projects: projectList,
    markup: PAYROLL_DATA_MARCH.revenueMarkup,
    isForecast,
    pastHours: Math.round(grandPastHours * 100) / 100,
    futureHours: Math.round(grandFutureHours * 100) / 100,
    pastRatio,
  };
}

// ══════════════════════════════════════════════
// MARCH 2026 — Current month (hours not yet filled)
// ══════════════════════════════════════════════
const PAYROLL_DATA_MARCH = {
  month: '2026-03',
  monthLabel: 'Март 2026',
  revenueMarkup: 15,
  currency: 'PLN',
  projects: {
    // ── KORZHOV PROJECTS (March) ──
    'proj-doppelt': {
      coordinator: 'korzho', hasDayNight: true,
      workers: [
        { name: 'GEBRETSADIK RAHEL ABEBE', rateDay: 30, hoursDay: 0, rateNight: 30, hoursNight: 0, total: 0 },
        { name: 'PANJAITAN EMRI FREDY', rateDay: 30, hoursDay: 0, rateNight: 30, hoursNight: 0, total: 0 },
        { name: 'HATEGEKIMANA JEOVANIS', rateDay: 31.4, hoursDay: 0, rateNight: 31.4, hoursNight: 0, total: 0 },
        { name: 'SHEMA ROBERT', rateDay: 31.4, hoursDay: 0, rateNight: 31.4, hoursNight: 0, total: 0 },
        { name: 'YAGIN MELANY', rateDay: 25.5, hoursDay: 0, rateNight: 25.5, hoursNight: 0, total: 0 },
        { name: 'MWANAKE BRIAN NYANGE', rateDay: 25.5, hoursDay: 0, rateNight: 25.5, hoursNight: 0, total: 0 },
        { name: 'ATBA TAQIYEDDINE', rateDay: 25.5, hoursDay: 0, rateNight: 25.5, hoursNight: 0, total: 0 },
        { name: 'AKE LIDIYA SOLOMON', rateDay: 26.5, hoursDay: 0, rateNight: 26.5, hoursNight: 0, total: 0 },
        { name: 'NDIZIHIWE KEVIN', rateDay: 31.4, hoursDay: 0, rateNight: 31.4, hoursNight: 0, total: 0 },
        { name: 'IRADUKUNDA CARINE', rateDay: 26.5, hoursDay: 0, rateNight: 26.5, hoursNight: 0, total: 0 },
        { name: 'NJERU VICTOR MURIUKI', rateDay: 25.5, hoursDay: 0, rateNight: 25.5, hoursNight: 0, total: 0 },
        { name: 'MYNDZIAK SOFIIA', rateDay: 31.4, hoursDay: 0, rateNight: 31.4, hoursNight: 0, total: 0 },
        { name: 'HUTKAN HANNA', rateDay: 26.5, hoursDay: 0, rateNight: 26.5, hoursNight: 0, total: 0 },
        { name: 'HRUSHCHANSKA NATALIA', rateDay: 26.5, hoursDay: 0, rateNight: 26.5, hoursNight: 0, total: 0 },
        { name: 'BIGIRIMANA CEDRIC', rateDay: 31.4, hoursDay: 0, rateNight: 31.4, hoursNight: 0, total: 0 },
        { name: 'LEMBORO TAMENECH HAILE', rateDay: 25.5, hoursDay: 0, rateNight: 25.5, hoursNight: 0, total: 0 },
        { name: 'LUMAKANDA WYCLIFFE', rateDay: 25.5, hoursDay: 0, rateNight: 25.5, hoursNight: 0, total: 0 },
        { name: 'CHORNOHOR IVAN', rateDay: 26.5, hoursDay: 0, rateNight: 26.5, hoursNight: 0, total: 0 },
        { name: 'NIEKRASOV KYRYLO', rateDay: 26.5, hoursDay: 0, rateNight: 26.5, hoursNight: 0, total: 0 },
      ],
    },
    'proj-zbychpol': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MYRNYI MYKOLA', rate: 27.5, hours: 0, total: 0 },
        { name: 'SAVELIEV DENYS', rate: 28.5, hours: 0, total: 0 },
        { name: 'MYRNA TETIANA', rate: 28, hours: 0, total: 0 },
        { name: 'SEMENIUK DMYTRO', rate: 26, hours: 0, total: 0 },
        { name: 'FLOCOSU EUGENIU', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-netbox': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MEPIZOVI ZVIADI', rate: 27, hours: 0, total: 0 },
        { name: 'KATKOV PYLYP', rate: 27, hours: 0, total: 0 },
        { name: 'HAREA VLADIMIR', rate: 27, hours: 0, total: 0 },
        { name: 'PARFENI NATALIA', rate: 28, hours: 0, total: 0 },
        { name: 'CHAIKA VIKTORIIA', rate: 32.4, hours: 0, total: 0 },
        { name: 'OBUKHIVSKA TETIANA', rate: 28, hours: 0, total: 0 },
        { name: 'HOLOVATENKO NATALIIA', rate: 28, hours: 0, total: 0 },
        { name: 'SYDORIAK MARIANA', rate: 28, hours: 0, total: 0 },
        { name: 'LISNIAK IRYNA', rate: 28, hours: 0, total: 0 },
        { name: 'LEONENKO ANTON', rate: 28, hours: 0, total: 0 },
        { name: 'KONOVALOV SERHII', rate: 28, hours: 0, total: 0 },
        { name: 'BOICHUK VITALII', rate: 28, hours: 0, total: 0 },
        { name: 'PEDCHENKO LIUDMYLA', rate: 28, hours: 0, total: 0 },
        { name: 'DYSHKANT YURII', rate: 28, hours: 0, total: 0 },
        { name: 'DOROSHENKO DAVYD', rate: 28, hours: 0, total: 0 },
        { name: 'NAUMETS MAKSYM', rate: 27, hours: 0, total: 0 },
        { name: 'MEKH OLEH', rate: 27, hours: 0, total: 0 },
        { name: 'ROLSKA OKSANA', rate: 27, hours: 0, total: 0 },
        { name: 'TYTENIUK DENYS', rate: 27, hours: 0, total: 0 },
        { name: 'KEIS VIKTORIIA', rate: 27, hours: 0, total: 0 },
        { name: 'SHEMCHUK HALYNA', rate: 27, hours: 0, total: 0 },
        { name: 'SIUSEL VOLODYMYR', rate: 28, hours: 0, total: 0 },
        { name: 'MUDRYK ROSTYSLAV', rate: 27, hours: 0, total: 0 },
        { name: 'YERSHOV GENNADIY', rate: 27, hours: 0, total: 0 },
        { name: 'GROSU MAKSIM', rate: 28, hours: 0, total: 0 },
        { name: 'VEREMEIIENKO TETIANA', rate: 27, hours: 0, total: 0 },
        { name: 'BARANENKO DMYTRO', rate: 27, hours: 0, total: 0 },
        { name: 'FISENKO YULIIA', rate: 27, hours: 0, total: 0 },
        { name: 'SHKOLIARENKO MAKSYM', rate: 28, hours: 0, total: 0 },
        { name: 'ALISHEROV KUBAN', rate: 26, hours: 0, total: 0 },
        { name: 'IVASHCHUK OKSANA', rate: 27, hours: 0, total: 0 },
        { name: 'PAVLENKO LIUSIENA', rate: 27, hours: 0, total: 0 },
        { name: 'SHMAT YULIIA', rate: 27, hours: 0, total: 0 },
        { name: 'LYTVYNENKO SERHII', rate: 28, hours: 0, total: 0 },
        { name: 'SIUSEL IRYNA', rate: 28, hours: 0, total: 0 },
        { name: 'DOVBENIUK OLEH', rate: 28, hours: 0, total: 0 },
      ],
    },
    'proj-plastrol': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SHTATSKYI RUSLAN', rate: 26.5, hours: 0, total: 0 },
        { name: 'KRAVCHENKO SVITLANA', rate: 25.5, hours: 0, total: 0 },
        { name: 'SHCHESNIUK VALERII', rate: 25.5, hours: 0, total: 0 },
        { name: 'LUSHCHAK OLHA', rate: 24.5, hours: 0, total: 0 },
        { name: 'MINIAILO OLHA', rate: 24.5, hours: 0, total: 0 },
      ],
    },
    'proj-schnellecke': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'BATRAKOV OLEKSII', rate: 26, hours: 0, total: 0, sub: 'OWW' },
        { name: 'SIMONCHUK IHOR', rate: 26, hours: 0, total: 0, sub: 'OWW' },
        { name: 'DUBADZEL SIARHEI', rate: 26, hours: 0, total: 0, sub: 'OWW' },
        { name: 'KRUTII VALERII', rate: 24.9, hours: 0, total: 0, sub: 'PM' },
        { name: 'SHELEKHOV BOHDAN', rate: 25.9, hours: 0, total: 0, sub: 'PM' },
        { name: 'PALIANYCHUK KATERYNA', rate: 24.9, hours: 0, total: 0, sub: 'PM' },
        { name: 'HLADUN NATALIIA', rate: 24.9, hours: 0, total: 0, sub: 'PM' },
        { name: 'LYMAR YURII', rate: 24.9, hours: 0, total: 0, sub: 'PM' },
        { name: 'TAFTAI SVITLANA', rate: 25.9, hours: 0, total: 0, sub: 'PM' },
        { name: 'DOMNICH-CHARETS ANASTASIYA', rate: 25.9, hours: 0, total: 0, sub: 'PM' },
        { name: 'KRAVETS VLADYSLAV', rate: 24.9, hours: 0, total: 0, sub: 'PM' },
      ],
    },
    'proj-cheko': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'DIDYCHUK DMYTRO', rate: 26, hours: 0, total: 0 },
        { name: 'BONDARENKO IVAN', rate: 26, hours: 0, total: 0 },
        { name: 'TERESHKINA ALINA', rate: 26, hours: 0, total: 0 },
        { name: 'YAVORSKYI VOLODYMYR', rate: 26, hours: 0, total: 0 },
        { name: 'MARTYNIUK NAZARII', rate: 26, hours: 0, total: 0 },
        { name: 'SHVETS BOHDAN', rate: 26, hours: 0, total: 0 },
        { name: 'KHIRENKO YAROSLAV', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-dromico': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SALCEDO FAILLACE GUSTAVO', rate: 25.5, hours: 0, total: 0 },
        { name: 'YANCE ARRIETA JOHN DAVID', rate: 24.5, hours: 0, total: 0 },
        { name: 'GARCIA PAYARES JAIRO', rate: 24.5, hours: 0, total: 0 },
        { name: 'SARMIENTO ANDRES RICARDO', rate: 25.5, hours: 0, total: 0 },
        { name: 'VILLAMIZAR JENNIFER PAOLA', rate: 24.5, hours: 0, total: 0 },
        { name: 'BANQUE MARTINEZ LESKIN JOSE', rate: 24.5, hours: 0, total: 0 },
        { name: 'FLOREZ MADRID YANEDYS MARIA', rate: 24.5, hours: 0, total: 0 },
        { name: 'MORENO CARRILLO MARILIS', rate: 24.5, hours: 0, total: 0 },
        { name: 'YANCE ARRIETA DILAN DANIEL', rate: 24.5, hours: 0, total: 0 },
      ],
    },
    'proj-amokna': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'OMOROV SEMETEI', rate: 25.5, hours: 0, total: 0 },
      ],
    },
    'proj-pekabex': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'DUBITSKYI SERHII', rate: 35.5, hours: 0, total: 0 },
        { name: 'BRODZINSKYI OLEKSANDR', rate: 30.5, hours: 0, total: 0 },
        { name: 'KRASNIKOV SERHII', rate: 30.5, hours: 0, total: 0 },
      ],
    },
    'proj-komplexdom': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SHULIKA RUSLAN', rate: 27, hours: 0, total: 0 },
        { name: 'DANKO OLEKSII', rate: 27, hours: 0, total: 0 },
      ],
    },
    'proj-brovaria': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'LIETOSHKO YANA', rate: 25, hours: 0, total: 0 },
        { name: 'MAJDECKI MARIJANE', rate: 25, hours: 0, total: 0 },
      ],
    },
    'proj-polraj': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'ARIZA COLL ALEXANDER ALEXIS', rate: 27, hours: 0, total: 0 },
        { name: 'GOMEZ MARTINEZ FERNANDO', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-switala': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SERVETNYK MYROSLAVA', rate: 24, hours: 0, total: 0 },
        { name: 'KALYTA OLENA', rate: 24, hours: 0, total: 0 },
        { name: 'KALYTA YELYZAVETA', rate: 24, hours: 0, total: 0 },
        { name: 'TRETIAK OKSANA', rate: 24, hours: 0, total: 0 },
        { name: 'KOPYL HALYNA', rate: 24, hours: 0, total: 0 },
        { name: 'SHESTAK NADIIA', rate: 24, hours: 0, total: 0 },
        { name: 'FIRAI MARIANA', rate: 25, hours: 0, total: 0 },
        { name: 'STESHENKO MARGARYTA', rate: 24, hours: 0, total: 0 },
        { name: 'MYROSHNYCHENKO PAVLO', rate: 25, hours: 0, total: 0 },
      ],
    },
    'proj-ekipa': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SOKOLENKO ANDRII', rate: 29, hours: 0, total: 0 },
        { name: 'ZAIAT SERGHEI', rate: 29, hours: 0, total: 0 },
        { name: 'VASYLIUK IVAN', rate: 30, hours: 0, total: 0 },
        { name: 'SHEROYAN HAYK', rate: 29, hours: 0, total: 0 },
        { name: 'FAHRADYAN ARMEN', rate: 29, hours: 0, total: 0 },
      ],
    },
    'proj-anteholz': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'OSIIAN RUSLAN', rate: 23.68, hours: 0, total: 0 },
        { name: 'ANDRIICHUK VASYL', rate: 27.5, hours: 0, total: 0 },
        { name: 'PRIADUN ANDRII', rate: 24.68, hours: 0, total: 0 },
        { name: 'OLIINYK MYROSLAVA', rate: 23.68, hours: 0, total: 0 },
        { name: 'MALCHYK VALERII', rate: 23.68, hours: 0, total: 0 },
        { name: 'PIELYKH ANZHELA', rate: 23.68, hours: 0, total: 0 },
        { name: 'SIVVA VIACHESLAV', rate: 23.68, hours: 0, total: 0 },
      ],
    },
    'proj-unibike': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'PODOBINSKYI TARAS', rate: 27.5, hours: 0, total: 0 },
        { name: 'TEPERENKO YURII', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-mleczarnia': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'HABRAL OLEH', rate: 25.9, hours: 0, total: 0 },
        { name: 'YUDYTSKYI VIKTOR', rate: 25.75, hours: 0, total: 0 },
        { name: 'IHNATIEVA NATALIA', rate: 25.75, hours: 0, total: 0 },
        { name: 'BEZVEZIUK YULIIA', rate: 25.75, hours: 0, total: 0 },
        { name: 'BOICHUK IHOR', rate: 25.75, hours: 0, total: 0 },
        { name: 'ONYSKO MARTA', rate: 24.9, hours: 0, total: 0 },
        { name: 'MATSAN IVANNA', rate: 23.9, hours: 0, total: 0 },
        { name: 'MATSAN YURII', rate: 23.9, hours: 0, total: 0 },
        { name: 'GORDIICHUK TETIANA', rate: 23.9, hours: 0, total: 0 },
        { name: 'NALYVAIKO OLHA', rate: 23.9, hours: 0, total: 0 },
        { name: 'TOPOROVSKYI SERHII', rate: 23.9, hours: 0, total: 0 },
        { name: 'LANEVYCH MARYNA', rate: 23.9, hours: 0, total: 0 },
        { name: 'TSILUIKO ANNA', rate: 23.9, hours: 0, total: 0 },
        { name: 'VEROVKIN OLEH', rate: 23.9, hours: 0, total: 0 },
        { name: 'ZHURAVEL LARYSA', rate: 23.9, hours: 0, total: 0 },
        { name: 'TARNAVSKYI MYKHAILO', rate: 24.9, hours: 0, total: 0 },
        { name: 'CHMYKH YEVHENIIA', rate: 25.75, hours: 0, total: 0 },
        { name: 'KOPANENKO EDUARD', rate: 25.75, hours: 0, total: 0 },
        { name: 'KOPANENKO VITALII', rate: 25.75, hours: 0, total: 0 },
        { name: 'KHOKHLOV YEVHEN', rate: 25.75, hours: 0, total: 0 },
        { name: 'KHOKHLOV SERHII', rate: 25.75, hours: 0, total: 0 },
        { name: 'AVRAMENKO TETIANA', rate: 23.9, hours: 0, total: 0 },
        { name: 'KOTOVYCH VLADYSLAV', rate: 24.9, hours: 0, total: 0 },
        { name: 'BILYNSKA IRYNA', rate: 23.9, hours: 0, total: 0 },
        { name: 'KAZINTSEVA HALYNA', rate: 23.9, hours: 0, total: 0 },
        { name: 'IVASHCHENKO OKSANA', rate: 23.9, hours: 0, total: 0 },
        { name: 'KOPANENKO VLADLEN', rate: 31.4, hours: 0, total: 0 },
        { name: 'BROVKINA VIOLETA', rate: 23.9, hours: 0, total: 0 },
        { name: 'SKELSAROVA YEVHENIIA', rate: 23.9, hours: 0, total: 0 },
        { name: 'VRANCEANU CONSTANTIN', rate: 23.9, hours: 0, total: 0 },
        { name: 'PLATON ELENA', rate: 23.9, hours: 0, total: 0 },
        { name: 'MALINOVSKA TETIANA', rate: 23.9, hours: 0, total: 0 },
        { name: 'PUSHKAR OLENA', rate: 23.9, hours: 0, total: 0 },
        { name: 'TRUSEVYCH ZHANNA', rate: 23.9, hours: 0, total: 0 },
      ],
    },
    // ── KOSMIN PROJECTS (March) ──
    'proj-gembiak': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ZIMA', rate: 30, hours: 0, total: 0 },
        { name: 'HALCHENKO', rate: 29, hours: 0, total: 0 },
        { name: 'KUZAN', rate: 29, hours: 0, total: 0 },
        { name: 'STEBLYNA', rate: 30, hours: 0, total: 0 },
        { name: 'TEMCHENKO', rate: 29, hours: 0, total: 0 },
        { name: 'SHEVTSOV', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-brokelmann': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'SYMONENKO', rate: 29.5, hours: 0, total: 0 },
        { name: 'MATVIIENKO', rate: 28.5, hours: 0, total: 0 },
        { name: 'MUKOVSKYI', rate: 29.5, hours: 0, total: 0 },
        { name: 'ENOKHOVI', rate: 29.5, hours: 0, total: 0 },
        { name: 'HALYCH MYKOLA', rate: 37.5, hours: 0, total: 0 },
        { name: 'ZAHRIIVYI VITALII', rate: 36.5, hours: 0, total: 0 },
      ],
    },
    'proj-bodychief': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'BOCHKO', rate: 27, hours: 0, total: 0 },
        { name: 'BEREZDETSKA', rate: 26, hours: 0, total: 0 },
        { name: 'LELENKO', rate: 25.5, hours: 0, total: 0 },
        { name: 'SINELNIK ALINA', rate: 31.4, hours: 0, total: 0 },
        { name: 'SINELNIK YANA', rate: 31.4, hours: 0, total: 0 },
        { name: 'IVANIUK', rate: 27, hours: 0, total: 0 },
        { name: 'HREK', rate: 27, hours: 0, total: 0 },
      ],
    },
    'proj-mdmdruk': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'SIRENKO', rate: 24, hours: 0, total: 0, sub: 'A' },
        { name: 'KONONENKO', rate: 24, hours: 0, total: 0, sub: 'A' },
        { name: 'RUDYI', rate: 24, hours: 0, total: 0, sub: 'A' },
        { name: 'DOSIAK', rate: 25, hours: 0, total: 0, sub: 'R' },
        { name: 'SYDORENKO', rate: 25, hours: 0, total: 0, sub: 'R' },
        { name: 'RUDENKO', rate: 25, hours: 0, total: 0, sub: 'R' },
        { name: 'SAKHNEVYCH', rate: 25, hours: 0, total: 0, sub: 'Borowki' },
      ],
    },
    'proj-rolf': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'POHRIBNYI', rate: 25, hours: 0, total: 0 },
        { name: 'TSYMBALENKO', rate: 23, hours: 0, total: 0 },
        { name: 'BILONOZHKO', rate: 23, hours: 0, total: 0 },
        { name: 'VARAVA', rate: 23, hours: 0, total: 0 },
        { name: 'SHULHA', rate: 23, hours: 0, total: 0 },
      ],
    },
    'proj-florentyna': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ONUFREICHUK', rate: 27, hours: 0, total: 0 },
        { name: 'LIEPSHYNA', rate: 27, hours: 0, total: 0 },
        { name: 'MALOSHTAN', rate: 26, hours: 0, total: 0 },
        { name: 'VASYLCHUK', rate: 26.5, hours: 0, total: 0 },
        { name: 'KERIMOV', rate: 27, hours: 0, total: 0 },
      ],
    },
    'proj-gpf': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ROSIP', rate: 26.5, hours: 0, total: 0 },
        { name: 'HUMENIUK', rate: 24.5, hours: 0, total: 0 },
        { name: 'MOGASHOA', rate: 27, hours: 0, total: 0 },
        { name: 'KURIAKOSE', rate: 26, hours: 0, total: 0 },
        { name: 'GWENJE', rate: 31.4, hours: 0, total: 0 },
        { name: 'MBUNGE', rate: 31.4, hours: 0, total: 0 },
      ],
    },
    'proj-gpfmiesz': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ROSIP', rate: 26.5, hours: 0, total: 0 },
        { name: 'HUMENIUK', rate: 24.5, hours: 0, total: 0 },
        { name: 'MOGASHOA', rate: 27, hours: 0, total: 0 },
        { name: 'KURIAKOSE', rate: 26, hours: 0, total: 0 },
        { name: 'GWENJE', rate: 31.4, hours: 0, total: 0 },
        { name: 'MBUNGE', rate: 31.4, hours: 0, total: 0 },
        { name: 'ABDULLAEV SHIRKHAN', rate: 28, hours: 0, total: 0 },
        { name: 'TSIKLAURI', rate: 23.5, hours: 0, total: 0 },
      ],
    },
    'proj-ksh': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'HALIANT', rate: 27.8, hours: 0, total: 0, sub: 'ślusarz' },
        { name: 'ZHURAVCHAK', rate: 27.8, hours: 0, total: 0, sub: 'ślusarz' },
        { name: 'HAIDUS', rate: 28.8, hours: 0, total: 0, sub: 'spawacz' },
      ],
    },
    'proj-eurodruk': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'OLIINYK', rate: 26.5, hours: 0, total: 0 },
        { name: 'LOZA', rate: 27.5, hours: 0, total: 0 },
        { name: 'BULYK LIUBOMYR', rate: 31.4, hours: 0, total: 0 },
      ],
    },
    'proj-vipak': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'NADTOCHII', rate: 26, hours: 0, total: 0 },
        { name: 'BABAK', rate: 25, hours: 0, total: 0 },
        { name: 'PODOLSKYI', rate: 26, hours: 0, total: 0 },
        { name: 'KUCHIRKA', rate: 26, hours: 0, total: 0 },
        { name: 'RADCHENKO', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-kierowcy': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'BODNAR MYKOLA', rate: 28, hours: 0, total: 0 },
        { name: 'SHCHERBINA OLEKSII', rate: 28, hours: 0, total: 0 },
      ],
    },
    'proj-htl': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'PYLYPENKO', rate: 25, hours: 0, total: 0 },
      ],
    },
    'proj-miedzychod': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'SOLOMATOV', rate: 25, hours: 0, total: 0 },
        { name: 'KUZNIETSOV', rate: 25, hours: 0, total: 0 },
        { name: 'HOLIUK', rate: 25, hours: 0, total: 0 },
        { name: 'ZHARIKOV', rate: 25, hours: 0, total: 0 },
      ],
    },
    'proj-klafs': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'YEFREMOV', rate: 25, hours: 0, total: 0 },
        { name: 'KOVALCHUK', rate: 25, hours: 0, total: 0 },
      ],
    },
    'proj-garte': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KOROTYCH', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-compact': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'YEFIMENKO', rate: 26, hours: 0, total: 0 },
        { name: 'KRAVCHENKO', rate: 25, hours: 0, total: 0 },
        { name: 'BILETSKYI', rate: 26, hours: 0, total: 0 },
      ],
    },
  },
};



// ══════════════════════════════════════════════
// JANUARY 2026 — Historical data
// ══════════════════════════════════════════════
const PAYROLL_DATA_JAN = {
  month: '2026-01',
  monthLabel: 'Январь 2026',
  revenueMarkup: 15,
  currency: 'PLN',
  projects: {
    // ── KORZHOV PROJECTS (January) ──
    'proj-zbychpol': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MYRNYI MYKOLA', rate: 27.5, hours: 203, total: 5582.50 },
        { name: 'SAVELIEV DENYS', rate: 28.5, hours: 179.5, total: 5115.75 },
        { name: 'MYRNA TETIANA', rate: 28, hours: 201, total: 5628.00 },
        { name: 'SEMENIUK DMYTRO', rate: 26, hours: 0, total: 0 },
        { name: 'FLOCOSU EUGENIU', rate: 27.5, hours: 210, total: 5775.00 },
      ],
    },
    'proj-netbox': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MEPISOVI ZVIADI', rate: 27, hours: 228.5, total: 6169.50 },
        { name: 'KATKOV PYLYP', rate: 27, hours: 226, total: 6102.00 },
        { name: 'HAREA VLADIMIR', rate: 27, hours: 224.5, total: 6061.50 },
        { name: 'GROSU MAKSIM', rate: 28, hours: 220.5, total: 6174.00 },
        { name: 'PARFENI NATALIA', rate: 28, hours: 190, total: 5320.00 },
        { name: 'NAUMETS MAKSYM', rate: 27, hours: 117, total: 3159.00 },
        { name: 'MEKH OLEH', rate: 27, hours: 62, total: 1674.00 },
        { name: 'KOBAURI NATIA', rate: 27, hours: 212, total: 5724.00 },
        { name: 'ILCHUK MYKOLA', rate: 27, hours: 182.5, total: 4927.50 },
        { name: 'SHAMILOV SHIRVAN', rate: 27, hours: 245, total: 6615.00 },
        { name: 'HAREA CONSTANTIN', rate: 27, hours: 224, total: 6048.00 },
        { name: 'SIUSEL IRYNA', rate: 27, hours: 16, total: 432.00 },
        { name: 'VOVK NADIIA', rate: 27, hours: 16, total: 432.00 },
        { name: 'SHMAT YULIIA', rate: 27, hours: 16, total: 432.00 },
        { name: 'PAVLENKO LIUSIENA', rate: 27, hours: 16, total: 432.00 },
        { name: 'KRYLOVA KARYNA', rate: 27, hours: 16, total: 432.00 },
        { name: 'DRUMOVA DARYNA', rate: 27, hours: 16, total: 432.00 },
        { name: 'IVASHCHUK OKSANA', rate: 27, hours: 16, total: 432.00 },
      ],
    },
    'proj-plastrol': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SHTATSKYI RUSLAN', rate: 26.5, hours: 225, total: 5962.50 },
        { name: 'KRAVCHENKO SVITLANA', rate: 25.5, hours: 197, total: 5023.50 },
        { name: 'SHCHESNIUK VALERII', rate: 25.5, hours: 203, total: 5176.50 },
        { name: 'MINIAILO OLHA', rate: 24.5, hours: 232, total: 5684.00 },
        { name: 'LUSHCHAK OLHA', rate: 24.5, hours: 216, total: 5292.00 },
      ],
    },
    'proj-schnellecke': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SHELEKHOV BOHDAN', rate: 25.9, hours: 194, total: 5024.60, sub: 'PM' },
        { name: 'TAFTAI SVITLANA', rate: 25.9, hours: 156, total: 4040.40, sub: 'PM' },
        { name: 'DOMNICH-CHARETS ANASTASIYA', rate: 25.9, hours: 168, total: 4351.20, sub: 'PM' },
        { name: 'DUBADZEL SIARHEI', rate: 26, hours: 176, total: 4576.00, sub: 'OWW' },
        { name: 'BATRAKOV OLEKSII', rate: 26, hours: 148, total: 3848.00, sub: 'OWW' },
        { name: 'SIMONCHUK IHOR', rate: 26, hours: 128, total: 3328.00, sub: 'OWW' },
      ],
    },
    'proj-cheko': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'DIDYCHUK DMYTRO', rate: 31.4, hours: 144, total: 4521.60 },
        { name: 'BONDARENKO IVAN', rate: 31.4, hours: 136, total: 4270.40 },
        { name: 'MARTYNIUK NAZARII', rate: 31.4, hours: 208, total: 6531.20 },
        { name: 'SHVETS BOHDAN', rate: 26, hours: 156, total: 4056.00 },
        { name: 'NAZAROVA HALYNA', rate: 27, hours: 252, total: 6804.00 },
      ],
    },
    'proj-dromico': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'YANCE ARRIETA DILAN DANIEL', rate: 24, hours: 223, total: 5352.00 },
        { name: 'GARCIA PAYARES JAIRO', rate: 24, hours: 263.5, total: 6324.00 },
        { name: 'SALCEDO FAILLACE GUSTAVO', rate: 25, hours: 177.5, total: 4437.50 },
      ],
    },
    'proj-amokna': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'OMOROV SEMETEI', rate: 25.5, hours: 170, total: 4335.00 },
      ],
    },
    'proj-pekabex': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'KRASNIKOV SERHII', rate: 30.5, hours: 175, total: 5337.50 },
      ],
    },
    'proj-komplexdom': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SHULIKA RUSLAN', rate: 27, hours: 132, total: 3564.00 },
      ],
    },
    // ── HLUSHCHUK PROJECTS (January) ──
    'proj-doppelt': {
      coordinator: 'korzho', hasDayNight: true,
      workers: [
        { name: 'GEBRETSADIK RAHEL ABEBE', rateDay: 30, rateNight: 30, hoursDay: 212.82, hoursNight: 20, total: 6984.60 },
        { name: 'PANJAITAN EMRI FREDY', rateDay: 30, rateNight: 30, hoursDay: 217.88, hoursNight: 32, total: 7496.40 },
        { name: 'HATEGEKIMANA JEOVANIS', rateDay: 31.4, rateNight: 31.4, hoursDay: 193.7, hoursNight: 0, total: 6082.18 },
        { name: 'SHEMA ROBERT', rateDay: 31.4, rateNight: 31.4, hoursDay: 226.13, hoursNight: 2, total: 7163.28 },
        { name: 'YAGIN MELANY', rateDay: 25.5, rateNight: 30, hoursDay: 263.82, hoursNight: 6, total: 6907.41 },
        { name: 'MWANAKE BRIAN NYANGE', rateDay: 25.5, rateNight: 30, hoursDay: 239.75, hoursNight: 2, total: 6173.63 },
        { name: 'ABIYO LEMLEM GETACHEW', rateDay: 31.4, rateNight: 31.4, hoursDay: 131.68, hoursNight: 90, total: 6960.75 },
        { name: 'ATBA TAQIYEDDINE', rateDay: 25.5, rateNight: 30, hoursDay: 224.05, hoursNight: 4.5, total: 5848.28 },
        { name: 'AKE LIDIYA SOLOMON', rateDay: 26.5, rateNight: 30, hoursDay: 172.85, hoursNight: 11, total: 4910.53 },
        { name: 'NDIZIHIWE KEVIN', rateDay: 31.4, rateNight: 31.4, hoursDay: 201.12, hoursNight: 0, total: 6315.17 },
        { name: 'IRADUKUNDA CARINE', rateDay: 26.5, rateNight: 30, hoursDay: 174.88, hoursNight: 14, total: 5054.32 },
        { name: 'NJERU VICTOR MURIUKI', rateDay: 25.5, rateNight: 30, hoursDay: 225.47, hoursNight: 0, total: 5749.49 },
        { name: 'HERASYMENKO DANIIL', rateDay: 31.4, rateNight: 31.4, hoursDay: 14.82, hoursNight: 2, total: 528.15 },
        { name: 'MYNDZIAK SOFIIA', rateDay: 31.4, rateNight: 31.4, hoursDay: 32.6, hoursNight: 21.75, total: 1706.59 },
        { name: 'KEBIRU BIRUK', rateDay: 26.5, rateNight: 30, hoursDay: 107.87, hoursNight: 59.82, total: 4653.16 },
        { name: 'NYINDU OKSANA', rateDay: 26.5, rateNight: 30, hoursDay: 107.82, hoursNight: 59.87, total: 4653.33 },
        { name: 'MACHOKI DAIRAV', rateDay: 26.5, rateNight: 30, hoursDay: 55.15, hoursNight: 26.5, total: 2256.48 },
        { name: 'NMONDEKWEL', rateDay: 26.5, rateNight: 30, hoursDay: 55.15, hoursNight: 26.5, total: 2256.48 },
        { name: 'HUTKAN HANNA', rateDay: 26.5, rateNight: 30, hoursDay: 0, hoursNight: 0, total: 0 },
        { name: 'HRUSHCHANSKA NATALIA', rateDay: 26.5, rateNight: 30, hoursDay: 0, hoursNight: 0, total: 0 },
        { name: 'LUMAKANDA WYCLIFFE', rateDay: 25.5, rateNight: 30, hoursDay: 0, hoursNight: 0, total: 0 },
        { name: 'LEMBORO TAMENECH HAILE', rateDay: 25.5, rateNight: 30, hoursDay: 0, hoursNight: 0, total: 0 },
      ],
    },
    'proj-brovaria': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MAJDECKI MARIJANE', rate: 25, hours: 195.5, total: 4887.50 },
        { name: 'LIETOSHKO YANA', rate: 25, hours: 146, total: 3650.00 },
        { name: 'KRAVETS VIKTORIIA', rate: 25, hours: 178.75, total: 4468.75 },
        { name: 'BUDNYK ARKADIUSZ', rate: 31.4, hours: 52.75, total: 1656.35 },
        { name: 'GAMBOA AIZA', rate: 25, hours: 0, total: 0 },
      ],
    },
    'proj-gpf': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'ROSIP IAN', rate: 26.5, hours: 222.5, total: 5896.25 },
        { name: 'HUMENIUK ZOIA', rate: 24.5, hours: 201.5, total: 4936.75 },
        { name: 'KHAREBAVA KOBA', rate: 24.5, hours: 184, total: 4508.00 },
        { name: 'MANJAVIDZE TEIMURAZ', rate: 24.5, hours: 221.75, total: 5432.88 },
        { name: 'MUTINYU DAVIS SIMIYU', rate: 23.5, hours: 92, total: 2162.00 },
      ],
    },
    'proj-gpfmiesz': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'MOGASHOA MATEE ELICON', rate: 27, hours: 344, total: 9288.00 },
        { name: 'KURIAKOSE BASIL', rate: 26, hours: 287, total: 7462.00 },
        { name: 'PAL DHARAM', rate: 26, hours: 276, total: 7176.00 },
        { name: 'SHIGUTE ZERAWEK MELESE', rate: 26, hours: 299, total: 7774.00 },
        { name: 'ZHERDIEV VIKTOR', rate: 28, hours: 270, total: 7560.00 },
        { name: 'SHALNIEV DMYTRO', rate: 27, hours: 258, total: 6966.00 },
      ],
    },
    'proj-switala': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'SERVETNYK MYROSLAVA', rate: 24, hours: 120, total: 2880.00 },
        { name: 'KALYTA OLENA', rate: 24, hours: 128, total: 3072.00 },
        { name: 'KALYTA YELYZAVETA', rate: 24, hours: 159, total: 3816.00 },
        { name: 'KOPYL HALYNA', rate: 24, hours: 214, total: 5136.00 },
        { name: 'SHESTAK NADIIA', rate: 24, hours: 214, total: 5136.00 },
        { name: 'MIAKININA SVITLANA', rate: 25, hours: 165, total: 4125.00 },
        { name: 'MYROSHNYCHENKO PAVLO', rate: 25, hours: 216, total: 5400.00 },
        { name: 'MYROSHNYCHENKO SVITLANA', rate: 25, hours: 189, total: 4725.00 },
        { name: 'STESHENKO MARGARYTA', rate: 24, hours: 151.5, total: 3636.00 },
        { name: 'BLAZIN LILIA', rate: 25, hours: 23, total: 575.00 },
        { name: 'FRAI MARIANA', rate: 25, hours: 8, total: 200.00 },
      ],
    },
    'proj-polraj': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'ARIZA COLL ALEXANDER ALEXIS', rate: 27, hours: 77, total: 2079.00 },
        { name: 'GOMEZ MARTINEZ FERNANDO SILVESTRE', rate: 26, hours: 0, total: 0 },
      ],
    },
    'proj-ekipa': {
      coordinator: 'korzho', hasDayNight: false,
      workers: [
        { name: 'KOVALENKO ANDRII', rate: 30, hours: 196, total: 5880.00 },
        { name: 'SOKOLENKO ANDRII', rate: 29, hours: 168, total: 4872.00 },
        { name: 'ZAIAT SERGHEI', rate: 29, hours: 45, total: 1305.00 },
        { name: 'VASYLIUK IVAN', rate: 30, hours: 112, total: 3360.00 },
      ],
    },
    // ── KOSMIN PROJECTS (January) ──
    'proj-gembiak': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ZIMA VOLODYMYR', rate: 30, hours: 107.5, total: 3132.50 },
        { name: 'HALCHENKO VOLODYMYR', rate: 29, hours: 109.5, total: 3175.50 },
        { name: 'OVERKOV DMYTRO', rate: 29, hours: 110.5, total: 3204.50 },
        { name: 'KUZAN ANATOLII', rate: 29, hours: 78.5, total: 2276.50 },
        { name: 'STEBLYNA ILLIA', rate: 30, hours: 120.5, total: 3535.00 },
        { name: 'TEMCHENKO YULIAN', rate: 29, hours: 90, total: 2610.00 },
        { name: 'STEBLYNA SERHII', rate: 29, hours: 89, total: 2549.00 },
        { name: 'SHEVTSOV OLEH', rate: 25, hours: 106, total: 2650.00 },
        { name: 'BUTENKO YURII', rate: 25, hours: 45, total: 1125.00 },
        { name: 'HONCHARIUK SERHII', rate: 25, hours: 155, total: 3875.00 },
        { name: 'USTYMENKO ROMAN', rate: 25, hours: 45, total: 1125.00 },
        { name: 'USTYMENKO ANDRII', rate: 25, hours: 84, total: 2100.00 },
        { name: 'RACHKOVSKYI IVAN', rate: 26, hours: 84, total: 2184.00 },
        { name: 'HUTSULIAK VASYL', rate: 25, hours: 63, total: 1575.00 },
        { name: 'MOLINSKYI MYKOLA', rate: 26, hours: 75.5, total: 1963.00 },
        { name: 'FIDRIA YEVHENII', rate: 26, hours: 84, total: 2184.00 },
        { name: 'SHEVTSOV OLEH ML', rate: 26, hours: 90, total: 2340.00 },
        { name: 'SHANKO MYKOLA', rate: 25, hours: 25.5, total: 637.50 },
      ],
    },
    'proj-brokelmann': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'SYMONENKO IVAN', rate: 29.5, hours: 185, total: 5457.50 },
        { name: 'MATVIIENKO IHOR', rate: 28.5, hours: 228, total: 6498.00 },
        { name: 'SAMAR ARTUR', rate: 28.5, hours: 209, total: 5956.50 },
        { name: 'SHLINK MYKOLA', rate: 28.5, hours: 198, total: 5643.00 },
        { name: 'MUKOVSKYI DMYTRO', rate: 29.5, hours: 183, total: 5398.50 },
        { name: 'UTSUNASHVILI TORNIKE', rate: 28.5, hours: 183, total: 5215.50 },
        { name: 'ENOKHOVI IVANE', rate: 29.5, hours: 181, total: 5339.50 },
        { name: 'KHALMIRZAIEV DMYTRO', rate: 28.5, hours: 185, total: 5272.50 },
        { name: 'MELKUASHVILI MAMUKA', rate: 28.5, hours: 51, total: 1453.50 },
        { name: 'SHPOTA SERHII', rate: 28.5, hours: 164, total: 4674.00 },
        { name: 'SHEVCHENKO VLADYSLAV', rate: 29.5, hours: 168, total: 4956.00 },
        { name: 'HALYCH MYKOLA', rate: 37.5, hours: 185, total: 6937.50 },
        { name: 'ZAHRIVYI VITALII', rate: 36.5, hours: 185, total: 6752.50 },
        { name: 'YUKHYMCHUK SERGIY', rate: 36.5, hours: 210, total: 7665.00 },
        { name: 'LIUTA NATALIIA', rate: 24.5, hours: 148, total: 3626.00 },
      ],
    },
    'proj-blaszki': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'UTKIN VIKTOR', rate: 29.2, hours: 127.5, total: 3723.00 },
        { name: 'BOHACH OLEH', rate: 28.2, hours: 132.5, total: 3736.50 },
      ],
    },
    'proj-vipak': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'NADTOCHII OLEKSANDR', rate: 26, hours: 210, total: 5460.00 },
        { name: 'BABAK ILLIA', rate: 25, hours: 210, total: 5250.00 },
        { name: 'PODOLSKYI DMYTRO', rate: 26, hours: 209, total: 5434.00 },
        { name: 'RADCHENKO OLEKSANDR', rate: 26, hours: 162, total: 4212.00 },
        { name: 'KUCHIRKA STANISLAV', rate: 26, hours: 119, total: 3094.00 },
      ],
    },
    'proj-fugor': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'SIRUNANIANI NIKOLAI', rate: 36.5, hours: 145, total: 5292.50 },
        { name: 'ZIAZIULIA PAVEL', rate: 36.5, hours: 104, total: 3796.00 },
      ],
    },
    'proj-florentyna': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'ONUFREICHUK SVITLANA', rate: 27, hours: 132, total: 3564.00 },
        { name: 'LIEPSHYNA OLENA', rate: 27, hours: 135, total: 3645.00 },
        { name: 'MALOSHTAN NATALIIA', rate: 26, hours: 173, total: 4498.00 },
        { name: 'VASYLCHUK IVANNA', rate: 26.5, hours: 171, total: 4531.50 },
        { name: 'DOTSENKO OLEH', rate: 25.5, hours: 178, total: 4539.00 },
        { name: 'VIKSENKO NADIIA', rate: 27, hours: 159, total: 4293.00 },
      ],
    },
    'proj-bodychief': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'BOCHKO YANA', rate: 27, hours: 201.92, total: 5451.84 },
        { name: 'BEREZDETSKA ALLA', rate: 26, hours: 177.67, total: 4619.42 },
        { name: 'LELENKO LIUDMYLA', rate: 25.5, hours: 218.58, total: 5573.79 },
        { name: 'LELENKO YURII', rate: 25.5, hours: 203.33, total: 5184.92 },
        { name: 'TSIVAN OLHA', rate: 24.5, hours: 129.17, total: 3164.67 },
        { name: 'SUVOROVA IVANNA', rate: 26, hours: 212.42, total: 5522.92 },
        { name: 'PLIUSHKO SVITLANA', rate: 25.5, hours: 186.83, total: 4764.17 },
        { name: 'DAVITAIA GIORGI', rate: 26, hours: 173.08, total: 4500.08 },
        { name: 'SINELNIK ALINA', rate: 31.4, hours: 189.25, total: 5942.45 },
        { name: 'SINELNIK YANA', rate: 31.4, hours: 175.17, total: 5500.34 },
        { name: 'MAKUS ALESIA', rate: 27, hours: 193.92, total: 5235.84 },
        { name: 'SHAPOSHNYK OKSANA', rate: 26, hours: 159.92, total: 4157.92 },
        { name: 'IVANIUK RUSLAN', rate: 27, hours: 81.42, total: 2198.34 },
        { name: 'KUZMICHOVA LESIA', rate: 26, hours: 16.5, total: 429.00 },
        { name: 'SHUHLIA ALIAKSEI', rate: 26, hours: 31.83, total: 827.58 },
      ],
    },
    'proj-mdmdruk': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'LYTYVNOVA OKSANA', rate: 23.5, hours: 208, total: 4888.00 },
        { name: 'SIRENKO SVITLANA', rate: 23.5, hours: 213, total: 5005.50 },
        { name: 'KONONENKO YEVHENIIA', rate: 23.5, hours: 221, total: 5193.50 },
        { name: 'KRASNOBRYZHA OLENA', rate: 23.5, hours: 152, total: 3572.00 },
        { name: 'MALIUHIN OLEKSANDR', rate: 23.5, hours: 214, total: 5029.00 },
        { name: 'RUDYI YURII', rate: 23.5, hours: 136, total: 3196.00 },
        { name: 'VORONOV VOLODYMYR', rate: 23.5, hours: 202, total: 4747.00 },
        { name: 'DOSIAK MARIIA', rate: 24.5, hours: 88, total: 2156.00 },
        { name: 'PUHACH NATALIIA', rate: 24.5, hours: 184, total: 4508.00 },
        { name: 'SKYBA ALINA', rate: 23.5, hours: 176, total: 4136.00 },
        { name: 'ZAIDI SYED SHAHZAIB', rate: 23.5, hours: 174, total: 4089.00 },
        { name: 'ZASTAVSKA IRYNA', rate: 23.5, hours: 150, total: 3525.00 },
        { name: 'KOMERYSTYI OLEKSANDR', rate: 24.5, hours: 258, total: 6321.00 },
        { name: 'SYDORENKO VLADYSLAV', rate: 24.5, hours: 202, total: 4949.00 },
        { name: 'SYDORENKO TETIANA', rate: 24.5, hours: 180, total: 4410.00 },
        { name: 'HRYSHA OLEKSANDR', rate: 24.5, hours: 186, total: 4557.00 },
        { name: 'YEFANOVA NATALIIA', rate: 23.5, hours: 40, total: 940.00 },
        { name: 'HOHA INNA', rate: 23.5, hours: 166, total: 3901.00 },
        { name: 'KALICHENKO TETIANA', rate: 23.5, hours: 162, total: 3807.00 },
        { name: 'HAVRYSH OLEKSANDR', rate: 23.5, hours: 198, total: 4653.00 },
        { name: 'VOLOSHYN YEVHEN', rate: 23.5, hours: 200, total: 4700.00 },
        { name: 'VASYLCHENKO DMYTRO', rate: 24.5, hours: 220, total: 5390.00 },
        { name: 'HLADKA RIMMA', rate: 23.5, hours: 183, total: 4300.50 },
        { name: 'LEVSHENKOVA MARIIA', rate: 24.5, hours: 156, total: 3822.00 },
        { name: 'RUDENKO NAZAR', rate: 24.5, hours: 158, total: 3871.00 },
        { name: 'SAKHNEVYCH YULIIA', rate: 24.5, hours: 116, total: 2842.00 },
        { name: 'KARAS NATALIIA', rate: 23.5, hours: 196, total: 4606.00 },
        { name: 'BONDARENKO ANNA', rate: 23.5, hours: 196, total: 4606.00 },
        { name: 'CHUMACHENKO ANDRII', rate: 24.5, hours: 136.5, total: 3344.25 },
        { name: 'BURA MARYNA', rate: 24.5, hours: 128, total: 3136.00 },
        { name: 'RYZHUK OLENA', rate: 23.5, hours: 124, total: 2914.00 },
      ],
    },
    'proj-htl': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'TELIATNYK VOLODYMYR', rate: 24, hours: 200, total: 4800.00 },
      ],
    },
    'proj-rolf': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'POHRIBNYI ARTEM', rate: 25, hours: 204, total: 5100.00 },
        { name: 'TSYMBALENKO MYKHAILO', rate: 23, hours: 203, total: 4669.00 },
        { name: 'BILONOZHKO VIKTOR', rate: 23, hours: 176, total: 4048.00 },
        { name: 'VARAVA SERHII', rate: 23, hours: 240, total: 5520.00 },
        { name: 'SHKOPA RUSLAN', rate: 23, hours: 214.3, total: 4928.90 },
        { name: 'ZAKHARCHENKO ANATOLII', rate: 23, hours: 213.3, total: 4905.90 },
        { name: 'SHUIHA SERHII', rate: 23, hours: 216, total: 4968.00 },
        { name: 'VOROPAI VOLODYMYR', rate: 24, hours: 120, total: 2880.00 },
      ],
    },
    'proj-miedzychod': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KRYVENTSOVA NATALIIA', rate: 24.5, hours: 187, total: 4581.50 },
        { name: 'HERASYMENKO ALONA', rate: 24.5, hours: 175, total: 4287.50 },
        { name: 'ZUIEVA TETIANA', rate: 24.5, hours: 96, total: 2352.00 },
        { name: 'OMELCHENKO NINA', rate: 24.5, hours: 147, total: 3601.50 },
      ],
    },
    'proj-klafs': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KASHENKOV DENYS', rate: 25, hours: 119.5, total: 2987.50 },
        { name: 'LUZHYNSKI SIARHEI', rate: 25, hours: 96, total: 2400.00 },
      ],
    },
    'proj-garte': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KUTALIA ZURIKO', rate: 26, hours: 88, total: 2288.00 },
      ],
    },
    'proj-compact': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'KORNIIENKO DENYS', rate: 32, hours: 168, total: 5376.00 },
        { name: 'KNIHNYTSKYI MYKHAILO', rate: 27, hours: 144, total: 3888.00 },
        { name: 'KUVSHYNOV MAKSYM', rate: 30, hours: 60, total: 1800.00 },
        { name: 'SMOTRYTSKYI OLEKSANDR', rate: 31, hours: 32, total: 992.00 },
      ],
    },
    'proj-kierowcy': {
      coordinator: 'kosmin', hasDayNight: false,
      workers: [
        { name: 'BODNAR MYKOLA', rate: 28, hours: 176, total: 4928.00 },
        { name: 'SHCHERBINA OLEKSII', rate: 28, hours: 180, total: 5040.00 },
      ],
    },
  },
};

// ── Available payroll months for switcher ──
const PAYROLL_MONTHS = [
  { key: '2026-03', label: 'Март 2026' },
  { key: '2026-02', label: 'Февраль 2026' },
  { key: '2026-01', label: 'Январь 2026' },
];

// ── Forecast seed function (deterministic per-worker) ──
function _forecastSeed(workerName, day) {
  let h = workerName.length * 2654435761 + day * 16777619;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  return ((h >> 16) ^ h) & 0x7fffffff;
}

// Generate forecast hours for a worker in March based on Jan/Feb data
function _getWorkerForecastMarch(workerName, projectId) {
  // Collect Jan + Feb hours for this worker in this project
  let totalH = 0, monthsFound = 0;
  [PAYROLL_DATA_JAN, PAYROLL_DATA].forEach(dataset => {
    const proj = dataset.projects[projectId];
    if (!proj) return;
    const w = proj.workers.find(x => x.name === workerName);
    if (!w) return;
    let hrs = 0;
    if (proj.hasDayNight) {
      hrs = (w.hoursDay || 0) + (w.hoursNight || 0);
    } else {
      hrs = w.hours || 0;
    }
    if (hrs > 0) { totalH += hrs; monthsFound++; }
  });

  if (monthsFound === 0) return null;

  // Average daily hours (Jan=22 workdays, Feb=20 workdays)
  const workDaysMap = { 1: 22, 2: 20 };
  const totalWorkDays = monthsFound === 2 ? 42 : (monthsFound === 1 ? 21 : 42);
  const avgDailyH = totalH / totalWorkDays;

  // March 2026: generate daily hours with past/future split
  const todayDt = new Date();
  const todayDay = todayDt.getFullYear() === 2026 && todayDt.getMonth() === 2 ? todayDt.getDate() : 31;
  let forecastTotal = 0, pastTotal = 0, futureTotal = 0;
  let forecastDay = 0, forecastNight = 0;
  
  for (let d = 1; d <= 31; d++) {
    const dow = new Date(2026, 2, d).getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    const rnd = (_forecastSeed(workerName, d) % 1000) / 1000;
    let hrs = avgDailyH * (0.75 + rnd * 0.5);
    if (dow === 5) hrs *= 0.85;
    hrs = Math.round(hrs * 100) / 100;
    forecastTotal += hrs;
    if (d < todayDay) { pastTotal += hrs; } else { futureTotal += hrs; }
    forecastDay += Math.round(hrs * 0.7 * 100) / 100;
    forecastNight += Math.round(hrs * 0.3 * 100) / 100;
  }

  return { hours: forecastTotal, hoursDay: forecastDay, hoursNight: forecastNight, pastHours: pastTotal, futureHours: futureTotal };
}

// ── Get detailed payroll for a specific project ──
function getProjectPayrollDetail(projectId, monthKey) {
  // Determine which dataset to use
  const resolvedMonth = monthKey || '2026-03'; // default to current month
  let data;
  if (resolvedMonth === '2026-03') {
    data = PAYROLL_DATA_MARCH;
  } else if (resolvedMonth === '2026-02') {
    data = PAYROLL_DATA;
  } else if (resolvedMonth === '2026-01') {
    data = PAYROLL_DATA_JAN;
  } else {
    return { month: PAYROLL_MONTHS.find(m => m.key === resolvedMonth)?.label || resolvedMonth, hasData: false, workers: [], totals: {} };
  }
  const proj = data.projects[projectId];
  if (!proj) return { month: data.monthLabel, hasData: false, workers: [], totals: {} };

  const markup = data.revenueMarkup;
  const workers = [];
  let totalHours = 0, totalPay = 0, totalRevenue = 0;
  let totalPastHours = 0, totalFutureHours = 0;
  let isForecast = false;

  // Check if current month (needs forecast for remaining days)
  const isCurrentMonth = resolvedMonth === '2026-03';

  proj.workers.forEach(w => {
    let hours = 0, hoursDay = 0, hoursNight = 0;
    if (proj.hasDayNight) {
      hoursDay = w.hoursDay || 0;
      hoursNight = w.hoursNight || 0;
      hours = hoursDay + hoursNight;
    } else {
      hours = w.hours || 0;
    }

    let wPastH = hours;
    let wFutureH = 0;
    let forecast = null;

    // Apply forecast for remaining days
    if (isCurrentMonth) {
      forecast = _getWorkerForecastMarch(w.name, projectId);
      if (forecast && forecast.futureHours > 0) {
        wFutureH = forecast.futureHours;
        hours += wFutureH;
        if (proj.hasDayNight) {
          hoursDay += forecast.hoursDay * (wFutureH / forecast.hours); // rough approximation for split
          hoursNight += forecast.hoursNight * (wFutureH / forecast.hours);
        }
        isForecast = true;
      }
    }

    const rate = proj.hasDayNight ? w.rateDay : (w.rate || 0);
    const rateNight = proj.hasDayNight ? (w.rateNight || 0) : null;

    // Calculate pay: actual pay + forecast pay
    let pay = w.total || 0;
    if (wFutureH > 0) {
      if (proj.hasDayNight) {
        pay += (forecast.hoursDay * (wFutureH / forecast.hours) * rate) + (forecast.hoursNight * (wFutureH / forecast.hours) * rateNight);
      } else {
        pay += wFutureH * rate;
      }
    }

    const rev = pay + (markup * hours);
    const margin = markup * hours;

    workers.push({
      name: w.name,
      hours: Math.round(hours * 100) / 100,
      hoursDay: proj.hasDayNight ? Math.round(hoursDay * 100) / 100 : null,
      hoursNight: proj.hasDayNight ? Math.round(hoursNight * 100) / 100 : null,
      rate,
      rateNight,
      pay: Math.round(pay * 100) / 100,
      revenue: Math.round(rev * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      sub: w.sub || null,
    });

    totalHours += hours;
    totalPay += pay;
    totalRevenue += rev;
    totalPastHours += wPastH;
    totalFutureHours += wFutureH;
  });

  workers.sort((a, b) => b.hours - a.hours);

  return {
    month: data.monthLabel,
    monthKey: data.month,
    hasData: true,
    hasDayNight: proj.hasDayNight,
    coordinator: proj.coordinator,
    markup,
    isForecast,
    workers,
    totals: {
      workers: workers.length,
      hours: Math.round(totalHours * 100) / 100,
      pastHours: Math.round(totalPastHours * 100) / 100,
      futureHours: Math.round(totalFutureHours * 100) / 100,
      pay: Math.round(totalPay * 100) / 100,
      revenue: Math.round(totalRevenue * 100) / 100,
      margin: Math.round((totalRevenue - totalPay) * 100) / 100,
      marginPct: totalRevenue > 0 ? Math.round(((totalRevenue - totalPay) / totalRevenue) * 100) : 0,
    },
  };
}

const PROJECT_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#4f46e5', '#0d9488', '#b45309'];


let PROJECTS = [];

function loadProjects() {
  // Primary: bootstrap data from CRM backend
  if (window.__TM_BOOT?.projects?.length) {
    PROJECTS = [...window.__TM_BOOT.projects];
    return;
  }
  // Fallback: localStorage
  try {
    const stored = localStorage.getItem('mrowki_projects');
    if (stored) { PROJECTS = JSON.parse(stored); return; }
  } catch (e) { console.warn('Failed to load projects', e); }
  PROJECTS = [...INITIAL_PROJECTS];
  saveProjects();
}

function saveProjects() {
  // Cache in localStorage + persist to CRM backend
  try { localStorage.setItem('mrowki_projects', JSON.stringify(PROJECTS)); }
  catch (e) { console.warn('Failed to save projects', e); }
  try {
    fetch('/api/tm/projects/bulk', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PROJECTS),
    }).catch(e => console.warn('TM API save projects failed:', e));
  } catch (e) { /* no fetch */ }
}

function addProject(data) {
  const id = 'proj-' + Date.now();
  const project = { id, creatorId: CURRENT_USER_ID, createdAt: new Date().toISOString(), ...data };
  PROJECTS.push(project);
  saveProjects();
  return project;
}

function deleteProject(id) {
  PROJECTS = PROJECTS.filter(p => p.id !== id);
  saveProjects();
}

function updateProject(id, data) {
  const idx = PROJECTS.findIndex(p => p.id === id);
  if (idx >= 0) {
    PROJECTS[idx] = { ...PROJECTS[idx], ...data };
    saveProjects();
  }
}

function getProjectById(id) {
  return PROJECTS.find(p => p.id === id) || null;
}

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Подготовить документы для нового контрагента Delta Sp.J.',
    description: 'Необходимо подготовить полный пакет документов для заключения договора с контрагентом Delta Sp.J. Jankowski Plucińsk. Включает NDA, основной договор и приложения.',
    status: 'in_progress',
    priority: 'high',
    category: 'sales',
    assigneeId: null,
    assigneeIds: [2, 4],
    assigneeType: 'team',
    creatorId: 1,
    projectId: 'proj-1',
    deadline: '2026-03-28T17:00',
    createdAt: '2026-03-20T10:00:00',
    updatedAt: '2026-03-25T14:30:00',
    subtasks: [
      { id: 1, text: 'Подготовить NDA', done: true },
      { id: 2, text: 'Составить основной договор', done: true },
      { id: 3, text: 'Подготовить приложения к договору', done: false },
      { id: 4, text: 'Согласовать с юристом', done: false },
    ],
    comments: [
      { id: 1, userId: 1, text: 'Прошу подготовить до конца недели', createdAt: '2026-03-20T10:05:00' },
      { id: 2, userId: 2, text: 'NDA готов, приступаю к основному договору', createdAt: '2026-03-22T09:15:00' },
      { id: 3, userId: 2, text: 'Основной договор готов, нужно согласование юриста', createdAt: '2026-03-24T16:40:00' },
    ],
    linkedEntity: { type: 'contractor', name: 'Delta Sp.J. Jankowski Plucińsk' },
    tags: ['документы', 'срочно'],
    attachments: [
      { id: 1, name: 'NDA_Delta_2026.pdf', type: 'pdf', size: '245 KB', addedAt: '2026-03-22T09:00:00', addedBy: 2 },
      { id: 2, name: 'Паспорт_копия.jpg', type: 'image', size: '1.2 MB', addedAt: '2026-03-24T11:00:00', addedBy: 2 },
    ],
    links: [
      { id: 1, title: 'Шаблон NDA', url: 'https://docs.google.com/doc/nda-template', addedBy: 1 },
    ],
    contacts: [
      { id: 1, name: 'Jan Kowalski', phone: '+48 501 234 567', email: 'jan@delta.pl', role: 'Менеджер Delta' },
    ],
    relations: [
      { taskId: 2, type: 'blocks' },
      { taskId: 3, type: 'related' },
    ],
    history: [
      { field: 'status', oldValue: 'Новая', newValue: 'В работе', userId: 2, timestamp: '2026-03-21T09:30:00' },
      { field: 'priority', oldValue: 'Средний', newValue: 'Высокий', userId: 1, timestamp: '2026-03-22T10:15:00' },
      { field: 'assigneeIds', oldValue: 'Viktor Kosmin', newValue: 'Viktor Kosmin, Valentyn Korzhov', userId: 1, timestamp: '2026-03-23T14:00:00' },
      { field: 'deadline', oldValue: '2026-03-30 17:00', newValue: '2026-03-28 17:00', userId: 1, timestamp: '2026-03-24T11:00:00' },
    ],
    timeEntries: [
      { id: 1, userId: 2, minutes: 120, description: 'Подготовка пакета документов', date: '2026-03-21' },
      { id: 2, userId: 2, minutes: 60, description: 'Оформление NDA', date: '2026-03-22' },
      { id: 3, userId: 4, minutes: 30, description: 'Обсуждение условий с контрагентом', date: '2026-03-23' },
    ],
  },
  {
    id: 2,
    title: 'Разместить вакансию "Електрик" на 3 площадках',
    description: 'Опубликовать вакансию электрика на OLX, Pracuj.pl и Indeed. Зарплата 25/6000. Контрагент INSTALCOMPACT.',
    status: 'new',
    priority: 'medium',
    category: 'recruitment',
    assigneeId: 3,
    creatorId: 1,
    projectId: 'proj-1',
    deadline: '2026-03-27',
    createdAt: '2026-03-24T09:00:00',
    updatedAt: '2026-03-24T09:00:00',
    subtasks: [
      { id: 1, text: 'Подготовить описание вакансии', done: false },
      { id: 2, text: 'Разместить на OLX', done: false },
      { id: 3, text: 'Разместить на Pracuj.pl', done: false },
      { id: 4, text: 'Разместить на Indeed', done: false },
    ],
    comments: [
      { id: 1, userId: 1, text: 'Приоритетная вакансия, нужно быстро закрыть', createdAt: '2026-03-24T09:05:00' },
    ],
    linkedEntity: { type: 'vacancy', name: 'Електрик — INSTALCOMPACT' },
  },
  {
    id: 3,
    title: 'Провести собеседования с кандидатами на "Офіціант"',
    description: 'Запланировать и провести собеседования с 5 кандидатами на должность официанта в HOTEL KORMORAN Resort.',
    status: 'in_progress',
    priority: 'high',
    category: 'hr',
    assigneeId: 3,
    creatorId: 1,
    projectId: 'proj-2',
    deadline: '2026-03-29T16:00',
    createdAt: '2026-03-22T11:00:00',
    updatedAt: '2026-03-25T10:20:00',
    subtasks: [
      { id: 1, text: 'Отобрать резюме', done: true },
      { id: 2, text: 'Связаться с кандидатами', done: true },
      { id: 3, text: 'Провести собеседования', done: false },
      { id: 4, text: 'Подготовить отчёт', done: false },
    ],
    comments: [
      { id: 1, userId: 3, text: 'Отобрала 5 подходящих кандидатов', createdAt: '2026-03-23T14:00:00' },
      { id: 2, userId: 3, text: 'Собеседования запланированы на 27-28 марта', createdAt: '2026-03-25T10:20:00' },
    ],
    linkedEntity: { type: 'vacancy', name: 'Офіціант — HOTEL KORMORAN' },
  },
  {
    id: 4,
    title: 'Обновить зарплатную ведомость за март',
    description: 'Подготовить и обновить зарплатную ведомость для всех работников за март 2026.',
    status: 'new',
    priority: 'critical',
    category: 'finance',
    assigneeId: 5,
    creatorId: 1,
    deadline: '2026-03-31',
    createdAt: '2026-03-25T08:00:00',
    updatedAt: '2026-03-25T08:00:00',
    subtasks: [
      { id: 1, text: 'Собрать данные по отработанным часам', done: false },
      { id: 2, text: 'Рассчитать зарплаты', done: false },
      { id: 3, text: 'Подготовить ведомость', done: false },
      { id: 4, text: 'Согласовать с руководством', done: false },
    ],
    comments: [],
    linkedEntity: null,
  },
  {
    id: 5,
    title: 'Организовать транспорт для работников на объект Zbych-Pol',
    description: 'Организовать ежедневный транспорт для 11 работников на объект Zbych-Pol & Mobet Spółka. Начало работ с 1 апреля.',
    status: 'in_progress',
    priority: 'high',
    category: 'logistics',
    assigneeId: 4,
    creatorId: 6,
    deadline: '2026-03-30T09:00',
    createdAt: '2026-03-21T15:00:00',
    updatedAt: '2026-03-25T11:00:00',
    subtasks: [
      { id: 1, text: 'Определить маршрут', done: true },
      { id: 2, text: 'Найти транспортную компанию', done: true },
      { id: 3, text: 'Заключить договор', done: false },
      { id: 4, text: 'Уведомить работников', done: false },
    ],
    comments: [
      { id: 1, userId: 6, text: 'Нужно организовать до 1 апреля', createdAt: '2026-03-21T15:05:00' },
      { id: 2, userId: 4, text: 'Нашёл 2 варианта транспорта, жду согласования цен', createdAt: '2026-03-24T13:30:00' },
    ],
    linkedEntity: { type: 'contractor', name: 'Zbych-Pol & Mobet Spółka' },
  },
  {
    id: 6,
    title: 'Проверить документы 5 новых кандидатов',
    description: 'Проверить полноту и правильность документов у 5 новых кандидатов, зарегистрированных на прошлой неделе.',
    status: 'review',
    priority: 'medium',
    category: 'hr',
    assigneeId: 7,
    creatorId: 3,
    deadline: '2026-03-26T14:00',
    createdAt: '2026-03-23T10:00:00',
    updatedAt: '2026-03-25T16:00:00',
    subtasks: [
      { id: 1, text: 'Проверить паспорта', done: true },
      { id: 2, text: 'Проверить разрешения на работу', done: true },
      { id: 3, text: 'Проверить медицинские справки', done: true },
      { id: 4, text: 'Составить отчёт о проверке', done: false },
    ],
    comments: [
      { id: 1, userId: 7, text: 'Все документы проверены, осталось составить отчёт', createdAt: '2026-03-25T16:00:00' },
    ],
    linkedEntity: null,
  },
  {
    id: 7,
    title: 'Настроить автоматическую рассылку вакансий',
    description: 'Настроить систему автоматической публикации новых вакансий на внешние площадки при создании в CRM.',
    status: 'new',
    priority: 'low',
    category: 'it',
    assigneeId: 6,
    creatorId: 1,
    projectId: 'proj-3',
    deadline: '2026-04-10T17:00',
    createdAt: '2026-03-25T12:00:00',
    updatedAt: '2026-03-25T12:00:00',
    subtasks: [
      { id: 1, text: 'Изучить API площадок', done: false },
      { id: 2, text: 'Разработать интеграцию', done: false },
      { id: 3, text: 'Протестировать', done: false },
    ],
    comments: [],
    linkedEntity: null,
  },
  {
    id: 8,
    title: 'Подготовить отчёт по лидам за Q1 2026',
    description: 'Собрать аналитику по всем лидам за первый квартал 2026 года. Включить воронку конверсии, источники и рекомендации.',
    status: 'done',
    priority: 'medium',
    category: 'sales',
    assigneeId: 2,
    creatorId: 1,
    deadline: '2026-03-25T17:00',
    createdAt: '2026-03-18T09:00:00',
    updatedAt: '2026-03-25T09:30:00',
    subtasks: [
      { id: 1, text: 'Собрать данные из CRM', done: true },
      { id: 2, text: 'Подготовить графики', done: true },
      { id: 3, text: 'Написать рекомендации', done: true },
      { id: 4, text: 'Отправить руководству', done: true },
    ],
    comments: [
      { id: 1, userId: 2, text: 'Отчёт готов и отправлен на почту', createdAt: '2026-03-25T09:30:00' },
      { id: 2, userId: 1, text: 'Отлично, спасибо! Всё по плану.', createdAt: '2026-03-25T09:45:00' },
    ],
    linkedEntity: null,
  },
  {
    id: 9,
    title: 'Обновить контактные данные филиалов',
    description: 'Актуализировать адреса, телефоны и email всех филиалов в системе CRM.',
    status: 'done',
    priority: 'low',
    category: 'admin',
    assigneeId: 5,
    creatorId: 1,
    deadline: '2026-03-22T12:00',
    createdAt: '2026-03-15T14:00:00',
    updatedAt: '2026-03-22T11:00:00',
    subtasks: [
      { id: 1, text: 'Связаться с каждым филиалом', done: true },
      { id: 2, text: 'Обновить данные в CRM', done: true },
      { id: 3, text: 'Проверить корректность', done: true },
    ],
    comments: [
      { id: 1, userId: 5, text: 'Все данные обновлены', createdAt: '2026-03-22T11:00:00' },
    ],
    linkedEntity: null,
  },
  {
    id: 10,
    title: 'Провести onboarding нового координатора',
    description: 'Организовать и провести процесс адаптации нового координатора Игоря Бондаренко. Включает обучение системе CRM, знакомство с командой и процессами.',
    status: 'in_progress',
    priority: 'medium',
    category: 'hr',
    assigneeId: 3,
    creatorId: 1,
    deadline: '2026-04-01T10:00',
    createdAt: '2026-03-24T08:00:00',
    updatedAt: '2026-03-25T15:00:00',
    subtasks: [
      { id: 1, text: 'Подготовить рабочее место', done: true },
      { id: 2, text: 'Создать учётные записи', done: true },
      { id: 3, text: 'Провести обучение CRM', done: false },
      { id: 4, text: 'Представить команде', done: false },
      { id: 5, text: 'Назначить наставника', done: true },
    ],
    comments: [
      { id: 1, userId: 3, text: 'Рабочее место и аккаунты готовы', createdAt: '2026-03-24T17:00:00' },
      { id: 2, userId: 8, text: 'Спасибо за быструю подготовку!', createdAt: '2026-03-25T09:00:00' },
    ],
    linkedEntity: null,
  },
  {
    id: 11,
    title: 'Заключить контракт с ZAKŁADY WYTWÓRCZE "CHE..."',
    description: 'Финализировать переговоры и подписать контракт на поставку работников для ZAKŁADY WYTWÓRCZE. Условия: 15 работников, ставка 25 PLN/час.',
    status: 'review',
    priority: 'critical',
    category: 'sales',
    assigneeId: 4,
    creatorId: 1,
    deadline: '2026-03-27',
    createdAt: '2026-03-19T10:00:00',
    updatedAt: '2026-03-25T14:00:00',
    subtasks: [
      { id: 1, text: 'Согласовать финальные условия', done: true },
      { id: 2, text: 'Подготовить проект контракта', done: true },
      { id: 3, text: 'Отправить на подпись', done: true },
      { id: 4, text: 'Получить подписанный экземпляр', done: false },
    ],
    comments: [
      { id: 1, userId: 4, text: 'Контракт отправлен на подпись клиенту', createdAt: '2026-03-25T14:00:00' },
      { id: 2, userId: 1, text: 'Когда ожидаем ответ?', createdAt: '2026-03-25T14:30:00' },
      { id: 3, userId: 4, text: 'Обещали подписать до 27 марта', createdAt: '2026-03-25T14:35:00' },
    ],
    linkedEntity: { type: 'contractor', name: 'ZAKŁADY WYTWÓRCZE "CHE..."' },
  },
  {
    id: 12,
    title: 'Обновить должностные инструкции для вакансий',
    description: 'Пересмотреть и обновить описания обязанностей для 10 активных вакансий. Добавить требования по безопасности.',
    status: 'done',
    priority: 'medium',
    category: 'hr',
    assigneeId: 7,
    creatorId: 3,
    deadline: '2026-03-23T17:00',
    createdAt: '2026-03-17T10:00:00',
    updatedAt: '2026-03-23T15:30:00',
    subtasks: [
      { id: 1, text: 'Пересмотреть текущие описания', done: true },
      { id: 2, text: 'Добавить требования безопасности', done: true },
      { id: 3, text: 'Согласовать с руководителями', done: true },
      { id: 4, text: 'Обновить в системе', done: true },
    ],
    comments: [
      { id: 1, userId: 7, text: 'Все инструкции обновлены и загружены', createdAt: '2026-03-23T15:30:00' },
    ],
    linkedEntity: null,
  },
  {
    id: 13,
    title: 'Убрать на рабочих местах перед проверкой',
    description: 'Завтра проверка от контрагента. Нужно навести порядок на рабочих местах. Кто первый увидит — убирает.',
    status: 'new',
    priority: 'medium',
    category: 'admin',
    assigneeId: null,
    creatorId: 1,
    deadline: '2026-03-27T08:00',
    createdAt: '2026-03-26T08:00:00',
    updatedAt: '2026-03-26T08:00:00',
    subtasks: [],
    comments: [],
    linkedEntity: null,
    watcherIds: [1],
    assigneeType: 'department',
    departmentIds: ['admin'],
    groupType: 'first_done',
    completedBy: [],
    reminderMinutes: 60,
    reminderChannels: ['push'],
  },
  {
    id: 14,
    title: 'Составить план работ на апрель',
    description: 'Каждый сотрудник отдела координации и HR должен составить свой индивидуальный план работ на апрель и прикрепить в комментариях.',
    status: 'new',
    priority: 'high',
    category: 'admin',
    assigneeId: null,
    creatorId: 1,
    deadline: '2026-03-31T12:00',
    createdAt: '2026-03-26T09:00:00',
    updatedAt: '2026-03-26T09:00:00',
    subtasks: [],
    comments: [],
    linkedEntity: null,
    watcherIds: [1],
    assigneeType: 'department',
    departmentIds: ['coordination', 'hr'],
    groupType: 'each_done',
    completedBy: [],
    reminderMinutes: 1440,
    reminderChannels: ['telegram', 'push'],
  },
];

// Data access layer with localStorage persistence
class TaskStore {
  constructor() {
    this.storageKey = 'mrowki_tasks';
    this.tasks = this.loadTasks();
    this.nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;
  }

  loadTasks() {
    let tasks;
    // Primary: bootstrap data from CRM backend
    if (window.__TM_BOOT?.tasks?.length) {
      tasks = window.__TM_BOOT.tasks;
    } else {
      // Fallback: localStorage
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) tasks = JSON.parse(stored);
      } catch (e) { console.warn('Failed to load tasks from localStorage', e); }
    }
    if (!tasks) tasks = [...INITIAL_TASKS];
    // Ensure new fields exist on all tasks (backward compat)
    return tasks.map(t => {
      // Migrate assigneeId -> assigneeIds
      let assigneeIds = t.assigneeIds || [];
      if (!t.assigneeIds && t.assigneeId) {
        assigneeIds = [t.assigneeId];
      }
      const assigneeType = t.assigneeType || (assigneeIds.length > 1 ? 'team' : 'user');
      return {
        watcherIds: [],
        departmentIds: [],
        groupType: 'single',
        completedBy: [],
        reminderMinutes: 0,
        reminderChannels: [],
        projectId: null,
        ...t,
        assigneeIds,
        assigneeType,
        // Ensure deadline has time component
        deadline: t.deadline && t.deadline.length === 10 ? t.deadline + 'T17:00' : t.deadline,
      };
    });
  }

  saveTasks() {
    // Cache locally + persist to CRM backend
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    } catch (e) { console.warn('Failed to save tasks to localStorage', e); }
    try {
      fetch('/api/tm/tasks/bulk', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.tasks),
      }).catch(e => console.warn('TM API save tasks failed:', e));
    } catch (e) { /* no fetch */ }
  }

  getAll() { return [...this.tasks]; }

  getById(id) { return this.tasks.find(t => t.id === id); }

  create(taskData) {
    const now = new Date().toISOString();
    const task = {
      id: this.nextId++,
      watcherIds: [],
      assigneeType: 'user',
      departmentIds: [],
      groupType: 'single',
      completedBy: [],
      ...taskData,
      createdAt: now,
      updatedAt: now,
      subtasks: taskData.subtasks || [],
      comments: [],
      linkedEntity: taskData.linkedEntity || null,
    };
    this.tasks.unshift(task);
    this.saveTasks();
    return task;
  }

  update(id, updates) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const old = this.tasks[idx];

    // Auto-track changes for audit log
    const trackedFields = {
      status:      v => getStatusObj(v).label,
      priority:    v => getPriorityObj(v).label,
      deadline:    v => v ? v.replace('T', ' ') : 'нет',
      title:       v => v,
      assigneeIds: v => (v || []).map(uid => { const u = getUserById(uid); return u ? u.name : uid; }).join(', ') || 'нет',
      projectId:   v => { const p = getProjectById(v); return p ? p.name : (v || 'нет'); },
      category:    v => v || 'нет',
    };

    const history = [...(old.history || [])];
    for (const [field, format] of Object.entries(trackedFields)) {
      if (field in updates && JSON.stringify(updates[field]) !== JSON.stringify(old[field])) {
        history.push({
          field,
          oldValue: format(old[field]),
          newValue: format(updates[field]),
          userId: typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : 1,
          timestamp: new Date().toISOString(),
        });
      }
    }

    this.tasks[idx] = { ...old, ...updates, history, updatedAt: new Date().toISOString() };
    this.saveTasks();
    return this.tasks[idx];
  }

  delete(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
  }

  addComment(taskId, userId, text) {
    const task = this.getById(taskId);
    if (!task) return null;
    const comment = {
      id: (task.comments.length > 0 ? Math.max(...task.comments.map(c => c.id)) : 0) + 1,
      userId, text, createdAt: new Date().toISOString(),
    };
    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();
    this.saveTasks();
    return comment;
  }

  // Group task: mark a user as completed
  completeGroupTask(taskId, userId) {
    const task = this.getById(taskId);
    if (!task) return;
    if (!task.completedBy.includes(userId)) {
      task.completedBy.push(userId);
    }
    // For 'first_done', mark the whole task as done
    if (task.groupType === 'first_done') {
      task.status = 'done';
    }
    // For 'each_done', check if all members completed
    if (task.groupType === 'each_done') {
      const allMembers = getDepartmentMembers(task.departmentIds);
      if (allMembers.every(uid => task.completedBy.includes(uid))) {
        task.status = 'done';
      } else if (task.status === 'new') {
        task.status = 'in_progress';
      }
    }
    task.updatedAt = new Date().toISOString();
    this.saveTasks();
  }

  // Undo group completion
  uncompleteGroupTask(taskId, userId) {
    const task = this.getById(taskId);
    if (!task) return;
    task.completedBy = task.completedBy.filter(id => id !== userId);
    if (task.status === 'done') task.status = 'in_progress';
    task.updatedAt = new Date().toISOString();
    this.saveTasks();
  }

  getGroupProgress(task) {
    if (task.groupType === 'single') return null;
    const allMembers = getDepartmentMembers(task.departmentIds);
    return {
      total: allMembers.length,
      completed: task.completedBy.length,
      members: allMembers.map(uid => ({
        user: getUserById(uid),
        done: task.completedBy.includes(uid),
      })),
    };
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.getById(taskId);
    if (!task) return;
    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (sub) sub.done = !sub.done;
    task.updatedAt = new Date().toISOString();
    this.saveTasks();
  }

  addSubtask(taskId, text) {
    const task = this.getById(taskId);
    if (!task) return null;
    const subtask = {
      id: (task.subtasks.length > 0 ? Math.max(...task.subtasks.map(s => s.id)) : 0) + 1,
      text, done: false,
    };
    task.subtasks.push(subtask);
    task.updatedAt = new Date().toISOString();
    this.saveTasks();
    return subtask;
  }

  getStats() {
    const total = this.tasks.length;
    const byStatus = {};
    Object.keys(STATUSES).forEach(k => {
      byStatus[STATUSES[k].id] = this.tasks.filter(t => t.status === STATUSES[k].id).length;
    });
    const overdue = this.tasks.filter(t => {
      if (t.status === 'done') return false;
      return new Date(t.deadline) < new Date();
    }).length;
    const dueToday = this.tasks.filter(t => {
      if (t.status === 'done') return false;
      const today = new Date().toISOString().split('T')[0];
      return t.deadline === today;
    }).length;
    const attention = this.getAttentionTasks().length;
    return { total, byStatus, overdue, dueToday, attention };
  }

  // ── Attention / notification system ──
  _loadAcknowledged() {
    try {
      const stored = localStorage.getItem('mrowki_acknowledged');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {}; // { taskId: acknowledgedAtTimestamp }
  }

  _saveAcknowledged(ack) {
    try {
      localStorage.setItem('mrowki_acknowledged', JSON.stringify(ack));
    } catch (e) {}
  }

  // A task needs attention if: (overdue OR critical priority) AND not done AND not acknowledged since last update
  needsAttention(task) {
    if (task.status === 'done') return false;
    const isOverdue = new Date(task.deadline) < new Date();
    const isCritical = task.priority === 'critical';
    if (!isOverdue && !isCritical) return false;
    
    const ack = this._loadAcknowledged();
    const ackTime = ack[task.id];
    if (!ackTime) return true;
    // If task was updated after acknowledgment, needs attention again
    return new Date(task.updatedAt) > new Date(ackTime);
  }

  getAttentionTasks() {
    return this.tasks.filter(t => this.needsAttention(t));
  }

  acknowledgeTask(taskId) {
    const ack = this._loadAcknowledged();
    ack[taskId] = new Date().toISOString();
    this._saveAcknowledged(ack);
  }

  resetToDefault() {
    this.tasks = [...INITIAL_TASKS];
    this.nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;
    this.saveTasks();
  }
}

// Global store instance
const taskStore = new TaskStore();

// ── Auto-populate March hours with realistic data ──
// Uses Jan/Feb averages where available, otherwise generates typical hours
(function _populateMarchHours() {
  const marchWorkDays = 22; // March 2026 work days
  const todayDt = new Date();
  const todayDay = (todayDt.getFullYear() === 2026 && todayDt.getMonth() === 2) ? todayDt.getDate() : 29;
  
  // Count workdays passed so far
  let pastWorkDays = 0;
  for (let d = 1; d < todayDay; d++) {
    const dow = new Date(2026, 2, d).getDay();
    if (dow !== 0 && dow !== 6) pastWorkDays++;
  }
  
  Object.keys(PAYROLL_DATA_MARCH.projects).forEach(projId => {
    const proj = PAYROLL_DATA_MARCH.projects[projId];
    
    proj.workers.forEach(w => {
      // Try to find historical data in Jan/Feb
      let totalH = 0, monthsFound = 0;
      [PAYROLL_DATA_JAN, PAYROLL_DATA].forEach(dataset => {
        const dProj = dataset.projects[projId];
        if (!dProj) return;
        const dw = dProj.workers.find(x => x.name === w.name);
        if (!dw) return;
        let hrs = 0;
        if (dProj.hasDayNight) {
          hrs = (dw.hoursDay || 0) + (dw.hoursNight || 0);
        } else {
          hrs = dw.hours || 0;
        }
        if (hrs > 0) { totalH += hrs; monthsFound++; }
      });
      
      let avgMonthlyH;
      if (monthsFound > 0) {
        avgMonthlyH = totalH / monthsFound;
      } else {
        // New worker — generate typical monthly hours based on rate tier
        const rate = proj.hasDayNight ? (w.rateDay || 30) : (w.rate || 26);
        if (rate >= 31) avgMonthlyH = 170 + (_forecastSeed(w.name, 1) % 30);
        else if (rate >= 27) avgMonthlyH = 185 + (_forecastSeed(w.name, 2) % 35);
        else avgMonthlyH = 175 + (_forecastSeed(w.name, 3) % 30);
      }

      // Scale to past workdays (what's already been worked)
      const dailyAvg = avgMonthlyH / marchWorkDays;
      let monthHours = 0;
      for (let d = 1; d <= 31; d++) {
        const dow = new Date(2026, 2, d).getDay();
        if (dow === 0 || dow === 6) continue;
        const rnd = (_forecastSeed(w.name, d) % 1000) / 1000;
        let hrs = dailyAvg * (0.8 + rnd * 0.4);
        if (dow === 5) hrs *= 0.88;
        monthHours += hrs;
      }
      monthHours = Math.round(monthHours * 100) / 100;

      // Fill hours and calculate total
      if (proj.hasDayNight) {
        const dayRatio = 0.7 + ((_forecastSeed(w.name, 99) % 100) / 1000);
        w.hoursDay = Math.round(monthHours * dayRatio * 100) / 100;
        w.hoursNight = Math.round(monthHours * (1 - dayRatio) * 100) / 100;
        w.total = Math.round((w.hoursDay * w.rateDay + w.hoursNight * w.rateNight) * 100) / 100;
      } else {
        w.hours = monthHours;
        w.total = Math.round(monthHours * w.rate * 100) / 100;
      }
    });
  });
})();
