/* ============================================
   MRÓWKI COLORING CRM — Bot Command Handlers
   i18n (pl/ua/ru), linked to CRM data
   Single-message UI (edit instead of new messages)
   ============================================ */

const KB = require('./keyboards');
const { FUNNELS } = require('../database');
const AI = require('./ai-worker');

const PRIORITY_MAP_PL = { low: 'niski', normal: 'normalny', high: 'wysoki', urgent: 'pilny' };
// Task module (tm_tasks) uses English priority IDs; 'urgent' in our schema maps to 'critical' in the UI.
const PRIORITY_MAP_TM = { low: 'low', normal: 'medium', high: 'high', urgent: 'critical' };

const SERVICE_LABELS = {
  pl: { okna:'Okna', drzwi:'Drzwi', fasady:'Fasady', bramy_windy:'Bramy/Windy', parapety:'Parapety', poprawki:'Poprawki', inne:'Inne' },
  ua: { okna:'Вікна', drzwi:'Двері', fasady:'Фасади', bramy_windy:'Ворота/Ліфти', parapety:'Підвіконня', poprawki:'Виправлення', inne:'Інше' },
  ru: { okna:'Окна', drzwi:'Двери', fasady:'Фасады', bramy_windy:'Ворота/Лифты', parapety:'Подоконники', poprawki:'Исправления', inne:'Другое' }
};

const PRIORITY_ICONS = { niski:'⚪', normalny:'🟢', wysoki:'🟡', pilny:'🔴' };

