/* ============================================
   MRÓWKI COLORING CRM — Bot Command Handlers
   ============================================ */

const { KEYBOARDS, clientSelectKeyboard, orderSelectKeyboard, orderStatusChangeKeyboard } = require('./keyboards');

const STATUS_LABELS = {
  nowe: '🆕 Nowe', wycena: '💰 Wycena', zaakceptowane: '✅ Zaakceptowane',
  w_trakcie: '🔧 W trakcie', zakonczone: '🏁 Zakończone', anulowane: '❌ Anulowane'
};

const SERVICE_LABELS = {
  okna: 'Stolarka okienna', drzwi: 'Drzwi aluminiowe', fasady: 'Fasady budynków',
  bramy_windy: 'Bramy i windy', parapety: 'Parapety', poprawki: 'Poprawki lakiernicze', inne: 'Inne'
};

const PRIORITY_LABELS = {
  niski: '⚪ Niski', normalny: '🟢 Normalny', wysoki: '🟡 Wysoki', pilny: '🔴 Pilny'
};

class BotCommands {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
    this.registerCommands();
    this.registerCallbacks();
    this.registerMessages();
  }

  /* ===== COMMAND HANDLERS ===== */
  registerCommands() {
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/menu/, (msg) => this.showMainMenu(msg.chat.id));
    this.bot.onText(/\/zlecenia/, (msg) => this.handleOrders(msg));
    this.bot.onText(/\/klienci/, (msg) => this.handleClients(msg));
    this.bot.onText(/\/nowe_zlecenie/, (msg) => this.startNewOrder(msg));
    this.bot.onText(/\/dodaj_klienta/, (msg) => this.startNewClient(msg));
    this.bot.onText(/\/status (.+)/, (msg, match) => this.handleStatusCheck(msg, match[1]));
    this.bot.onText(/\/raporty/, (msg) => this.handleReports(msg));
    this.bot.onText(/\/pomoc/, (msg) => this.handleHelp(msg));
    this.bot.onText(/\/anuluj/, (msg) => this.handleCancel(msg));
  }

  /* ===== /start ===== */
  handleStart(msg) {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Użytkownik';
    
    // Register user
    this.db.createUser(msg.from.id, firstName);
    
    const text = `
🏗️ *Mrówki Coloring CRM*

Witaj, *${firstName}*!

To system zarządzania zleceniami firmy Mrówki Coloring. Możesz tutaj:

• Tworzyć i zarządzać zleceniami
• Dodawać i edytować klientów
• Śledzić statusy prac
• Przeglądać raporty

Użyj przycisków poniżej lub wpisz /pomoc aby zobaczyć listę komend.
    `.trim();

    this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...KEYBOARDS.mainMenu });
  }

  /* ===== Main Menu ===== */
  showMainMenu(chatId) {
    this.db.clearConversation(chatId);
    this.bot.sendMessage(chatId, '📋 *Menu główne*\nWybierz opcję:', {
      parse_mode: 'Markdown', ...KEYBOARDS.mainMenu
    });
  }

  /* ===== /zlecenia ===== */
  handleOrders(msg) {
    const orders = this.db.getActiveOrders();
    if (orders.length === 0) {
      return this.bot.sendMessage(msg.chat.id, '📋 Brak aktywnych zleceń.', KEYBOARDS.back);
    }
    this.bot.sendMessage(msg.chat.id, `📋 *Aktywne zlecenia (${orders.length}):*`, {
      parse_mode: 'Markdown',
      ...orderSelectKeyboard(orders)
    });
  }

  /* ===== /klienci ===== */
  handleClients(msg) {
    const clients = this.db.getAllClients();
    if (clients.length === 0) {
      return this.bot.sendMessage(msg.chat.id, '👥 Brak klientów w bazie.', KEYBOARDS.back);
    }

    let text = `👥 *Klienci (${clients.length}):*\n\n`;
    clients.slice(0, 15).forEach((c, i) => {
      text += `${i + 1}. *${c.nazwa}*`;
      if (c.typ) text += ` (${c.typ})`;
      if (c.telefon) text += `\n   📞 ${c.telefon}`;
      text += '\n\n';
    });

    this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown', ...KEYBOARDS.back });
  }

  /* ===== /status <numer> ===== */
  handleStatusCheck(msg, query) {
    const order = this.db.getOrderByNumber(query.toUpperCase());
    if (!order) {
      return this.bot.sendMessage(msg.chat.id, `❌ Nie znaleziono zlecenia: ${query}`);
    }
    this.sendOrderDetails(msg.chat.id, order);
  }

  /* ===== /raporty ===== */
  handleReports(msg) {
    const stats = this.db.getStats();
    
    let text = `📊 *Raport — Mrówki Coloring*\n\n`;
    text += `📋 Łączna liczba zleceń: *${stats.totalOrders}*\n`;
    text += `🔄 Aktywne zlecenia: *${stats.activeOrders}*\n`;
    text += `✅ Zakończone: *${stats.completedOrders}*\n`;
    text += `👥 Klienci: *${stats.totalClients}*\n`;
    text += `💰 Przychód (zakończone): *${stats.totalRevenue.toFixed(2)} PLN*\n\n`;

    if (stats.byStatus.length > 0) {
      text += `*Wg statusu:*\n`;
      stats.byStatus.forEach(s => {
        text += `  ${STATUS_LABELS[s.status] || s.status}: ${s.cnt}\n`;
      });
      text += '\n';
    }

    if (stats.byType.length > 0) {
      text += `*Wg typu usługi:*\n`;
      stats.byType.forEach(t => {
        text += `  ${SERVICE_LABELS[t.typ_uslugi] || t.typ_uslugi}: ${t.cnt}\n`;
      });
    }

    this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown', ...KEYBOARDS.back });
  }

  /* ===== /pomoc ===== */
  handleHelp(msg) {
    const text = `
❓ *Pomoc — Mrówki Coloring CRM*

*Komendy:*
/start — Uruchom bota
/menu — Menu główne
/zlecenia — Lista aktywnych zleceń
/klienci — Lista klientów
/nowe\\_zlecenie — Utwórz nowe zlecenie
/dodaj\\_klienta — Dodaj nowego klienta
/status MC-XXXX-XXXX — Sprawdź status zlecenia
/raporty — Podsumowanie i statystyki
/anuluj — Anuluj bieżącą operację
/pomoc — Ta wiadomość

Możesz również używać przycisków w menu.
    `.trim();

    this.bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown', ...KEYBOARDS.back });
  }

  /* ===== /anuluj ===== */
  handleCancel(msg) {
    this.db.clearConversation(msg.chat.id);
    this.bot.sendMessage(msg.chat.id, '❌ Operacja anulowana.', KEYBOARDS.back);
  }

  /* ===== NEW ORDER FLOW ===== */
  startNewOrder(msg) {
    const clients = this.db.getAllClients();
    if (clients.length === 0) {
      return this.bot.sendMessage(msg.chat.id, 
        '⚠️ Najpierw dodaj klienta za pomocą /dodaj\\_klienta', 
        { parse_mode: 'Markdown', ...KEYBOARDS.back });
    }

    this.db.setConversation(msg.chat.id, 'order_select_client', {});
    this.bot.sendMessage(msg.chat.id, '📋 *Nowe zlecenie*\nWybierz klienta:', {
      parse_mode: 'Markdown',
      ...clientSelectKeyboard(clients)
    });
  }

  /* ===== NEW CLIENT FLOW ===== */
  startNewClient(msg) {
    this.db.setConversation(msg.chat.id, 'client_name', {});
    this.bot.sendMessage(msg.chat.id, 
      '👥 *Nowy klient*\nPodaj nazwę firmy/klienta:', 
      { parse_mode: 'Markdown' });
  }

  /* ===== CALLBACK QUERY HANDLERS ===== */
  registerCallbacks() {
    this.bot.on('callback_query', (query) => {
      const chatId = query.message.chat.id;
      const data = query.data;
      
      this.bot.answerCallbackQuery(query.id);

      // Main menu navigation
      if (data === 'menu_main') return this.showMainMenu(chatId);
      if (data === 'menu_zlecenia') return this.handleOrders({ chat: { id: chatId } });
      if (data === 'menu_klienci') return this.handleClients({ chat: { id: chatId } });
      if (data === 'menu_raporty') return this.handleReports({ chat: { id: chatId } });
      if (data === 'menu_pomoc') return this.handleHelp({ chat: { id: chatId } });
      if (data === 'nowe_zlecenie') return this.startNewOrder({ chat: { id: chatId }, from: query.from });
      if (data === 'nowy_klient') return this.startNewClient({ chat: { id: chatId }, from: query.from });

      // Client selection for new order
      if (data.startsWith('select_client_')) {
        const clientId = parseInt(data.replace('select_client_', ''));
        return this.handleClientSelected(chatId, clientId, query.from);
      }

      // Service type selection
      if (data.startsWith('service_')) {
        const serviceType = data.replace('service_', '');
        return this.handleServiceSelected(chatId, serviceType);
      }

      // Priority selection
      if (data.startsWith('prio_')) {
        const priority = data.replace('prio_', '');
        return this.handlePrioritySelected(chatId, priority);
      }

      // Client type selection
      if (data.startsWith('ctype_')) {
        const clientType = data.replace('ctype_', '');
        return this.handleClientTypeSelected(chatId, clientType);
      }

      // Order selection
      if (data.startsWith('select_order_')) {
        const orderId = parseInt(data.replace('select_order_', ''));
        return this.handleOrderSelected(chatId, orderId);
      }

      // Order status change
      if (data.startsWith('chstatus_')) {
        const parts = data.replace('chstatus_', '').split('_');
        const orderId = parseInt(parts[0]);
        const newStatus = parts.slice(1).join('_');
        return this.handleStatusChange(chatId, orderId, newStatus, query.from);
      }

      // Change status button on order details
      if (data.startsWith('change_status_')) {
        const orderId = parseInt(data.replace('change_status_', ''));
        return this.bot.sendMessage(chatId, '🔄 Wybierz nowy status:', orderStatusChangeKeyboard(orderId));
      }

      // Confirm order creation
      if (data === 'confirm_yes') return this.handleConfirmOrder(chatId, query.from);
      if (data === 'confirm_no') return this.handleCancel({ chat: { id: chatId } });
    });
  }

  /* === Order creation flow callbacks === */
  handleClientSelected(chatId, clientId, from) {
    const client = this.db.getClient(clientId);
    if (!client) return this.bot.sendMessage(chatId, '❌ Klient nie znaleziony.');

    const conv = this.db.getConversation(chatId);
    this.db.setConversation(chatId, 'order_select_service', {
      ...((conv && conv.dane) || {}),
      klient_id: clientId,
      klient_nazwa: client.nazwa,
      created_by: from.first_name
    });

    this.bot.sendMessage(chatId, `✅ Klient: *${client.nazwa}*\nWybierz typ usługi:`, {
      parse_mode: 'Markdown',
      ...KEYBOARDS.serviceTypes
    });
  }

  handleServiceSelected(chatId, serviceType) {
    const conv = this.db.getConversation(chatId);
    if (!conv || conv.stan !== 'order_select_service') return;

    this.db.setConversation(chatId, 'order_description', {
      ...conv.dane,
      typ_uslugi: serviceType
    });

    this.bot.sendMessage(chatId, 
      `✅ Usługa: *${SERVICE_LABELS[serviceType] || serviceType}*\nPodaj opis zlecenia:`, 
      { parse_mode: 'Markdown' });
  }

  handlePrioritySelected(chatId, priority) {
    const conv = this.db.getConversation(chatId);
    if (!conv || conv.stan !== 'order_priority') return;

    const data = { ...conv.dane, priorytet: priority };
    this.db.setConversation(chatId, 'order_confirm', data);

    // Show summary
    let text = `📋 *Podsumowanie zlecenia:*\n\n`;
    text += `👤 Klient: *${data.klient_nazwa}*\n`;
    text += `🔧 Usługa: *${SERVICE_LABELS[data.typ_uslugi] || data.typ_uslugi}*\n`;
    text += `📝 Opis: ${data.opis || '—'}\n`;
    text += `📍 Adres: ${data.adres_realizacji || '—'}\n`;
    text += `⚡ Priorytet: *${PRIORITY_LABELS[priority] || priority}*\n\n`;
    text += `Czy potwierdzasz utworzenie zlecenia?`;

    this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...KEYBOARDS.confirm });
  }

  handleConfirmOrder(chatId, from) {
    const conv = this.db.getConversation(chatId);
    if (!conv || conv.stan !== 'order_confirm') return;

    const data = conv.dane;
    const result = this.db.createOrder({
      klient_id: data.klient_id,
      typ_uslugi: data.typ_uslugi,
      opis: data.opis,
      adres_realizacji: data.adres_realizacji,
      priorytet: data.priorytet,
      created_by: from.first_name
    });

    this.db.clearConversation(chatId);

    this.bot.sendMessage(chatId, 
      `✅ *Zlecenie utworzone!*\n\nNumer: *${result.numer}*\nStatus: 🆕 Nowe\n\nUżyj /status ${result.numer} aby sprawdzić szczegóły.`, 
      { parse_mode: 'Markdown', ...KEYBOARDS.back });

    // Notify all admins
    this.notifyAdmins(chatId, `🆕 Nowe zlecenie *${result.numer}*\nKlient: ${data.klient_nazwa}\nUsługa: ${SERVICE_LABELS[data.typ_uslugi]}\nUtworzył: ${from.first_name}`);
  }

  /* === Client creation flow callbacks === */
  handleClientTypeSelected(chatId, clientType) {
    const conv = this.db.getConversation(chatId);
    if (!conv || conv.stan !== 'client_type') return;

    this.db.setConversation(chatId, 'client_phone', {
      ...conv.dane,
      typ: clientType
    });

    this.bot.sendMessage(chatId, `✅ Typ: *${clientType}*\nPodaj numer telefonu (lub wpisz \\- aby pominąć):`, {
      parse_mode: 'Markdown'
    });
  }

  /* ===== MESSAGE HANDLERS (for multi-step flows) ===== */
  registerMessages() {
    this.bot.on('message', (msg) => {
      if (msg.text && msg.text.startsWith('/')) return; // Skip commands
      
      const chatId = msg.chat.id;
      const conv = this.db.getConversation(chatId);
      if (!conv) return;

      switch (conv.stan) {
        // ORDER FLOW
        case 'order_description':
          this.db.setConversation(chatId, 'order_address', {
            ...conv.dane,
            opis: msg.text
          });
          this.bot.sendMessage(chatId, '📍 Podaj adres realizacji (lub wpisz - aby pominąć):');
          break;

        case 'order_address':
          this.db.setConversation(chatId, 'order_priority', {
            ...conv.dane,
            adres_realizacji: msg.text === '-' ? null : msg.text
          });
          this.bot.sendMessage(chatId, '⚡ Wybierz priorytet:', KEYBOARDS.priorities);
          break;

        // CLIENT FLOW
        case 'client_name':
          this.db.setConversation(chatId, 'client_type', {
            nazwa: msg.text,
            created_by: msg.from.first_name
          });
          this.bot.sendMessage(chatId, `✅ Nazwa: *${msg.text}*\nWybierz typ klienta:`, {
            parse_mode: 'Markdown',
            ...KEYBOARDS.clientTypes
          });
          break;

        case 'client_phone':
          this.db.setConversation(chatId, 'client_email', {
            ...conv.dane,
            telefon: msg.text === '-' ? null : msg.text
          });
          this.bot.sendMessage(chatId, '📧 Podaj email (lub wpisz - aby pominąć):');
          break;

        case 'client_email': {
          const data = {
            ...conv.dane,
            email: msg.text === '-' ? null : msg.text
          };

          const result = this.db.createClient(data);
          this.db.clearConversation(chatId);

          this.bot.sendMessage(chatId, 
            `✅ *Klient dodany!*\n\nNazwa: *${data.nazwa}*\nTyp: ${data.typ}\nTelefon: ${data.telefon || '—'}\nEmail: ${data.email || '—'}`, 
            { parse_mode: 'Markdown', ...KEYBOARDS.back });
          break;
        }
      }
    });
  }

  /* ===== UTILITY ===== */
  sendOrderDetails(chatId, order) {
    let text = `📋 *Zlecenie ${order.numer}*\n\n`;
    text += `${STATUS_LABELS[order.status] || order.status}\n\n`;
    text += `👤 Klient: *${order.klient_nazwa || '—'}*\n`;
    if (order.klient_telefon) text += `📞 Tel: ${order.klient_telefon}\n`;
    text += `🔧 Usługa: *${SERVICE_LABELS[order.typ_uslugi] || order.typ_uslugi || '—'}*\n`;
    text += `⚡ Priorytet: ${PRIORITY_LABELS[order.priorytet] || order.priorytet}\n`;
    if (order.opis) text += `📝 Opis: ${order.opis}\n`;
    if (order.adres_realizacji) text += `📍 Adres: ${order.adres_realizacji}\n`;
    if (order.kwota) text += `💰 Kwota: ${order.kwota} ${order.waluta}\n`;
    text += `📅 Utworzono: ${order.created_at}\n`;

    // Action buttons
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Zmień status', callback_data: `change_status_${order.id}` }],
          [{ text: '◀️ Powrót', callback_data: 'menu_zlecenia' }]
        ]
      }
    };

    this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...keyboard });
  }

  handleOrderSelected(chatId, orderId) {
    const order = this.db.getOrder(orderId);
    if (!order) return this.bot.sendMessage(chatId, '❌ Zlecenie nie znalezione.');
    this.sendOrderDetails(chatId, order);
  }

  handleStatusChange(chatId, orderId, newStatus, from) {
    const result = this.db.updateOrderStatus(orderId, newStatus, from.first_name);
    if (!result) return this.bot.sendMessage(chatId, '❌ Nie udało się zmienić statusu.');

    const order = this.db.getOrder(orderId);
    this.bot.sendMessage(chatId, 
      `✅ Status zlecenia *${order.numer}* zmieniony na:\n${STATUS_LABELS[newStatus]}`, 
      { parse_mode: 'Markdown', ...KEYBOARDS.back });

    this.notifyAdmins(chatId, `🔄 Zlecenie *${order.numer}* — status zmieniony na ${STATUS_LABELS[newStatus]} przez ${from.first_name}`);
  }

  notifyAdmins(excludeChatId, text) {
    const admins = this.db.getAllUsers().filter(u => u.rola === 'admin' && String(u.telegram_id) !== String(excludeChatId));
    admins.forEach(admin => {
      this.bot.sendMessage(admin.telegram_id, text, { parse_mode: 'Markdown' }).catch(() => {});
    });
  }
}

module.exports = BotCommands;
