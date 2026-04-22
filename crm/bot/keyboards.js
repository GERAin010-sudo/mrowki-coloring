/* ============================================
   MRÓWKI COLORING CRM — Telegram Bot Keyboards
   i18n support (pl/ua/ru)
   ============================================ */

const { FUNNELS } = require('../database');

const L = {
  pl: {
    sprzedaz: '🛒 Sprzedaż', wykonanie: '🔧 Wykonanie',
    klienci: '👥 Kompanie', nowe_zlecenie: '➕ Nowa transakcja',
    nowy_klient: '➕ Nowa kompania', raporty: '📊 Raporty', pomoc: '❓ Pomoc',
    powrot: '◀️ Menu główne', anuluj: '◀️ Anuluj', zatwierdz: '✅ Zatwierdź',
    zmien_status: '🔄 Zmień etap', jezyk: '🌐 Język',
    moje_zadania: '📝 Moje zadania',
    okna: 'Okna', drzwi: 'Drzwi', fasady: 'Fasady', bramy_windy: 'Bramy/Windy',
    parapety: 'Parapety', poprawki: 'Poprawki', inne: 'Inne',
    normalny: '🟢 Normalny', wysoki: '🟡 Wysoki', pilny: '🔴 Pilny', niski: '⚪ Niski',
  },
  ua: {
    sprzedaz: '🛒 Продажі', wykonanie: '🔧 Виконання',
    klienci: '👥 Компанії', nowe_zlecenie: '➕ Нова угода',
    nowy_klient: '➕ Нова компанія', raporty: '📊 Звіти', pomoc: '❓ Допомога',
    powrot: '◀️ Головне меню', anuluj: '◀️ Скасувати', zatwierdz: '✅ Підтвердити',
    zmien_status: '🔄 Змінити етап', jezyk: '🌐 Мова',
    moje_zadania: '📝 Мої завдання',
    okna: 'Вікна', drzwi: 'Двері', fasady: 'Фасади', bramy_windy: 'Ворота/Ліфти',
    parapety: 'Підвіконня', poprawki: 'Виправлення', inne: 'Інше',
    normalny: '🟢 Звичайний', wysoki: '🟡 Високий', pilny: '🔴 Терміновий', niski: '⚪ Низький',
  },
  ru: {
    sprzedaz: '🛒 Продажи', wykonanie: '🔧 Исполнение',
    klienci: '👥 Компании', nowe_zlecenie: '➕ Новая сделка',
    nowy_klient: '➕ Новая компания', raporty: '📊 Отчёты', pomoc: '❓ Помощь',
    powrot: '◀️ Главное меню', anuluj: '◀️ Отмена', zatwierdz: '✅ Подтвердить',
    zmien_status: '🔄 Сменить этап', jezyk: '🌐 Язык',
    moje_zadania: '📝 Мои задачи',
    okna: 'Окна', drzwi: 'Двери', fasady: 'Фасады', bramy_windy: 'Ворота/Лифты',
    parapety: 'Подоконники', poprawki: 'Исправления', inne: 'Другое',
    normalny: '🟢 Обычный', wysoki: '🟡 Высокий', pilny: '🔴 Срочный', niski: '⚪ Низкий',
  }
};

function t(lang, key) { return (L[lang] || L.pl)[key] || L.pl[key] || key; }

// Get stage label from FUNNELS
function stageLabel(lang, stageId) {
  for (const funnel of Object.values(FUNNELS)) {
    const s = funnel.stages.find(s => s.id === stageId);
    if (s) return `${s.icon} ${s.name[lang] || s.name.pl}`;
  }
  return stageId;
}

function mainMenu(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: t(lang, 'wykonanie'), callback_data: 'menu_wykonanie' },
          { text: t(lang, 'sprzedaz'), callback_data: 'menu_sprzedaz' }
        ],
        [
          { text: t(lang, 'moje_zadania'), callback_data: 'menu_zadania' },
          { text: t(lang, 'klienci'), callback_data: 'menu_klienci' }
        ],
        [
          { text: t(lang, 'nowe_zlecenie'), callback_data: 'nowe_zlecenie' },
          { text: t(lang, 'raporty'), callback_data: 'menu_raporty' }
        ],
        [
          { text: t(lang, 'pomoc'), callback_data: 'menu_pomoc' },
          { text: t(lang, 'jezyk'), callback_data: 'menu_lang' }
        ]
      ]
    }
  };
}

