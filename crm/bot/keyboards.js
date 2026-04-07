/* ============================================
   MRÓWKI COLORING CRM — Telegram Bot Keyboards
   ============================================ */

const KEYBOARDS = {
  mainMenu: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📋 Zlecenia', callback_data: 'menu_zlecenia' },
          { text: '👥 Klienci', callback_data: 'menu_klienci' }
        ],
        [
          { text: '➕ Nowe zlecenie', callback_data: 'nowe_zlecenie' },
          { text: '➕ Nowy klient', callback_data: 'nowy_klient' }
        ],
        [
          { text: '📊 Raporty', callback_data: 'menu_raporty' },
          { text: '❓ Pomoc', callback_data: 'menu_pomoc' }
        ]
      ]
    }
  },

  orderStatuses: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🆕 Nowe', callback_data: 'status_nowe' },
          { text: '💰 Wycena', callback_data: 'status_wycena' }
        ],
        [
          { text: '✅ Zaakceptowane', callback_data: 'status_zaakceptowane' },
          { text: '🔧 W trakcie', callback_data: 'status_w_trakcie' }
        ],
        [
          { text: '🏁 Zakończone', callback_data: 'status_zakonczone' },
          { text: '❌ Anulowane', callback_data: 'status_anulowane' }
        ],
        [{ text: '◀️ Powrót', callback_data: 'menu_main' }]
      ]
    }
  },

  serviceTypes: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Okna', callback_data: 'service_okna' },
          { text: 'Drzwi', callback_data: 'service_drzwi' }
        ],
        [
          { text: 'Fasady', callback_data: 'service_fasady' },
          { text: 'Bramy/Windy', callback_data: 'service_bramy_windy' }
        ],
        [
          { text: 'Parapety', callback_data: 'service_parapety' },
          { text: 'Poprawki', callback_data: 'service_poprawki' }
        ],
        [{ text: 'Inne', callback_data: 'service_inne' }],
        [{ text: '◀️ Anuluj', callback_data: 'menu_main' }]
      ]
    }
  },

  clientTypes: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Deweloper', callback_data: 'ctype_deweloper' },
          { text: 'Wykonawca', callback_data: 'ctype_wykonawca' }
        ],
        [
          { text: 'Producent', callback_data: 'ctype_producent' },
          { text: 'Architekt', callback_data: 'ctype_architekt' }
        ],
        [
          { text: 'Montażysta', callback_data: 'ctype_montazysta' },
          { text: 'Administrator', callback_data: 'ctype_administrator' }
        ],
        [{ text: 'Inny', callback_data: 'ctype_inny' }],
        [{ text: '◀️ Anuluj', callback_data: 'menu_main' }]
      ]
    }
  },

  priorities: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🟢 Normalny', callback_data: 'prio_normalny' },
          { text: '🟡 Wysoki', callback_data: 'prio_wysoki' }
        ],
        [
          { text: '🔴 Pilny', callback_data: 'prio_pilny' },
          { text: '⚪ Niski', callback_data: 'prio_niski' }
        ],
        [{ text: '◀️ Anuluj', callback_data: 'menu_main' }]
      ]
    }
  },

  confirm: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Zatwierdź', callback_data: 'confirm_yes' },
          { text: '❌ Anuluj', callback_data: 'confirm_no' }
        ]
      ]
    }
  },

  back: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '◀️ Menu główne', callback_data: 'menu_main' }]
      ]
    }
  }
};

// Generate inline keyboard for client selection
function clientSelectKeyboard(clients) {
  const buttons = clients.slice(0, 10).map(c => [{
    text: `${c.nazwa} (${c.typ || 'brak typu'})`,
    callback_data: `select_client_${c.id}`
  }]);
  buttons.push([{ text: '◀️ Anuluj', callback_data: 'menu_main' }]);
  return { reply_markup: { inline_keyboard: buttons } };
}

// Generate inline keyboard for order selection
function orderSelectKeyboard(orders) {
  const statusIcons = {
    nowe: '🆕', wycena: '💰', zaakceptowane: '✅',
    w_trakcie: '🔧', zakonczone: '🏁', anulowane: '❌'
  };
  const buttons = orders.slice(0, 10).map(o => [{
    text: `${statusIcons[o.status] || '📋'} ${o.numer} — ${o.klient_nazwa || 'Brak klienta'}`,
    callback_data: `select_order_${o.id}`
  }]);
  buttons.push([{ text: '◀️ Menu główne', callback_data: 'menu_main' }]);
  return { reply_markup: { inline_keyboard: buttons } };
}

// Status change keyboard for a specific order
function orderStatusChangeKeyboard(orderId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🆕 Nowe', callback_data: `chstatus_${orderId}_nowe` },
          { text: '💰 Wycena', callback_data: `chstatus_${orderId}_wycena` }
        ],
        [
          { text: '✅ Zaakcept.', callback_data: `chstatus_${orderId}_zaakceptowane` },
          { text: '🔧 W trakcie', callback_data: `chstatus_${orderId}_w_trakcie` }
        ],
        [
          { text: '🏁 Zakończone', callback_data: `chstatus_${orderId}_zakonczone` },
          { text: '❌ Anulowane', callback_data: `chstatus_${orderId}_anulowane` }
        ],
        [{ text: '◀️ Powrót', callback_data: `select_order_${orderId}` }]
      ]
    }
  };
}

module.exports = {
  KEYBOARDS,
  clientSelectKeyboard,
  orderSelectKeyboard,
  orderStatusChangeKeyboard
};