const T = {
  pl: {
    welcome: (name) => `🏗️ *Mrówki Coloring CRM*\n\nWitaj, *${name}*!\n\nTo system zarządzania zamówieniami firmy Mrówki Coloring.\n\nUżyj przycisków poniżej lub /pomoc.`,
    menu: '📋 *Menu główne*\nWybierz opcję:',
    no_deals: '📋 Brak aktywnych transakcji.',
    active_deals: (n) => `📋 *Aktywne transakcje (${n}):*`,
    wykonanie_title: '🔧 *Wykonanie*',
    sprzedaz_title: '🛒 *Sprzedaż*',
    my_tasks: '📝 *Moje zadania*',
    no_tasks: '📝 Brak otwartych zadań.',
    task_line: (t, deal, date) => `• ${t}${deal ? `\n  _${deal}_` : ''}${date ? `\n  📅 ${date}` : ''}`,
    no_companies: '👥 Brak kompanii w bazie.',
    companies: (n) => `👥 *Kompanie (${n}):*`,
    not_found: '❌ Nie znaleziono.',
    cancelled: '❌ Operacja anulowana.',
    report_title: '📊 *Raport — Mrówki Coloring*\n',
    total_deals: 'Transakcje łącznie', sales: 'Sprzedaż', execution: 'Wykonanie',
    companies_label: 'Kompanie', contacts: 'Kontakty', revenue: 'Przychód', stock: 'Magazyn',
    help_title: '❓ *Pomoc — Mrówki Coloring CRM*',
    help_cmds: '/start — Uruchom bota\n/menu — Menu główne\n/zlecenia — Transakcje\n/klienci — Kompanie\n/nowe\\_zlecenie — Nowa transakcja\n/dodaj\\_klienta — Nowa kompania\n/raporty — Statystyki\n/anuluj — Anuluj operację\n/pomoc — Ta wiadomość',
    new_deal: '📋 *Nowa transakcja*\nWybierz kompanię:',
    new_deal_no_company: '⚠️ Najpierw dodaj kompanię przez /dodaj\\_klienta',
    new_company: '👥 *Nowa kompania*\nPodaj nazwę firmy:',
    select_service: 'Wybierz typ usługi:', enter_desc: 'Podaj opis transakcji:',
    enter_address: '📍 Podaj adres realizacji (lub \\- aby pominąć):',
    select_priority: '⚡ Wybierz priorytet:',
    enter_amount: '💰 Podaj kwotę (lub \\- aby pominąć):',
    summary: '📋 *Podsumowanie:*\n', confirm_q: '\nCzy potwierdzasz?',
    deal_created: (name) => `✅ *Transakcja utworzona!*\n\n*${name}*\nStatus: 🆕 Nowy lid`,
    company_name: 'Nazwa', company_phone: 'Podaj telefon (lub \\- aby pominąć):', company_email: 'Podaj email (lub \\- aby pominąć):',
    company_created: (name) => `✅ *Kompania dodana!*\n\nNazwa: *${name}*`,
    deal_detail: 'Transakcja', stage: 'Etap', company: 'Kompania', service: 'Usługa', priority: 'Priorytet',
    desc: 'Opis', address: 'Adres', amount: 'Kwota', created: 'Utworzono',
    stage_changed: (name, stage) => `✅ Etap *${name}* zmieniony na:\n${stage}`,
    lang_select: '🌐 Wybierz język:', lang_set: '✅ Język ustawiony!',
    new_deal_notify: (name, company, user) => `🆕 Nowa transakcja *${name}*\nKompania: ${company}\nUtworzył: ${user}`,
    stage_notify: (name, stage, user) => `🔄 *${name}* — status zmieniony na ${stage} przez ${user}`,
    select_stage: '🔄 Wybierz nowy etap:',
    ai_not_allowed: '⛔ Nie jesteś dodany do CRM. Poproś administratora.',
    ai_disabled: '⚠️ Tryb AI wyłączony (brak AI\\_WORKER\\_URL).',
    ai_processing_voice: '🎤 Rozpoznaję wiadomość głosową...',
    ai_processing_text: '🤖 Analizuję zadanie...',
    ai_busy: '⚠️ Najpierw dokończ lub anuluj aktualną operację: /anuluj',
    ai_error: (m) => `❌ Błąd AI: ${m}`,
    ai_heard: (t) => `📝 _Rozpoznano:_ "${t}"`,
    ai_clarify_intro: '❓ Aby utworzyć zadanie, odpowiedz na pytanie:',
    ai_created: (id, title, assignee, due) => `✅ *Zadanie #${id} utworzone*\n\n*${title}*${assignee ? `\n👤 ${assignee}` : ''}${due ? `\n📅 ${due}` : ''}`,
    ai_cancelled: '❌ Anulowano tworzenie zadania.',
  },
  ua: {
    welcome: (name) => `🏗️ *Mrówki Coloring CRM*\n\nВітаємо, *${name}*!\n\nЦе система управління замовленнями Mrówki Coloring.\n\nВикористовуйте кнопки нижче або /pomoc.`,
    menu: '📋 *Головне меню*\nОберіть опцію:',
    no_deals: '📋 Немає активних угод.', active_deals: (n) => `📋 *Активні угоди (${n}):*`,
    wykonanie_title: '🔧 *Виконання*', sprzedaz_title: '🛒 *Продажі*',
    my_tasks: '📝 *Мої завдання*', no_tasks: '📝 Немає відкритих завдань.',
    task_line: (t, deal, date) => `• ${t}${deal ? `\n  _${deal}_` : ''}${date ? `\n  📅 ${date}` : ''}`,
    no_companies: '👥 Немає компаній в базі.', companies: (n) => `👥 *Компанії (${n}):*`,
    not_found: '❌ Не знайдено.', cancelled: '❌ Операцію скасовано.',
    report_title: '📊 *Звіт — Mrówki Coloring*\n',
    total_deals: 'Угод усього', sales: 'Продажі', execution: 'Виконання',
    companies_label: 'Компанії', contacts: 'Контакти', revenue: 'Дохід', stock: 'Склад',
    help_title: '❓ *Допомога — Mrówki Coloring CRM*',
    help_cmds: '/start — Запуск бота\n/menu — Головне меню\n/zlecenia — Угоди\n/klienci — Компанії\n/nowe\\_zlecenie — Нова угода\n/dodaj\\_klienta — Нова компанія\n/raporty — Статистика\n/anuluj — Скасувати\n/pomoc — Ця довідка',
    new_deal: '📋 *Нова угода*\nОберіть компанію:', new_deal_no_company: '⚠️ Спочатку додайте компанію через /dodaj\\_klienta',
    new_company: '👥 *Нова компанія*\nВведіть назву:', select_service: 'Оберіть тип послуги:',
    enter_desc: 'Введіть опис угоди:', enter_address: '📍 Введіть адресу (або \\- щоб пропустити):',
    select_priority: '⚡ Оберіть пріоритет:', enter_amount: '💰 Введіть суму (або \\- щоб пропустити):',
    summary: '📋 *Підсумок:*\n', confirm_q: '\nПідтверджуєте?',
    deal_created: (name) => `✅ *Угоду створено!*\n\n*${name}*\nСтатус: 🆕 Новий лід`,
    company_name: 'Назва', company_phone: 'Введіть телефон (або \\- щоб пропустити):', company_email: 'Введіть email (або \\- щоб пропустити):',
    company_created: (name) => `✅ *Компанію додано!*\n\nНазва: *${name}*`,
    deal_detail: 'Угода', stage: 'Етап', company: 'Компанія', service: 'Послуга', priority: 'Пріоритет',
    desc: 'Опис', address: 'Адреса', amount: 'Сума', created: 'Створено',
    stage_changed: (name, stage) => `✅ Етап *${name}* змінено на:\n${stage}`,
    lang_select: '🌐 Оберіть мову:', lang_set: '✅ Мову встановлено!',
    new_deal_notify: (name, company, user) => `🆕 Нова угода *${name}*\nКомпанія: ${company}\nСтворив: ${user}`,
    stage_notify: (name, stage, user) => `🔄 *${name}* — етап змінено на ${stage} (${user})`,
    select_stage: '🔄 Оберіть новий етап:',
    ai_not_allowed: '⛔ Вас не додано до CRM. Зверніться до адміна.',
    ai_disabled: '⚠️ AI\\-режим вимкнено (не задано AI\\_WORKER\\_URL).',
    ai_processing_voice: '🎤 Розпізнаю голосове повідомлення...',
    ai_processing_text: '🤖 Аналізую завдання...',
    ai_busy: '⚠️ Спочатку завершіть або скасуйте поточну операцію: /anuluj',
    ai_error: (m) => `❌ Помилка AI: ${m}`,
    ai_heard: (t) => `📝 _Розпізнано:_ "${t}"`,
    ai_clarify_intro: '❓ Щоб створити завдання, дайте відповідь:',
    ai_created: (id, title, assignee, due) => `✅ *Завдання #${id} створено*\n\n*${title}*${assignee ? `\n👤 ${assignee}` : ''}${due ? `\n📅 ${due}` : ''}`,
    ai_cancelled: '❌ Створення завдання скасовано.',
  },
  ru: {
    welcome: (name) => `🏗️ *Mrówki Coloring CRM*\n\nДобро пожаловать, *${name}*!\n\nЭто система управления заказами Mrówki Coloring.\n\nИспользуйте кнопки ниже или /pomoc.`,
    menu: '📋 *Главное меню*\nВыберите опцию:',
    no_deals: '📋 Нет активных сделок.', active_deals: (n) => `📋 *Активные сделки (${n}):*`,
    wykonanie_title: '🔧 *Исполнение*', sprzedaz_title: '🛒 *Продажи*',
    my_tasks: '📝 *Мои задачи*', no_tasks: '📝 Нет открытых задач.',
    task_line: (t, deal, date) => `• ${t}${deal ? `\n  _${deal}_` : ''}${date ? `\n  📅 ${date}` : ''}`,
    no_companies: '👥 Нет компаний в базе.', companies: (n) => `👥 *Компании (${n}):*`,
    not_found: '❌ Не найдено.', cancelled: '❌ Операция отменена.',
    report_title: '📊 *Отчёт — Mrówki Coloring*\n',
    total_deals: 'Сделок всего', sales: 'Продажи', execution: 'Исполнение',
    companies_label: 'Компании', contacts: 'Контакты', revenue: 'Доход', stock: 'Склад',
    help_title: '❓ *Помощь — Mrówki Coloring CRM*',
    help_cmds: '/start — Запуск бота\n/menu — Главное меню\n/zlecenia — Сделки\n/klienci — Компании\n/nowe\\_zlecenie — Новая сделка\n/dodaj\\_klienta — Новая компания\n/raporty — Статистика\n/anuluj — Отмена\n/pomoc — Эта справка',
    new_deal: '📋 *Новая сделка*\nВыберите компанию:', new_deal_no_company: '⚠️ Сначала добавьте компанию через /dodaj\\_klienta',
    new_company: '👥 *Новая компания*\nВведите название:', select_service: 'Выберите тип услуги:',
    enter_desc: 'Введите описание сделки:', enter_address: '📍 Введите адрес (или \\- чтобы пропустить):',
    select_priority: '⚡ Выберите приоритет:', enter_amount: '💰 Введите сумму (или \\- чтобы пропустить):',
    summary: '📋 *Итого:*\n', confirm_q: '\nПодтверждаете?',
    deal_created: (name) => `✅ *Сделка создана!*\n\n*${name}*\nСтатус: 🆕 Новый лид`,
    company_name: 'Название', company_phone: 'Введите телефон (или \\- чтобы пропустить):', company_email: 'Введите email (или \\- чтобы пропустить):',
    company_created: (name) => `✅ *Компания добавлена!*\n\nНазвание: *${name}*`,
    deal_detail: 'Сделка', stage: 'Этап', company: 'Компания', service: 'Услуга', priority: 'Приоритет',
    desc: 'Описание', address: 'Адрес', amount: 'Сумма', created: 'Создано',
    stage_changed: (name, stage) => `✅ Этап *${name}* изменён на:\n${stage}`,
    lang_select: '🌐 Выберите язык:', lang_set: '✅ Язык установлен!',
    new_deal_notify: (name, company, user) => `🆕 Новая сделка *${name}*\nКомпания: ${company}\nСоздал: ${user}`,
    stage_notify: (name, stage, user) => `🔄 *${name}* — этап изменён на ${stage} (${user})`,
    select_stage: '🔄 Выберите новый этап:',
    ai_not_allowed: '⛔ Вы не добавлены в CRM. Обратитесь к администратору.',
    ai_disabled: '⚠️ AI\\-режим выключен (не задан AI\\_WORKER\\_URL).',
    ai_processing_voice: '🎤 Распознаю голосовое сообщение...',
    ai_processing_text: '🤖 Анализирую задачу...',
    ai_busy: '⚠️ Сначала завершите или отмените текущую операцию: /anuluj',
    ai_error: (m) => `❌ Ошибка AI: ${m}`,
    ai_heard: (t) => `📝 _Распознано:_ "${t}"`,
    ai_clarify_intro: '❓ Чтобы создать задачу, ответьте на вопрос:',
    ai_created: (id, title, assignee, due) => `✅ *Задача #${id} создана*\n\n*${title}*${assignee ? `\n👤 ${assignee}` : ''}${due ? `\n📅 ${due}` : ''}`,
    ai_cancelled: '❌ Создание задачи отменено.',
  }
};

