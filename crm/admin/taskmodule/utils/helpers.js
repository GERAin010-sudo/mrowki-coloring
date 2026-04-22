// ==========================================
// Helper Functions
// ==========================================

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const dateOnly = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  // Show time if present
  if (dateStr.includes('T')) {
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `${dateOnly} ${time}`;
  }
  return dateOnly;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  return formatDate(dateStr);
}

function isOverdue(deadline, status) {
  if (status === 'done') return false;
  return new Date(deadline) < new Date();
}

function isDueToday(deadline) {
  const today = new Date().toISOString().split('T')[0];
  const deadlineDate = deadline.split('T')[0];
  return deadlineDate === today;
}

function isDueSoon(deadline, status) {
  if (status === 'done') return false;
  const d = new Date(deadline);
  const now = new Date();
  const diff = d - now;
  return diff > 0 && diff < 3 * 86400000; // 3 days
}

function getUserById(id) {
  return USERS.find(u => u.id === id) || { name: 'Неизвестный', avatar: '??', color: '#6b7280' };
}

function getStatusObj(statusId) {
  return Object.values(STATUSES).find(s => s.id === statusId) || STATUSES.NEW;
}

function getPriorityObj(priorityId) {
  return Object.values(PRIORITIES).find(p => p.id === priorityId) || PRIORITIES.MEDIUM;
}

function getCategoryObj(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Simple toast notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