function serviceTypes(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t(lang, 'okna'), callback_data: 'service_okna' }, { text: t(lang, 'drzwi'), callback_data: 'service_drzwi' }],
        [{ text: t(lang, 'fasady'), callback_data: 'service_fasady' }, { text: t(lang, 'bramy_windy'), callback_data: 'service_bramy_windy' }],
        [{ text: t(lang, 'parapety'), callback_data: 'service_parapety' }, { text: t(lang, 'poprawki'), callback_data: 'service_poprawki' }],
        [{ text: t(lang, 'inne'), callback_data: 'service_inne' }],
        [{ text: t(lang, 'anuluj'), callback_data: 'menu_main' }]
      ]
    }
  };
}

function priorities(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t(lang, 'normalny'), callback_data: 'prio_normalny' }, { text: t(lang, 'wysoki'), callback_data: 'prio_wysoki' }],
        [{ text: t(lang, 'pilny'), callback_data: 'prio_pilny' }, { text: t(lang, 'niski'), callback_data: 'prio_niski' }],
        [{ text: t(lang, 'anuluj'), callback_data: 'menu_main' }]
      ]
    }
  };
}

function confirm(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t(lang, 'zatwierdz'), callback_data: 'confirm_yes' }, { text: t(lang, 'anuluj'), callback_data: 'confirm_no' }]
      ]
    }
  };
}

function back(lang) {
  return {
    reply_markup: {
      inline_keyboard: [[{ text: t(lang, 'powrot'), callback_data: 'menu_main' }]]
    }
  };
}

function langSelect() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🇵🇱 Polski', callback_data: 'setlang_pl' }, { text: '🇺🇦 Українська', callback_data: 'setlang_ua' }, { text: '🇷🇺 Русский', callback_data: 'setlang_ru' }],
        [{ text: '◀️', callback_data: 'menu_main' }]
      ]
    }
  };
}

function companySelectKeyboard(companies, lang) {
  const buttons = companies.slice(0, 10).map(c => [{
    text: `${c.nazwa}${c.telefon ? ' 📞' : ''}`,
    callback_data: `select_company_${c.id}`
  }]);
  buttons.push([{ text: t(lang, 'anuluj'), callback_data: 'menu_main' }]);
  return { reply_markup: { inline_keyboard: buttons } };
}

function dealSelectKeyboard(deals, lang, backTo) {
  const buttons = deals.slice(0, 10).map(d => {
    const stage = stageLabel(lang, d.etap);
    return [{
      text: `${stage} ${d.nazwa}`,
      callback_data: `select_deal_${d.id}`
    }];
  });
  buttons.push([{ text: t(lang, 'powrot'), callback_data: backTo || 'menu_main' }]);
  return { reply_markup: { inline_keyboard: buttons } };
}

function stageChangeKeyboard(dealId, voronka, lang) {
  const funnel = FUNNELS[voronka];
  if (!funnel) return back(lang);
  const rows = [];
  for (let i = 0; i < funnel.stages.length; i += 2) {
    const s1 = funnel.stages[i];
    const row = [{ text: `${s1.icon} ${s1.name[lang] || s1.name.pl}`, callback_data: `chstage_${dealId}_${s1.id}` }];
    if (funnel.stages[i+1]) {
      const s2 = funnel.stages[i+1];
      row.push({ text: `${s2.icon} ${s2.name[lang] || s2.name.pl}`, callback_data: `chstage_${dealId}_${s2.id}` });
    }
    rows.push(row);
  }
  rows.push([{ text: t(lang, 'powrot'), callback_data: `select_deal_${dealId}` }]);
  return { reply_markup: { inline_keyboard: rows } };
}

module.exports = {
  L, t, stageLabel, mainMenu, serviceTypes, priorities, confirm, back, langSelect,
  companySelectKeyboard, dealSelectKeyboard, stageChangeKeyboard
};