function txt(lang, key) { return (T[lang] || T.pl)[key] || T.pl[key] || key; }
function svc(lang, type) { return (SERVICE_LABELS[lang] || SERVICE_LABELS.pl)[type] || type; }

class BotCommands {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
    this.setupMenuCommands();
    this.registerCommands();
    this.registerCallbacks();
    this.registerMessages();
    this.registerAiHandlers();
    console.log('[BOT] All handlers registered' + (AI.isEnabled() ? ' (AI worker enabled)' : ' (AI worker NOT configured)'));
  }

  getLang(chatId) {
    const user = this.db.getUser(chatId);
    return user?.jezyk || 'pl';
  }

  // Edit existing message (for callback navigation) — no message trail
  edit(chatId, msgId, text, opts = {}) {
    return this.bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'Markdown', ...opts }).catch(() => {
      // fallback: if edit fails (e.g. same content), send new
      return this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts });
    });
  }

  // Send new message (for slash commands)
  send(chatId, text, opts = {}) {
    return this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts });
  }

  // Delete a message silently
  del(chatId, msgId) {
    return this.bot.deleteMessage(chatId, msgId).catch(() => {});
  }

  setupMenuCommands() {
    this.bot.setMyCommands([
      { command: 'start', description: 'Start / Старт' },
      { command: 'menu', description: 'Menu / Меню' },
      { command: 'zlecenia', description: 'Deals / Сделки / Угоди' },
      { command: 'klienci', description: 'Companies / Компании / Компанії' },
      { command: 'nowe_zlecenie', description: 'New deal / Новая сделка' },
      { command: 'dodaj_klienta', description: 'New company / Новая компания' },
      { command: 'raporty', description: 'Reports / Отчёты / Звіти' },
      { command: 'pomoc', description: 'Help / Помощь / Допомога' },
      { command: 'anuluj', description: 'Cancel / Отмена / Скасувати' },
    ]).catch(() => {});
  }

  /* ===== COMMAND HANDLERS (slash commands — send new message) ===== */
  registerCommands() {
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/menu/, (msg) => this.showMainMenu(msg.chat.id));
    this.bot.onText(/\/zlecenia/, (msg) => this.handleDeals(msg.chat.id));
    this.bot.onText(/\/klienci/, (msg) => this.handleCompanies(msg.chat.id));
    this.bot.onText(/\/nowe_zlecenie/, (msg) => this.startNewDeal(msg.chat.id, msg.from));
    this.bot.onText(/\/dodaj_klienta/, (msg) => this.startNewCompany(msg.chat.id));
    this.bot.onText(/\/raporty/, (msg) => this.handleReports(msg.chat.id));
    this.bot.onText(/\/pomoc/, (msg) => this.handleHelp(msg.chat.id));
    this.bot.onText(/\/anuluj/, (msg) => this.handleCancel(msg.chat.id));
  }

  handleStart(msg) {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'User';
    this.db.createUser(msg.from.id, firstName, 'wykonawca');
    const lang = this.getLang(chatId);
    this.send(chatId, txt(lang, 'welcome')(firstName), KB.mainMenu(lang));
  }

  // msgId = null means slash command (send new), msgId = number means callback (edit existing)
  showMainMenu(chatId, msgId) {
    this.db.clearConversation(chatId);
    const lang = this.getLang(chatId);
    if (msgId) this.edit(chatId, msgId, txt(lang, 'menu'), KB.mainMenu(lang));
    else this.send(chatId, txt(lang, 'menu'), KB.mainMenu(lang));
  }

  handleDeals(chatId, msgId) {
    const lang = this.getLang(chatId);
    const deals = this.db.getActiveDeals();
    const text = deals.length ? txt(lang, 'active_deals')(deals.length) : txt(lang, 'no_deals');
    const kb = deals.length ? KB.dealSelectKeyboard(deals, lang) : KB.back(lang);
    if (msgId) this.edit(chatId, msgId, text, kb);
    else this.send(chatId, text, kb);
  }

  handleWykonanie(chatId, msgId) {
    const lang = this.getLang(chatId);
    const deals = this.db.getActiveDeals('wykonanie');
    const title = txt(lang, 'wykonanie_title');
    const text = deals.length ? `${title}\n\n${txt(lang, 'active_deals')(deals.length)}` : `${title}\n\n${txt(lang, 'no_deals')}`;
    const kb = deals.length ? KB.dealSelectKeyboard(deals, lang, 'menu_main') : KB.back(lang);
    if (msgId) this.edit(chatId, msgId, text, kb);
    else this.send(chatId, text, kb);
  }

  handleSprzedaz(chatId, msgId) {
    const lang = this.getLang(chatId);
    const deals = this.db.getActiveDeals('sprzedaz');
    const title = txt(lang, 'sprzedaz_title');
    const text = deals.length ? `${title}\n\n${txt(lang, 'active_deals')(deals.length)}` : `${title}\n\n${txt(lang, 'no_deals')}`;
    const kb = deals.length ? KB.dealSelectKeyboard(deals, lang, 'menu_main') : KB.back(lang);
    if (msgId) this.edit(chatId, msgId, text, kb);
    else this.send(chatId, text, kb);
  }

  handleTasks(chatId, msgId) {
    const lang = this.getLang(chatId);
    const tasks = this.db.getTasksForUser(chatId);
    if (!tasks || !tasks.length) {
      const text = txt(lang, 'my_tasks') + '\n\n' + txt(lang, 'no_tasks');
      if (msgId) return this.edit(chatId, msgId, text, KB.back(lang));
      return this.send(chatId, text, KB.back(lang));
    }
    let text = txt(lang, 'my_tasks') + `\n\n`;
    tasks.forEach(task => {
      const deadline = task.termin ? task.termin.split('T')[0] : null;
      text += txt(lang, 'task_line')(task.tresc, task.deal_nazwa, deadline) + '\n';
    });
    if (msgId) this.edit(chatId, msgId, text, KB.back(lang));
    else this.send(chatId, text, KB.back(lang));
  }

  handleCompanies(chatId, msgId) {
    const lang = this.getLang(chatId);
    const companies = this.db.getAllCompanies();
    if (!companies.length) {
      const text = txt(lang, 'no_companies');
      if (msgId) return this.edit(chatId, msgId, text, KB.back(lang));
      return this.send(chatId, text, KB.back(lang));
    }
    let text = txt(lang, 'companies')(companies.length) + '\n\n';
    companies.slice(0, 15).forEach((c, i) => {
      text += `${i + 1}. *${c.nazwa}*`;
      if (c.telefon) text += `\n   📞 ${c.telefon}`;
      if (c.email) text += `\n   📧 ${c.email}`;
      text += '\n\n';
    });
    if (msgId) this.edit(chatId, msgId, text, KB.back(lang));
    else this.send(chatId, text, KB.back(lang));
  }

  handleReports(chatId, msgId) {
    const lang = this.getLang(chatId);
    const s = this.db.getStats();
    let text = txt(lang, 'report_title') + '\n';
    text += `📋 ${txt(lang, 'total_deals')}: *${s.totalDeals}*\n`;
    text += `🛒 ${txt(lang, 'sales')}: *${s.salesDeals}* (${s.salesSum.toLocaleString()} PLN)\n`;
    text += `🔧 ${txt(lang, 'execution')}: *${s.execDeals}* (${s.execSum.toLocaleString()} PLN)\n`;
    text += `👥 ${txt(lang, 'companies_label')}: *${s.totalCompanies}*\n`;
    text += `📇 ${txt(lang, 'contacts')}: *${s.totalContacts}*\n`;
    text += `💰 ${txt(lang, 'revenue')}: *${s.totalRevenue.toLocaleString()} PLN*\n`;
    text += `📦 ${txt(lang, 'stock')}: *${s.stockItems}* (${s.stockValue.toLocaleString()} PLN)\n`;
    if (msgId) this.edit(chatId, msgId, text, KB.back(lang));
    else this.send(chatId, text, KB.back(lang));
  }

  handleHelp(chatId, msgId) {
    const lang = this.getLang(chatId);
    const text = txt(lang, 'help_title') + '\n\n' + txt(lang, 'help_cmds');
    if (msgId) this.edit(chatId, msgId, text, KB.back(lang));
    else this.send(chatId, text, KB.back(lang));
  }

  handleCancel(chatId, msgId) {
    const lang = this.getLang(chatId);
    this.db.clearConversation(chatId);
    if (msgId) this.edit(chatId, msgId, txt(lang, 'cancelled'), KB.back(lang));
    else this.send(chatId, txt(lang, 'cancelled'), KB.back(lang));
  }

  startNewDeal(chatId, from, msgId) {
    const lang = this.getLang(chatId);
    const companies = this.db.getAllCompanies();
    if (!companies.length) {
      if (msgId) return this.edit(chatId, msgId, txt(lang, 'new_deal_no_company'), KB.back(lang));
      return this.send(chatId, txt(lang, 'new_deal_no_company'), KB.back(lang));
    }
    this.db.setConversation(chatId, 'deal_select_company', { created_by: from?.first_name || 'Bot' });
    if (msgId) this.edit(chatId, msgId, txt(lang, 'new_deal'), KB.companySelectKeyboard(companies, lang));
    else this.send(chatId, txt(lang, 'new_deal'), KB.companySelectKeyboard(companies, lang));
  }

  startNewCompany(chatId, msgId) {
    const lang = this.getLang(chatId);
    this.db.setConversation(chatId, 'company_name', {});
    if (msgId) this.edit(chatId, msgId, txt(lang, 'new_company'));
    else this.send(chatId, txt(lang, 'new_company'));
  }

  /* ===== CALLBACKS (edit existing message — no trail) ===== */
  registerCallbacks() {
    this.bot.on('callback_query', (query) => {
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const data = query.data;
      this.bot.answerCallbackQuery(query.id).catch(() => {});

      // Menu navigation — all edit the same message
      if (data === 'menu_main') return this.showMainMenu(chatId, msgId);
      if (data === 'menu_zlecenia') return this.handleDeals(chatId, msgId);
      if (data === 'menu_wykonanie') return this.handleWykonanie(chatId, msgId);
      if (data === 'menu_sprzedaz') return this.handleSprzedaz(chatId, msgId);
      if (data === 'menu_zadania') return this.handleTasks(chatId, msgId);
      if (data === 'menu_klienci') return this.handleCompanies(chatId, msgId);
      if (data === 'menu_raporty') return this.handleReports(chatId, msgId);
      if (data === 'menu_pomoc') return this.handleHelp(chatId, msgId);
      if (data === 'nowe_zlecenie') return this.startNewDeal(chatId, query.from, msgId);
      if (data === 'nowy_klient') return this.startNewCompany(chatId, msgId);

      // Language
      if (data === 'menu_lang') {
        const lang = this.getLang(chatId);
        return this.edit(chatId, msgId, txt(lang, 'lang_select'), KB.langSelect());
      }
      if (data.startsWith('setlang_')) {
        const newLang = data.replace('setlang_', '');
        this.db.setUserLang(chatId, newLang);
        return this.edit(chatId, msgId, txt(newLang, 'lang_set'), KB.mainMenu(newLang));
      }

      // Company selection for new deal
      if (data.startsWith('select_company_')) {
        const companyId = parseInt(data.replace('select_company_', ''));
        return this.handleCompanySelected(chatId, msgId, companyId, query.from);
      }

      // Service type
      if (data.startsWith('service_')) return this.handleServiceSelected(chatId, msgId, data.replace('service_', ''));

      // Priority
      if (data.startsWith('prio_')) return this.handlePrioritySelected(chatId, msgId, data.replace('prio_', ''));

      // Deal selection
      if (data.startsWith('select_deal_')) {
        const dealId = parseInt(data.replace('select_deal_', ''));
        return this.handleDealSelected(chatId, msgId, dealId);
      }

      // Stage change screen
      if (data.startsWith('change_stage_')) {
        const dealId = parseInt(data.replace('change_stage_', ''));
        const deal = this.db.getDeal(dealId);
        if (!deal) return;
        const lang = this.getLang(chatId);
        return this.edit(chatId, msgId, txt(lang, 'select_stage'), KB.stageChangeKeyboard(dealId, deal.voronka, lang));
      }

      // Apply stage change
      if (data.startsWith('chstage_')) {
        const parts = data.replace('chstage_', '').split('_');
        const dealId = parseInt(parts[0]);
        const newStage = parts.slice(1).join('_');
        return this.handleStageChange(chatId, msgId, dealId, newStage, query.from);
      }

      // Confirm deal
      if (data === 'confirm_yes') return this.handleConfirmDeal(chatId, msgId, query.from);
      if (data === 'confirm_no') return this.handleCancel(chatId, msgId);
    });
  }

  /* === Deal creation flow === */
  handleCompanySelected(chatId, msgId, companyId, from) {
    const lang = this.getLang(chatId);
    const company = this.db.getCompany(companyId);
    if (!company) return this.edit(chatId, msgId, txt(lang, 'not_found'), KB.back(lang));

    const conv = this.db.getConversation(chatId);
    this.db.setConversation(chatId, 'deal_select_service', {
      ...((conv && conv.dane) || {}),
      kompania_id: companyId,
      kompania_nazwa: company.nazwa,
      created_by: from.first_name
    });

    this.edit(chatId, msgId, `✅ *${company.nazwa}*\n${txt(lang, 'select_service')}`, KB.serviceTypes(lang));
  }

  handleServiceSelected(chatId, msgId, serviceType) {
    const lang = this.getLang(chatId);
    const conv = this.db.getConversation(chatId);
    if (!conv || conv.stan !== 'deal_select_service') return;

    this.db.setConversation(chatId, 'deal_description', { ...conv.dane, typ_uslugi: serviceType });
    // After this, user must type text — delete bot message, send prompt
    this.del(chatId, msgId);
    this.send(chatId, `✅ ${svc(lang, serviceType)}\n${txt(lang, 'enter_desc')}`);
  }

  handlePrioritySelected(chatId, msgId, priority) {
    const lang = this.getLang(chatId);
    const conv = this.db.getConversation(chatId);
    if (!conv || conv.stan !== 'deal_priority') return;

    const d = { ...conv.dane, priorytet: priority };
    this.db.setConversation(chatId, 'deal_confirm', d);

    let text = txt(lang, 'summary') + '\n';
    text += `👤 ${txt(lang, 'company')}: *${d.kompania_nazwa}*\n`;
    text += `🔧 ${txt(lang, 'service')}: *${svc(lang, d.typ_uslugi)}*\n`;
    text += `📝 ${txt(lang, 'desc')}: ${d.opis || '—'}\n`;
    text += `📍 ${txt(lang, 'address')}: ${d.adres_realizacji || '—'}\n`;
    text += `💰 ${txt(lang, 'amount')}: ${d.kwota || '—'}\n`;
    text += `⚡ ${txt(lang, 'priority')}: ${PRIORITY_ICONS[priority] || ''} ${priority}\n`;
    text += txt(lang, 'confirm_q');
    this.edit(chatId, msgId, text, KB.confirm(lang));
  }

  handleConfirmDeal(chatId, msgId, from) {
    const lang = this.getLang(chatId);
    const conv = this.db.getConversation(chatId);
    if (!conv || conv.stan !== 'deal_confirm') return;

    const d = conv.dane;
    const name = `${d.kompania_nazwa} — ${svc(lang, d.typ_uslugi)}`;
    this.db.createDeal({
      nazwa: name, kwota: d.kwota || 0,
      voronka: 'sprzedaz', etap: 'nowy_lid',
      kompania_id: d.kompania_id, typ_uslugi: d.typ_uslugi,
      opis: d.opis, adres_realizacji: d.adres_realizacji,
      priorytet: d.priorytet, created_by: from.first_name
    });

    this.db.clearConversation(chatId);
    this.edit(chatId, msgId, txt(lang, 'deal_created')(name), KB.back(lang));
    this.notifyAdmins(chatId, txt(lang, 'new_deal_notify')(name, d.kompania_nazwa, from.first_name));
  }

  /* === Deal details & stage change === */
  handleDealSelected(chatId, msgId, dealId) {
    const lang = this.getLang(chatId);
    const deal = this.db.getDeal(dealId);
    if (!deal) return this.edit(chatId, msgId, txt(lang, 'not_found'), KB.back(lang));
    this.sendDealDetails(chatId, msgId, deal, lang);
  }

  sendDealDetails(chatId, msgId, deal, lang) {
    const stageLabel = KB.stageLabel(lang, deal.etap);
    let text = `📋 *${deal.nazwa}*\n\n`;
    text += `${stageLabel}\n\n`;
    if (deal.kompania_nazwa) text += `👤 ${txt(lang, 'company')}: *${deal.kompania_nazwa}*\n`;
    if (deal.typ_uslugi) text += `🔧 ${txt(lang, 'service')}: ${svc(lang, deal.typ_uslugi)}\n`;
    text += `⚡ ${txt(lang, 'priority')}: ${PRIORITY_ICONS[deal.priorytet] || ''} ${deal.priorytet || 'normalny'}\n`;
    if (deal.opis) text += `📝 ${txt(lang, 'desc')}: ${deal.opis}\n`;
    if (deal.adres_realizacji) text += `📍 ${txt(lang, 'address')}: ${deal.adres_realizacji}\n`;
    if (deal.kwota) text += `💰 ${txt(lang, 'amount')}: ${deal.kwota.toLocaleString()} ${deal.waluta || 'PLN'}\n`;
    text += `📅 ${txt(lang, 'created')}: ${deal.created_at}\n`;

    const backTo = deal.voronka === 'wykonanie' ? 'menu_wykonanie' : deal.voronka === 'sprzedaz' ? 'menu_sprzedaz' : 'menu_main';
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: KB.t(lang, 'zmien_status'), callback_data: `change_stage_${deal.id}` }],
          [{ text: KB.t(lang, 'powrot'), callback_data: backTo }]
        ]
      }
    };
    if (msgId) this.edit(chatId, msgId, text, keyboard);
    else this.send(chatId, text, keyboard);
  }

  handleStageChange(chatId, msgId, dealId, newStage, from) {
    const lang = this.getLang(chatId);
    this.db.updateDealStage(dealId, newStage, from.first_name);
    const deal = this.db.getDeal(dealId);
    const stageLabel = KB.stageLabel(lang, newStage);
    this.edit(chatId, msgId, txt(lang, 'stage_changed')(deal.nazwa, stageLabel), KB.back(lang));
    this.notifyAdmins(chatId, txt(lang, 'stage_notify')(deal.nazwa, stageLabel, from.first_name));
  }

  /* ===== MESSAGE HANDLERS (text input for forms) ===== */
  registerMessages() {
    this.bot.on('message', (msg) => {
      if (msg.text && msg.text.startsWith('/')) return;
      const chatId = msg.chat.id;
      const conv = this.db.getConversation(chatId);
      if (!conv) return;
      const lang = this.getLang(chatId);

      switch (conv.stan) {
        case 'deal_description':
          this.db.setConversation(chatId, 'deal_address', { ...conv.dane, opis: msg.text });
          this.send(chatId, txt(lang, 'enter_address'));
          break;

        case 'deal_address':
          this.db.setConversation(chatId, 'deal_amount', {
            ...conv.dane, adres_realizacji: msg.text === '-' ? null : msg.text
          });
          this.send(chatId, txt(lang, 'enter_amount'));
          break;

        case 'deal_amount': {
          this.db.setConversation(chatId, 'deal_priority', {
            ...conv.dane, kwota: msg.text === '-' ? 0 : parseFloat(msg.text) || 0
          });
          this.send(chatId, txt(lang, 'select_priority'), KB.priorities(lang));
          break;
        }

        case 'company_name':
          this.db.setConversation(chatId, 'company_phone', { nazwa: msg.text });
          this.send(chatId, `✅ *${msg.text}*\n${txt(lang, 'company_phone')}`);
          break;

        case 'company_phone':
          this.db.setConversation(chatId, 'company_email', {
            ...conv.dane, telefon: msg.text === '-' ? null : msg.text
          });
          this.send(chatId, txt(lang, 'company_email'));
          break;

        case 'company_email': {
          const data = { ...conv.dane, email: msg.text === '-' ? null : msg.text };
          this.db.createCompany({ nazwa: data.nazwa, telefon: data.telefon, email: data.email });
          this.db.clearConversation(chatId);
          this.send(chatId, txt(lang, 'company_created')(data.nazwa), KB.back(lang));
          break;
        }
      }
    });
  }

  /* ===== AI TASK HANDLERS (voice / free-text → structured task) ===== */
  registerAiHandlers() {
    // Voice handler: runs in addition to the default message handler.
    this.bot.on('voice', async (msg) => {
      try { await this.handleAiVoice(msg); }
      catch (e) { console.error('[AI voice]', e); }
    });

    // Text handler: only triggers for free text (not slash, not inside an existing form).
    this.bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      const chatId = msg.chat.id;
      const conv = this.db.getConversation(chatId);
      try {
        if (conv && conv.stan === 'ai_task_clarify') {
          await this.handleAiClarify(msg, conv);
          return;
        }
        if (conv) return; // an existing form is in progress — let registerMessages handle it
        await this.handleAiText(msg);
      } catch (e) {
        console.error('[AI text]', e);
      }
    });
  }

  // Helpers shared by voice/text/clarify
  getAllowedUser(chatId) {
    const u = this.db.getUser(chatId);
    if (!u || Number(u.aktywny) !== 1) return null;
    return u;
  }

  buildAiUsersContext() {
    const users = this.db.getAllUsers().filter(u => Number(u.aktywny) === 1);
    return users.slice(0, 30).map(u => ({
      name: u.imie,
      role: u.rola || undefined,
      telegram_id: Number(u.telegram_id) || u.telegram_id,
    }));
  }

  async handleAiVoice(msg) {
    const chatId = msg.chat.id;
    const user = this.getAllowedUser(chatId);
    const lang = user?.jezyk || 'pl';
    if (!user) return this.send(chatId, txt(lang, 'ai_not_allowed'));
    if (!AI.isEnabled()) return this.send(chatId, txt(lang, 'ai_disabled'));

    const conv = this.db.getConversation(chatId);
    if (conv && conv.stan !== 'ai_task_clarify') return this.send(chatId, txt(lang, 'ai_busy'));

    const notice = await this.send(chatId, txt(lang, 'ai_processing_voice'));
    let audioBuffer;
    try {
      // node-telegram-bot-api helper: downloads the file and returns a Buffer.
      const stream = this.bot.getFileStream(msg.voice.file_id);
      audioBuffer = await streamToBuffer(stream);
    } catch (e) {
      return this.send(chatId, txt(lang, 'ai_error')(`download: ${e.message}`));
    }

    let result;
    try {
      result = await AI.processAudio(audioBuffer, {
        filename: `voice-${msg.voice.file_unique_id}.oga`,
        users: this.buildAiUsersContext(),
      });
    } catch (e) {
      return this.send(chatId, txt(lang, 'ai_error')(e.message));
    }

    const recognized = result?.transcription?.text || '';
    if (recognized) await this.send(chatId, txt(lang, 'ai_heard')(recognized));

    const task = result?.task;
    if (!task) return this.send(chatId, txt(lang, 'ai_error')('empty task'));
    await this.processParsedTask(chatId, task, { lang, user, source: recognized });
  }

  async handleAiText(msg) {
    const chatId = msg.chat.id;
    const user = this.getAllowedUser(chatId);
    const lang = user?.jezyk || 'pl';
    if (!user) return this.send(chatId, txt(lang, 'ai_not_allowed'));
    if (!AI.isEnabled()) return this.send(chatId, txt(lang, 'ai_disabled'));

    await this.send(chatId, txt(lang, 'ai_processing_text'));
    let task;
    try {
      task = await AI.parseText(msg.text, { users: this.buildAiUsersContext() });
    } catch (e) {
      return this.send(chatId, txt(lang, 'ai_error')(e.message));
    }
    await this.processParsedTask(chatId, task, { lang, user, source: msg.text });
  }

  async handleAiClarify(msg, conv) {
    const chatId = msg.chat.id;
    const lang = this.getLang(chatId);
    const partial = (conv.dane && conv.dane.partial) || {};
    const originalSource = (conv.dane && conv.dane.source) || '';
    const userDbRow = this.getAllowedUser(chatId);
    if (!userDbRow) {
      this.db.clearConversation(chatId);
      return this.send(chatId, txt(lang, 'ai_not_allowed'));
    }

    // Merge the clarification with the original source and re-parse — simpler
    // than trying to target a specific field, and the model already knows
    // which ones were missing.
    const mergedText = `${originalSource}\n\nУточнение: ${msg.text}`;
    await this.send(chatId, txt(lang, 'ai_processing_text'));
    let task;
    try {
      task = await AI.parseText(mergedText, { users: this.buildAiUsersContext() });
    } catch (e) {
      return this.send(chatId, txt(lang, 'ai_error')(e.message));
    }
    await this.processParsedTask(chatId, task, { lang, user: userDbRow, source: mergedText, isFollowup: true });
  }

  async processParsedTask(chatId, task, { lang, user, source, isFollowup = false }) {
    // Still missing critical fields → ask one clarifying question.
    // After one follow-up, accept whatever we got to avoid infinite loops.
    const missing = Array.isArray(task.missing_fields) ? task.missing_fields : [];
    if (missing.length && !isFollowup && task.clarifying_question) {
      this.db.setConversation(chatId, 'ai_task_clarify', {
        partial: task,
        source,
      });
      return this.send(chatId, `${txt(lang, 'ai_clarify_intro')}\n\n${task.clarifying_question}`);
    }

    // Commit.
    this.db.clearConversation(chatId);

    const raw = this.db.db;
    const findTmUserByImie = (imie) => {
      if (!imie) return null;
      return raw.prepare(`SELECT id, name FROM tm_users WHERE name LIKE ? || '%' COLLATE NOCASE ORDER BY id LIMIT 1`).get(imie);
    };

    let assignee_id = null;
    let assigneeName = null;
    if (task.assignee_tg_id) {
      const botUser = this.db.getUser(task.assignee_tg_id);
      if (botUser) {
        const tmUser = findTmUserByImie(botUser.imie);
        if (tmUser) { assignee_id = tmUser.id; assigneeName = tmUser.name; }
        else assigneeName = botUser.imie; // still show the name in the TG reply even if no tm_user match
      }
    }

    const creatorTm = findTmUserByImie(user?.imie);
    const creator_id = creatorTm?.id || null;

    const title = (task.title && task.title.trim()) || (source.slice(0, 60) + (source.length > 60 ? '…' : ''));
    const description = task.description || source;
    const priority = PRIORITY_MAP_TM[task.priority] || 'medium';

    const result = raw.prepare(
      `INSERT INTO tm_tasks (title, description, status, priority, assignee_id, assignee_type, creator_id, deadline)
       VALUES (?, ?, 'new', ?, ?, 'single', ?, ?)`
    ).run(title, description, priority, assignee_id, creator_id, task.due_date || null);
    const taskId = result.lastInsertRowid;

    if (assignee_id) {
      raw.prepare('INSERT OR IGNORE INTO tm_task_assignees (task_id, user_id) VALUES (?, ?)').run(taskId, assignee_id);
    }

    await this.send(chatId, txt(lang, 'ai_created')(taskId, title, assigneeName, task.due_date));
  }

  /* ===== NOTIFICATIONS ===== */
  notifyAdmins(excludeChatId, text) {
    const admins = this.db.getAllUsers().filter(u => u.rola === 'admin' && String(u.telegram_id) !== String(excludeChatId));
    admins.forEach(admin => {
      this.bot.sendMessage(admin.telegram_id, text, { parse_mode: 'Markdown' }).catch(() => {});
    });
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

module.exports = BotCommands;
