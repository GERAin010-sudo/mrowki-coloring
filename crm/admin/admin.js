/* ============================================
   MRÓWKI COLORING CRM — Admin Panel JS
   Weeek-style Kanban Pipeline CRM + i18n + Themes
   ============================================ */

const API = '';
let currentView = 'dashboard';
let funnels = {};
let dragDealId = null;
let currentLang = localStorage.getItem('crm_lang') || 'pl';
let currentTheme = localStorage.getItem('crm_theme') || 'dark';
let teamCache = null;
let currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');

// Auth header for all fetch calls
const _origFetch = window.fetch;
window.fetch = function(url, opts = {}) {
  if (currentUser?.id) {
    opts.headers = { ...(opts.headers || {}), 'X-User-Id': String(currentUser.id) };
  }
  return _origFetch(url, opts);
};

// ===== i18n TRANSLATIONS =====
const L = {
  pl: {
    dashboard:'Dashboard', sprzedaz:'Sprzedaż', wykonanie:'Wykonanie', kontakty:'Kontakty', kompanie:'Kompanie', magazyn:'Magazyn', realizacje:'Realizacje',
    nowa_transakcja:'Nowa transakcja', dodaj_kontakt:'Dodaj kontakt', dodaj_kompanie:'Dodaj kompanię', nowa_pozycja:'Nowa pozycja', dodaj_zdjecie:'Dodaj zdjęcie',
    transakcje:'Transakcje', wartosc:'Wartość', pozycje:'Pozycje', stan_magazynowy:'Stan magazynowy', magazyn_pusty:'Magazyn pusty',
    nazwa:'Nazwa', email:'Email', telefon:'Telefon', adres:'Adres', nip:'NIP', kategoria:'Kategoria', ilosc:'Ilość', cena_jedn:'Cena jedn.', dostawca:'Dostawca',
    kwota:'Kwota', etap:'Etap', kompania:'Kompania', kontakt:'Kontakt', opis:'Opis', adres_realizacji:'Adres realizacji',
    imie:'Imię', nazwisko:'Nazwisko', stanowisko:'Stanowisko', email_faktury:'Email dla faktur', odpowiedzialny:'Odpowiedzialny',
    utworz:'Utwórz', zapisz:'Zapisz', anuluj:'Anuluj', dodaj:'Dodaj', edytuj:'Edytuj', usun:'Usuń', zamknij:'Zamknij',
    brak:'— brak —', brak_kontaktow:'Brak kontaktów', brak_kompanii:'Brak kompanii', brak_zdjec:'Brak zdjęć', blad:'Błąd ładowania',
    zadania:'Zadania', historia:'Historia', zuzycie_materialow:'Zużycie materiałów', nowe_zadanie:'Nowe zadanie...', na_pewno_usunac:'Na pewno usunąć?',
    zakup:'Zakup', zuzycie:'Zużycie', nr_faktury:'Nr faktury', data_zakupu:'Data zakupu', zapisz_zakup:'Zapisz zakup', zapisz_zuzycie:'Zapisz zużycie',
    transakcja:'Transakcja', notatka:'Notatka', notatki:'Notatki', tytul:'Tytuł', zdjecie:'Zdjęcie', kliknij_przeciagnij:'Kliknij lub przeciągnij',
    przesylanie:'Przesyłanie...', edytuj_realizacje:'Edytuj realizację', nowy_kontakt:'Nowy kontakt', edytuj_kontakt:'Edytuj kontakt',
    nowa_kompania:'Nowa kompania', edytuj_kompanie:'Edytuj kompanię', edytuj_transakcje:'Edytuj transakcję', nowa_pozycja_mag:'Nowa pozycja magazynowa',
    edytuj_pozycje:'Edytuj pozycję', ilosc_poczatkowa:'Ilość początkowa', voronka:'Voronka', wynik:'Wynik',
    ukryte:'Ukryte', widoczne:'Widoczne', jednostka:'Jednostka',
    section_crm:'CRM', section_baza:'Baza', section_zasoby:'Zasoby',
    schemat_platnosci:'Schemat płatności', sp_100:'100%', sp_70_30:'70/30', sp_50_50:'50/50', sp_custom:'Inny',
    pokaz_na_mapie:'Pokaż na mapie', wybierz_na_mapie:'Wskaż na mapie',
    zadania_all:'Zadania', zespol:'Zespół', dodaj_czlonka:'Dodaj osobę', przypisany:'Przypisany', termin:'Termin',
    wszystkie:'Wszystkie', otwarte:'Otwarte', zakonczone:'Zakończone', przeterminowane:'Przeterminowane',
    brak_zadan:'Brak zadań', transakcja_powiazana:'Powiązana transakcja', dzisiaj:'Dzisiaj',
    podzadania:'Podzadania', komentarze:'Komentarze', dodaj_komentarz:'Napisz komentarz...', pliki_zadania:'Pliki',
    opis_zadania:'Opis', dodaj_plik:'Dodaj plik', nowe_podzadanie:'Nowe podzadanie...', lokalizacja:'Lokalizacja',
    wykonaj:'Wykonaj', start:'Start', stop:'Stop', priorytet_label:'Priorytet', tagi_label:'Tagi',
    projekt:'Projekt', czas_szac:'Szacowany czas', czas_sped:'Spędzony czas', historia_zadania:'Historia',
    p_niski:'Niski', p_normalny:'Normalny', p_wysoki:'Wysoki', p_pilny:'Pilny', godzin:'godz.',
    nowe_zadanie:'Nowe zadanie', status_zadania:'Status', kategoria_zadania:'Kategoria', szablon:'Szablon',
    z_szablonu:'Z szablonu', bez_projektu:'Bez projektu', relacje:'Powiązania', przypisani:'Przypisani',
    blokuje:'Blokuje', zablokowane:'Zablokowane przez', powiazane:'Powiązane', duplikat:'Duplikat',
    dodaj_relacje:'Dodaj powiązanie', szukaj_zadania:'Szukaj zadania...', szablony:'Szablony',
    nowy_szablon:'Nowy szablon', edytuj_szablon:'Edytuj szablon', utworz_z_szablonu:'Utwórz z szablonu',
    statusy:'Statusy', kategorie:'Kategorie', ustawienia_zadan:'Ustawienia zadań',
    przedplata:'Przedpłata', przedplata_wymagana:'Czy wymagana przedpłata?', przedplata_kwota:'Kwota przedpłaty',
    przedplata_fv:'FV przedpłaty wystawiona', przedplata_oplacona:'Przedpłata opłacona',
    tak:'Tak', nie:'Nie', oczekuje:'Oczekuje', oplacono:'Opłacono', nie_wystawiono:'Nie wystawiono',
    materialy:'Materiały', zbior_materialow:'Zbiór materiałów', wybierz_ze_skladu:'Wybierz ze skladu', zakup_nowy:'Nowy zakup',
    dostepne:'Dostępne', pobierz:'Pobierz', faktura_zakupu:'Faktura zakupu', wgraj_fakture:'Wgraj fakturę',
    ai_parsuj:'Rozpoznaj AI', ai_parsowanie:'Rozpoznawanie...', pozycje_faktury:'Pozycje faktury',
    dodaj_do_magazynu:'Dodaj do magazynu', cena:'Cena', razem:'Razem', brak_materialow:'Brak materiałów',
    zakupione:'Zakupione', pobrane_ze_skladu:'Pobrane ze skladu', dodaj_material:'Dodaj materiał',
    historia_zakupow:'Historia zakupów', historia_zuzycia:'Historia zużycia', suma_zakupow:'Suma zakupów',
    lacznie_kupiono:'Łącznie kupiono', lacznie_zuzyto:'Łącznie zużyto', aktualny_stan:'Aktualny stan',
    data:'Data', transakcja_powiazana_short:'Transakcja',
    balans:'Balans projektu', przychod:'Przychód (kontrakt)', koszty_materialow:'Koszty materiałów',
    koszty_pracy:'Koszty pracy', koszty_inne:'Inne koszty', zysk:'Zysk', marza:'Marża',
    dodaj_koszt:'Dodaj koszt', typ_kosztu:'Typ kosztu', praca:'Praca', transport:'Transport',
    inne_koszty:'Inne', wykonawca:'Wykonawca', koszty:'Koszty',
    zaloguj_sie:'Zaloguj się', wybierz_uzytkownika:'Wybierz użytkownika', wyloguj:'Wyloguj',
    rola:'Rola', rola_admin:'Admin', rola_wlasciciel:'Właściciel', rola_wykonawca:'Wykonawca',
    zmien_role:'Zmień rolę', brak_uzytkownikow:'Brak użytkowników — wyślij /start w bocie',
    widok_lista:'Lista', widok_kalendarz:'Kalendarz', widok_tydzien:'Tydzień', kanban:'Kanban', moje_zadania:'Moje zadania', bez_statusu:'Bez statusu', section_zadania:'ZADANIA',
    pn:'Pn', wt:'Wt', sr:'Śr', cz:'Cz', pt:'Pt', sb:'Sb', nd:'Nd',
    bez_terminu:'Bez terminu',
  },
  ua: {
    dashboard:'Дашборд', sprzedaz:'Продажі', wykonanie:'Виконання', kontakty:'Контакти', kompanie:'Компанії', magazyn:'Склад', realizacje:'Реалізації',
    nowa_transakcja:'Нова угода', dodaj_kontakt:'Додати контакт', dodaj_kompanie:'Додати компанію', nowa_pozycja:'Нова позиція', dodaj_zdjecie:'Додати фото',
    transakcje:'Угоди', wartosc:'Вартість', pozycje:'Позиції', stan_magazynowy:'Стан складу', magazyn_pusty:'Склад порожній',
    nazwa:'Назва', email:'Email', telefon:'Телефон', adres:'Адреса', nip:'NIP', kategoria:'Категорія', ilosc:'Кількість', cena_jedn:'Ціна за од.', dostawca:'Постачальник',
    kwota:'Сума', etap:'Етап', kompania:'Компанія', kontakt:'Контакт', opis:'Опис', adres_realizacji:'Адреса виконання',
    imie:'Ім\'я', nazwisko:'Прізвище', stanowisko:'Посада', email_faktury:'Email для рахунків', odpowiedzialny:'Відповідальний',
    utworz:'Створити', zapisz:'Зберегти', anuluj:'Скасувати', dodaj:'Додати', edytuj:'Редагувати', usun:'Видалити', zamknij:'Закрити',
    brak:'— немає —', brak_kontaktow:'Немає контактів', brak_kompanii:'Немає компаній', brak_zdjec:'Немає фото', blad:'Помилка завантаження',
    zadania:'Завдання', historia:'Історія', zuzycie_materialow:'Витрати матеріалів', nowe_zadanie:'Нове завдання...', na_pewno_usunac:'Точно видалити?',
    zakup:'Закупівля', zuzycie:'Витрата', nr_faktury:'№ рахунку', data_zakupu:'Дата закупівлі', zapisz_zakup:'Зберегти закупівлю', zapisz_zuzycie:'Зберегти витрату',
    transakcja:'Угода', notatka:'Нотатка', notatki:'Нотатки', tytul:'Назва', zdjecie:'Фото', kliknij_przeciagnij:'Натисніть або перетягніть',
    przesylanie:'Завантаження...', edytuj_realizacje:'Редагувати реалізацію', nowy_kontakt:'Новий контакт', edytuj_kontakt:'Редагувати контакт',
    nowa_kompania:'Нова компанія', edytuj_kompanie:'Редагувати компанію', edytuj_transakcje:'Редагувати угоду', nowa_pozycja_mag:'Нова позиція складу',
    edytuj_pozycje:'Редагувати позицію', ilosc_poczatkowa:'Початкова кількість', voronka:'Воронка', wynik:'Результат',
    ukryte:'Приховано', widoczne:'Видиме', jednostka:'Одиниця',
    section_crm:'CRM', section_baza:'База', section_zasoby:'Ресурси',
    schemat_platnosci:'Схема оплати', sp_100:'100%', sp_70_30:'70/30', sp_50_50:'50/50', sp_custom:'Інша',
    pokaz_na_mapie:'Показати на карті', wybierz_na_mapie:'Вказати на карті',
    zadania_all:'Завдання', zespol:'Команда', dodaj_czlonka:'Додати особу', przypisany:'Призначений', termin:'Термін',
    wszystkie:'Всі', otwarte:'Відкриті', zakonczone:'Завершені', przeterminowane:'Прострочені',
    brak_zadan:'Немає завдань', transakcja_powiazana:"Пов'язана угода", dzisiaj:'Сьогодні',
    podzadania:'Підзавдання', komentarze:'Коментарі', dodaj_komentarz:'Напишіть коментар...', pliki_zadania:'Файли',
    opis_zadania:'Опис', dodaj_plik:'Додати файл', nowe_podzadanie:'Нове підзавдання...', lokalizacja:'Локалізація',
    wykonaj:'Виконати', start:'Старт', stop:'Стоп', priorytet_label:'Пріоритет', tagi_label:'Теги',
    projekt:'Проєкт', czas_szac:'Оцінка часу', czas_sped:'Витрачений час', historia_zadania:'Історія',
    p_niski:'Низький', p_normalny:'Звичайний', p_wysoki:'Високий', p_pilny:'Терміновий', godzin:'год.',
    nowe_zadanie:'Нове завдання', status_zadania:'Статус', kategoria_zadania:'Категорія', szablon:'Шаблон',
    z_szablonu:'З шаблону', bez_projektu:'Без проєкту', relacje:'Зв\'язки', przypisani:'Призначені',
    blokuje:'Блокує', zablokowane:'Заблоковано', powiazane:'Пов\'язане', duplikat:'Дублікат',
    dodaj_relacje:'Додати зв\'язок', szukaj_zadania:'Шукати завдання...', szablony:'Шаблони',
    nowy_szablon:'Новий шаблон', edytuj_szablon:'Редагувати шаблон', utworz_z_szablonu:'Створити з шаблону',
    statusy:'Статуси', kategorie:'Категорії', ustawienia_zadan:'Налаштування завдань',
    przedplata:'Передоплата', przedplata_wymagana:'Чи потрібна передоплата?', przedplata_kwota:'Сума передоплати',
    przedplata_fv:'FV передоплати виставлено', przedplata_oplacona:'Передоплату сплачено',
    tak:'Так', nie:'Ні', oczekuje:'Очікує', oplacono:'Сплачено', nie_wystawiono:'Не виставлено',
    materialy:'Матеріали', zbior_materialow:'Збір матеріалів', wybierz_ze_skladu:'Вибрати зі складу', zakup_nowy:'Нова закупівля',
    dostepne:'Доступно', pobierz:'Забрати', faktura_zakupu:'Рахунок закупівлі', wgraj_fakture:'Завантажити рахунок',
    ai_parsuj:'Розпізнати AI', ai_parsowanie:'Розпізнавання...', pozycje_faktury:'Позиції рахунку',
    dodaj_do_magazynu:'Додати на склад', cena:'Ціна', razem:'Разом', brak_materialow:'Немає матеріалів',
    zakupione:'Закуплене', pobrane_ze_skladu:'Забрано зі складу', dodaj_material:'Додати матеріал',
    historia_zakupow:'Історія закупівель', historia_zuzycia:'Історія витрат', suma_zakupow:'Сума закупівель',
    lacznie_kupiono:'Разом куплено', lacznie_zuzyto:'Разом витрачено', aktualny_stan:'Поточний стан',
    data:'Дата', transakcja_powiazana_short:'Угода',
    balans:'Баланс проєкту', przychod:'Дохід (контракт)', koszty_materialow:'Витрати на матеріали',
    koszty_pracy:'Витрати на роботу', koszty_inne:'Інші витрати', zysk:'Прибуток', marza:'Маржа',
    dodaj_koszt:'Додати витрату', typ_kosztu:'Тип витрати', praca:'Робота', transport:'Транспорт',
    inne_koszty:'Інше', wykonawca:'Виконавець', koszty:'Витрати',
    zaloguj_sie:'Увійти', wybierz_uzytkownika:'Оберіть користувача', wyloguj:'Вийти',
    rola:'Роль', rola_admin:'Адмін', rola_wlasciciel:'Власник', rola_wykonawca:'Виконавець',
    zmien_role:'Змінити роль', brak_uzytkownikow:'Немає користувачів — надішліть /start у боті',
    widok_lista:'Список', widok_kalendarz:'Календар', widok_tydzien:'Тиждень', kanban:'Канбан', moje_zadania:'Мої задачі', bez_statusu:'Без статусу', section_zadania:'ЗАДАЧІ',
    pn:'Пн', wt:'Вт', sr:'Ср', cz:'Чт', pt:'Пт', sb:'Сб', nd:'Нд',
    bez_terminu:'Без терміну',
  },
  ru: {
    dashboard:'Дашборд', sprzedaz:'Продажи', wykonanie:'Исполнение', kontakty:'Контакты', kompanie:'Компании', magazyn:'Склад', realizacje:'Реализации',
    nowa_transakcja:'Новая сделка', dodaj_kontakt:'Добавить контакт', dodaj_kompanie:'Добавить компанию', nowa_pozycja:'Новая позиция', dodaj_zdjecie:'Добавить фото',
    transakcje:'Сделки', wartosc:'Стоимость', pozycje:'Позиции', stan_magazynowy:'Состояние склада', magazyn_pusty:'Склад пуст',
    nazwa:'Название', email:'Email', telefon:'Телефон', adres:'Адрес', nip:'NIP', kategoria:'Категория', ilosc:'Количество', cena_jedn:'Цена за ед.', dostawca:'Поставщик',
    kwota:'Сумма', etap:'Этап', kompania:'Компания', kontakt:'Контакт', opis:'Описание', adres_realizacji:'Адрес исполнения',
    imie:'Имя', nazwisko:'Фамилия', stanowisko:'Должность', email_faktury:'Email для счетов', odpowiedzialny:'Ответственный',
    utworz:'Создать', zapisz:'Сохранить', anuluj:'Отмена', dodaj:'Добавить', edytuj:'Редактировать', usun:'Удалить', zamknij:'Закрыть',
    brak:'— нет —', brak_kontaktow:'Нет контактов', brak_kompanii:'Нет компаний', brak_zdjec:'Нет фото', blad:'Ошибка загрузки',
    zadania:'Задачи', historia:'История', zuzycie_materialow:'Расход материалов', nowe_zadanie:'Новая задача...', na_pewno_usunac:'Точно удалить?',
    zakup:'Закупка', zuzycie:'Расход', nr_faktury:'№ счёта', data_zakupu:'Дата закупки', zapisz_zakup:'Сохранить закупку', zapisz_zuzycie:'Сохранить расход',
    transakcja:'Сделка', notatka:'Заметка', notatki:'Заметки', tytul:'Название', zdjecie:'Фото', kliknij_przeciagnij:'Нажмите или перетяните',
    przesylanie:'Загрузка...', edytuj_realizacje:'Редактировать реализацию', nowy_kontakt:'Новый контакт', edytuj_kontakt:'Редактировать контакт',
    nowa_kompania:'Новая компания', edytuj_kompanie:'Редактировать компанию', edytuj_transakcje:'Редактировать сделку', nowa_pozycja_mag:'Новая позиция склада',
    edytuj_pozycje:'Редактировать позицию', ilosc_poczatkowa:'Начальное количество', voronka:'Воронка', wynik:'Результат',
    ukryte:'Скрыто', widoczne:'Видимое', jednostka:'Единица',
    section_crm:'CRM', section_baza:'База', section_zasoby:'Ресурсы',
    schemat_platnosci:'Схема оплаты', sp_100:'100%', sp_70_30:'70/30', sp_50_50:'50/50', sp_custom:'Другая',
    pokaz_na_mapie:'Показать на карте', wybierz_na_mapie:'Указать на карте',
    zadania_all:'Задания', zespol:'Команда', dodaj_czlonka:'Добавить человека', przypisany:'Назначен', termin:'Срок',
    wszystkie:'Все', otwarte:'Открытые', zakonczone:'Завершённые', przeterminowane:'Просроченные',
    brak_zadan:'Нет заданий', transakcja_powiazana:'Связанная сделка', dzisiaj:'Сегодня',
    podzadania:'Подзадачи', komentarze:'Комментарии', dodaj_komentarz:'Напишите комментарий...', pliki_zadania:'Файлы',
    opis_zadania:'Описание', dodaj_plik:'Добавить файл', nowe_podzadanie:'Новая подзадача...', lokalizacja:'Локация',
    wykonaj:'Выполнить', start:'Старт', stop:'Стоп', priorytet_label:'Приоритет', tagi_label:'Теги',
    projekt:'Проект', czas_szac:'Оценка времени', czas_sped:'Потрачено', historia_zadania:'История',
    p_niski:'Низкий', p_normalny:'Обычный', p_wysoki:'Высокий', p_pilny:'Срочный', godzin:'ч.',
    nowe_zadanie:'Новое задание', status_zadania:'Статус', kategoria_zadania:'Категория', szablon:'Шаблон',
    z_szablonu:'Из шаблона', bez_projektu:'Без проекта', relacje:'Связи', przypisani:'Назначены',
    blokuje:'Блокирует', zablokowane:'Заблокировано', powiazane:'Связано', duplikat:'Дубликат',
    dodaj_relacje:'Добавить связь', szukaj_zadania:'Искать задание...', szablony:'Шаблоны',
    nowy_szablon:'Новый шаблон', edytuj_szablon:'Редактировать шаблон', utworz_z_szablonu:'Создать из шаблона',
    statusy:'Статусы', kategorie:'Категории', ustawienia_zadan:'Настройки заданий',
    przedplata:'Предоплата', przedplata_wymagana:'Нужна предоплата?', przedplata_kwota:'Сумма предоплаты',
    przedplata_fv:'Счёт на предоплату выставлен', przedplata_oplacona:'Предоплата оплачена',
    tak:'Да', nie:'Нет', oczekuje:'Ожидает', oplacono:'Оплачено', nie_wystawiono:'Не выставлено',
    materialy:'Материалы', zbior_materialow:'Сбор материалов', wybierz_ze_skladu:'Выбрать со склада', zakup_nowy:'Новая закупка',
    dostepne:'Доступно', pobierz:'Забрать', faktura_zakupu:'Счёт закупки', wgraj_fakture:'Загрузить счёт',
    ai_parsuj:'Распознать AI', ai_parsowanie:'Распознавание...', pozycje_faktury:'Позиции счёта',
    dodaj_do_magazynu:'Добавить на склад', cena:'Цена', razem:'Итого', brak_materialow:'Нет материалов',
    zakupione:'Закуплено', pobrane_ze_skladu:'Забрано со склада', dodaj_material:'Добавить материал',
    historia_zakupow:'История закупок', historia_zuzycia:'История расхода', suma_zakupow:'Сумма закупок',
    lacznie_kupiono:'Всего куплено', lacznie_zuzyto:'Всего израсходовано', aktualny_stan:'Текущий остаток',
    data:'Дата', transakcja_powiazana_short:'Сделка',
    balans:'Баланс проекта', przychod:'Доход (контракт)', koszty_materialow:'Затраты на материалы',
    koszty_pracy:'Затраты на работу', koszty_inne:'Прочие затраты', zysk:'Прибыль', marza:'Маржа',
    dodaj_koszt:'Добавить расход', typ_kosztu:'Тип расхода', praca:'Работа', transport:'Транспорт',
    inne_koszty:'Прочее', wykonawca:'Исполнитель', koszty:'Затраты',
    zaloguj_sie:'Войти', wybierz_uzytkownika:'Выберите пользователя', wyloguj:'Выйти',
    rola:'Роль', rola_admin:'Админ', rola_wlasciciel:'Учредитель', rola_wykonawca:'Исполнитель',
    zmien_role:'Изменить роль', brak_uzytkownikow:'Нет пользователей — отправьте /start в боте',
    widok_lista:'Список', widok_kalendarz:'Календарь', widok_tydzien:'Неделя', kanban:'Канбан', moje_zadania:'Мои задачи', bez_statusu:'Без статуса', section_zadania:'ЗАДАЧИ',
    pn:'Пн', wt:'Вт', sr:'Ср', cz:'Чт', pt:'Пт', sb:'Сб', nd:'Нд',
    bez_terminu:'Без срока',
  }
};
function t(key) { return L[currentLang]?.[key] || L.pl[key] || key; }
function tName(obj) { return (typeof obj === 'object' && obj !== null) ? (obj[currentLang] || obj.pl || Object.values(obj)[0]) : obj; }

const CATEGORIES_I18N = {
  okna:        { pl:'Okna', ua:'Вікна', ru:'Окна' },
  drzwi:       { pl:'Drzwi', ua:'Двері', ru:'Двери' },
  fasady:      { pl:'Fasady', ua:'Фасади', ru:'Фасады' },
  bramy_windy: { pl:'Bramy/Windy', ua:'Ворота/Ліфти', ru:'Ворота/Лифты' },
  parapety:    { pl:'Parapety', ua:'Підвіконня', ru:'Подоконники' },
  poprawki:    { pl:'Poprawki', ua:'Виправлення', ru:'Исправления' },
  inne:        { pl:'Inne', ua:'Інше', ru:'Другое' },
};
const STOCK_CATS_I18N = {
  material:  { pl:'Materiał', ua:'Матеріал', ru:'Материал' },
  farba:     { pl:'Farba', ua:'Фарба', ru:'Краска' },
  narzedzie: { pl:'Narzędzie', ua:'Інструмент', ru:'Инструмент' },
  srodek:    { pl:'Środek ochrony', ua:'Засіб захисту', ru:'Средство защиты' },
  inne:      { pl:'Inne', ua:'Інше', ru:'Другое' },
};
const STOCK_UNITS = { szt:'szt', l:'l', kg:'kg', m2:'m²', m:'m', op:'op', kpl:'kpl' };
function getCat(key) { return CATEGORIES_I18N[key] ? tName(CATEGORIES_I18N[key]) : key; }
function getStockCat(key) { return STOCK_CATS_I18N[key] ? tName(STOCK_CATS_I18N[key]) : key; }

/* ===== GOOGLE MAPS ===== */
let gmapsLoaded = false;
let gmapsKey = '';

async function loadGoogleMaps() {
  if (gmapsLoaded) return true;
  if (!gmapsKey) {
    try {
      const cfg = await fetch(`${API}/api/config`).then(r => r.json());
      gmapsKey = cfg.googleMapsKey;
    } catch(e) {}
  }
  if (!gmapsKey) return false;
  return new Promise((resolve) => {
    if (window.google?.maps) { gmapsLoaded = true; resolve(true); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${gmapsKey}&libraries=places&callback=__gmapsReady`;
    script.async = true;
    window.__gmapsReady = () => { gmapsLoaded = true; resolve(true); };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function initMapPicker(containerId, inputId, latId, lngId, initLat, initLng) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  if (!container || !input || !window.google?.maps) return;

  const center = (initLat && initLng) ? { lat: initLat, lng: initLng } : { lat: 52.4064, lng: 16.9252 }; // Poznań default
  const zoom = (initLat && initLng) ? 15 : 11;

  const map = new google.maps.Map(container, { center, zoom, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
  const marker = new google.maps.Marker({ position: center, map, draggable: true });

  const autocomplete = new google.maps.places.Autocomplete(input, { types: ['address'], componentRestrictions: { country: 'pl' } });
  autocomplete.bindTo('bounds', map);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    const pos = place.geometry.location;
    map.setCenter(pos);
    map.setZoom(16);
    marker.setPosition(pos);
    document.getElementById(latId).value = pos.lat();
    document.getElementById(lngId).value = pos.lng();
    input.value = place.formatted_address || input.value;
  });

  marker.addListener('dragend', () => {
    const pos = marker.getPosition();
    document.getElementById(latId).value = pos.lat();
    document.getElementById(lngId).value = pos.lng();
    // Reverse geocode
    new google.maps.Geocoder().geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results[0]) {
        input.value = results[0].formatted_address;
      }
    });
  });

  map.addListener('click', (e) => {
    marker.setPosition(e.latLng);
    document.getElementById(latId).value = e.latLng.lat();
    document.getElementById(lngId).value = e.latLng.lng();
    new google.maps.Geocoder().geocode({ location: e.latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        input.value = results[0].formatted_address;
      }
    });
  });
}

function initMapDetail(containerId, lat, lng) {
  const container = document.getElementById(containerId);
  if (!container || !window.google?.maps) return;
  const pos = { lat, lng };
  const map = new google.maps.Map(container, { center: pos, zoom: 15, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, draggable: false, zoomControl: false });
  new google.maps.Marker({ position: pos, map });
}

async function getTeam() {
  if (!teamCache) teamCache = await fetch(`${API}/api/zespol`).then(r => r.json());
  return teamCache;
}
function teamOpts(selectedId) {
  if (!teamCache) return '';
  return `<option value="">${t('brak')}</option>` + teamCache.map(m => `<option value="${m.id}" ${m.id==selectedId?'selected':''}>${m.imie}</option>`).join('');
}

/* ===== THEME & LANG ===== */
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('crm_theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('crm_lang', lang);
  // Update sidebar nav items
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    const key = {dashboard:'dashboard',funnel_sprzedaz:'sprzedaz',funnel_wykonanie:'wykonanie',zadania:'zadania_all',zadania_kanban:'kanban',zadania_tydzien:'widok_tydzien',zadania_moje:'moje_zadania',kontakty:'kontakty',kompanie:'kompanie',magazyn:'magazyn',realizacje:'realizacje'}[el.dataset.view];
    if (key) { const txt = el.childNodes; txt[txt.length - 1].textContent = ' ' + t(key); }
  });
  // Update sidebar section labels
  const sectionLabels = document.querySelectorAll('.nav-section-label');
  const sectionKeys = ['section_crm', 'section_zadania', 'section_baza', 'section_zasoby'];
  sectionLabels.forEach((el, i) => { if (sectionKeys[i]) el.textContent = t(sectionKeys[i]); });
  // Update add button text
  const btnAdd = document.getElementById('btn-add');
  if (btnAdd) { const txt = btnAdd.childNodes; txt[txt.length - 1].textContent = ' ' + t('dodaj'); }
  loadView(currentView);
}

/* ===== ROLE HELPERS ===== */
function isAdmin() { return currentUser?.rola === 'admin'; }
function isOwner() { return currentUser?.rola === 'wlasciciel'; }
function isExecutor() { return currentUser?.rola === 'wykonawca'; }
function canEdit() { return isAdmin() || isOwner(); }
function canManageUsers() { return isAdmin(); }

function getRoleLabel(rola) {
  const map = { admin: t('rola_admin'), wlasciciel: t('rola_wlasciciel'), wykonawca: t('rola_wykonawca') };
  return map[rola] || rola;
}

function getRoleBadgeClass(rola) {
  return rola === 'admin' ? 'role-admin' : rola === 'wlasciciel' ? 'role-owner' : 'role-executor';
}

/* ===== LOGIN SCREEN ===== */
async function showLoginScreen() {
  const app = document.getElementById('app');
  const users = await fetch(`${API}/api/users`).then(r => r.json());

  document.getElementById('sidebar').style.display = 'none';
  document.querySelector('.header').style.display = 'none';

  document.getElementById('content').innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo">🏗️ Mrówki Coloring CRM</div>
        <h2>${t('zaloguj_sie')}</h2>
        <p style="color:var(--text-muted);margin-bottom:16px">${t('wybierz_uzytkownika')}</p>
        ${users.length ? `
          <div class="login-users-list">
            ${users.map(u => `
              <button class="login-user-btn" onclick="loginAs(${u.id})">
                <span class="login-user-avatar" style="background:${u.kolor||'#4A8EFF'}">${u.imie[0]}</span>
                <span class="login-user-name">${u.imie}</span>
                <span class="role-badge ${getRoleBadgeClass(u.rola)}">${getRoleLabel(u.rola)}</span>
              </button>
            `).join('')}
          </div>
        ` : `<div class="empty-state">${t('brak_uzytkownikow')}</div>`}
      </div>
    </div>
  `;
}

async function loginAs(userId) {
  const res = await fetch(`${API}/api/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  if (!res.ok) { alert('Login failed'); return; }
  currentUser = await res.json();
  localStorage.setItem('crm_user', JSON.stringify(currentUser));
  location.reload();
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (e) { /* ignore */ }
  currentUser = null;
  localStorage.removeItem('crm_user');
  window.location.href = '/login.html';
}

/* ===== INIT ===== */
(async () => {
  applyTheme(currentTheme);

  // Check session via /api/auth/me — redirects to /login.html on 401 (handled by server middleware)
  try {
    const meRes = await fetch('/api/auth/me', { credentials: 'include' });
    if (meRes.status === 401) { window.location.href = '/login.html'; return; }
    if (meRes.ok) {
      currentUser = await meRes.json();
      localStorage.setItem('crm_user', JSON.stringify(currentUser));
    } else if (!currentUser) {
      window.location.href = '/login.html';
      return;
    }
  } catch(e) {
    // Network error — fall back to cached user if any
    if (!currentUser) { window.location.href = '/login.html'; return; }
  }

  try {
    const res = await fetch(`${API}/api/funnels`);
    funnels = await res.json();
    await getTeam();
  } catch(e) { console.warn('Could not load funnels config'); }

  // Show user info in sidebar
  const sidebar = document.getElementById('sidebar');
  const userBar = document.createElement('div');
  userBar.className = 'sidebar-user';
  userBar.innerHTML = `
    <div class="sidebar-user-info">
      <span class="sidebar-user-avatar" style="background:${currentUser.kolor||'#4A8EFF'}">${currentUser.imie[0]}</span>
      <div>
        <div class="sidebar-user-name">${currentUser.imie}</div>
        <div class="sidebar-user-role role-badge ${getRoleBadgeClass(currentUser.rola)}">${getRoleLabel(currentUser.rola)}</div>
      </div>
    </div>
    <button class="sidebar-logout-btn" onclick="logout()" title="${t('wyloguj')}">⏻</button>
  `;
  sidebar.insertBefore(userBar, sidebar.firstChild);

  // Hide nav items for executor
  if (isExecutor()) {
    document.querySelectorAll('.nav-item').forEach(item => {
      const view = item.dataset.view;
      // Executor can only see: dashboard, zadania, and their funnel views
      if (['kompanie', 'magazyn', 'realizacje'].includes(view)) {
        item.style.display = 'none';
      }
    });
  }

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

  // Add button — only for admin/owner
  document.getElementById('btn-add').addEventListener('click', () => {
    if (!canEdit()) return;
    if (currentView === 'funnel_sprzedaz') showNewDealForm('sprzedaz');
    else if (currentView === 'funnel_wykonanie') showNewDealForm('wykonanie');
    else if (currentView === 'kontakty') showNewContactForm();
    else if (currentView === 'kompanie') showNewCompanyForm();
    else if (currentView === 'magazyn') showNewStockForm();
    else if (currentView === 'realizacje') showUploadPhotoForm();
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Language select
  const langSel = document.getElementById('lang-select');
  langSel.value = currentLang;
  langSel.addEventListener('change', () => applyLang(langSel.value));

  applyLang(currentLang);
})();

function openModal(title, html, extraClass) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  const modal = document.getElementById('modal');
  modal.classList.remove('modal-wide');
  if (extraClass) modal.classList.add(extraClass);
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); document.getElementById('modal').classList.remove('modal-wide'); }

/* ===== ROUTER ===== */
function loadView(view) {
  const addBtn = document.getElementById('btn-add');
  const title = document.getElementById('page-title');
  addBtn.style.display = 'none';

  const SVG_PLUS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> ';
  const showAdd = canEdit();
  switch(view) {
    case 'dashboard':
      title.textContent = t('dashboard');
      loadDashboard();
      break;
    case 'funnel_sprzedaz':
      title.textContent = t('sprzedaz');
      if (showAdd) { addBtn.style.display = 'inline-flex'; addBtn.innerHTML = SVG_PLUS + t('nowa_transakcja'); }
      loadKanban('sprzedaz');
      break;
    case 'funnel_wykonanie':
      title.textContent = t('wykonanie');
      if (showAdd) { addBtn.style.display = 'inline-flex'; addBtn.innerHTML = SVG_PLUS + t('nowa_transakcja'); }
      loadKanban('wykonanie');
      break;
    case 'zadania':
      title.textContent = t('zadania_all');
      loadTaskModule('#tasks');
      break;
    case 'zadania_kanban':
      title.textContent = 'Kanban';
      loadTaskModule('#kanban');
      break;
    case 'zadania_tydzien':
      title.textContent = t('widok_tydzien');
      loadTaskModule('#week');
      break;
    case 'zadania_moje':
      title.textContent = t('moje_zadania') || 'Moje zadania';
      loadTaskModule('#my-tasks');
      break;
    case 'kontakty':
      title.textContent = t('kontakty');
      if (showAdd) { addBtn.style.display = 'inline-flex'; addBtn.innerHTML = SVG_PLUS + t('dodaj_kontakt'); }
      loadContacts();
      break;
    case 'kompanie':
      title.textContent = t('kompanie');
      if (showAdd) { addBtn.style.display = 'inline-flex'; addBtn.innerHTML = SVG_PLUS + t('dodaj_kompanie'); }
      loadCompanies();
      break;
    case 'magazyn':
      title.textContent = t('magazyn');
      if (showAdd) { addBtn.style.display = 'inline-flex'; addBtn.innerHTML = SVG_PLUS + t('nowa_pozycja'); }
      loadWarehouse();
      break;
    case 'realizacje':
      title.textContent = t('realizacje');
      if (showAdd) addBtn.style.display = 'inline-flex';
      addBtn.innerHTML = SVG_PLUS + t('dodaj_zdjecie');
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
        <div class="stat-card"><div class="stat-card-label">${t('transakcje')}</div><div class="stat-card-value primary">${stats.totalDeals}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('sprzedaz')}</div><div class="stat-card-value accent">${stats.salesDeals} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.salesSum||0).toLocaleString()} zł</small></div></div>
        <div class="stat-card"><div class="stat-card-label">${t('wykonanie')}</div><div class="stat-card-value success">${stats.execDeals} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.execSum||0).toLocaleString()} zł</small></div></div>
        <div class="stat-card"><div class="stat-card-label">${t('kompanie')}</div><div class="stat-card-value">${stats.totalCompanies}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('kontakty')}</div><div class="stat-card-value">${stats.totalContacts}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('magazyn')}</div><div class="stat-card-value">${stats.stockItems} <small style="font-size:0.7rem;color:var(--text-muted)">${(stats.stockValue||0).toLocaleString()} zł</small></div></div>
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">' + t('blad') + '</div>'; }
}

/* ===== KANBAN BOARD ===== */
async function loadKanban(voronka) {
  const c = document.getElementById('content');
  const funnel = funnels[voronka];
  if (!funnel) { c.innerHTML = `<div class="empty-state">${t('blad')}</div>`; return; }

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
              <span class="kanban-col-title">${stage.icon} ${tName(stage.name)}</span>
              <span class="kanban-col-count">${stageDeals.length} · ${stageSum.toLocaleString()} zł</span>
            </div>
            <div class="kanban-col-body">
              ${stageDeals.map(d => dealCard(d)).join('')}
              <button class="kanban-add-btn" onclick="showNewDealForm('${voronka}','${stage.id}')">+ ${t('dodaj')}</button>
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
        ${d.schemat_platnosci && d.schemat_platnosci !== '100' ? `<span class="deal-tag deal-tag-payment">${d.schemat_platnosci.replace('_','/')}</span>` : ''}
        ${d.przedplata_wymagana ? `<span class="deal-tag deal-tag-prepay">${d.przedplata_oplacona_data ? '✅' : d.przedplata_fv_data ? '⏳' : '💳'} ${(d.przedplata_kwota||0).toLocaleString()} zł</span>` : ''}
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
  const stageObj = funnel?.stages.find(s => s.id === deal.etap);
  const stageLabel = stageObj ? tName(stageObj.name) : deal.etap;
  const doneCount = deal.zadania?.filter(z => z.wykonane).length || 0;
  const totalTasks = deal.zadania?.length || 0;

  openModal(deal.nazwa, `
    <div class="deal-detail">
      <div class="deal-detail-top">
        <div class="deal-badge">${stageLabel}</div>
        <div class="deal-amount-big">${(deal.kwota||0).toLocaleString()} ${deal.waluta||'PLN'}</div>
        <div class="deal-badge" style="background:var(--accent-soft);color:var(--accent)">${t('schemat_platnosci')}: ${deal.schemat_platnosci ? deal.schemat_platnosci.replace('_','/') : '100%'}</div>
      </div>

      <div class="deal-detail-grid">
        <div><span class="form-label">${t('kompania')}</span><div>${deal.kompania_nazwa || '—'}</div></div>
        <div><span class="form-label">${t('kontakt')}</span><div>${deal.kontakt_nazwa?.trim() || '—'}${deal.kontakt_email ? `<br><small>${deal.kontakt_email}</small>` : ''}${deal.kontakt_telefon ? `<br><small>${deal.kontakt_telefon}</small>` : ''}</div></div>
        ${deal.opis ? `<div style="grid-column:1/-1"><span class="form-label">${t('opis')}</span><div>${deal.opis}</div></div>` : ''}
        ${deal.adres_realizacji ? `<div style="grid-column:1/-1">
          <span class="form-label">${t('adres')}</span>
          <div>${deal.adres_realizacji}</div>
          ${deal.lat && deal.lng ? `<div class="map-detail-container" id="map-detail-${deal.id}"></div>` : ''}
          <a class="map-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deal.lat && deal.lng ? deal.lat+','+deal.lng : deal.adres_realizacji)}" target="_blank" rel="noopener">📍 ${t('pokaz_na_mapie')}</a>
        </div>` : ''}
      </div>

      ${deal.voronka === 'wykonanie' ? `
      <div class="deal-section prepayment-section">
        <div class="deal-section-header"><span>💳 ${t('przedplata')}</span></div>
        <div class="prepay-tracker" id="prepay-tracker">
          <div class="prepay-row">
            <label class="prepay-toggle">
              <input type="checkbox" id="pp-required" ${deal.przedplata_wymagana ? 'checked' : ''} onchange="togglePrepayment(${id}, this.checked)">
              <span>${t('przedplata_wymagana')}</span>
            </label>
          </div>
          <div id="prepay-details" style="${deal.przedplata_wymagana ? '' : 'display:none'}">
            <div class="prepay-row">
              <span class="form-label">${t('przedplata_kwota')}</span>
              <div class="prepay-amount-wrap">
                <input class="form-input" id="pp-amount" type="number" step="0.01" value="${deal.przedplata_kwota||''}" placeholder="0.00" onchange="savePrepayment(${id})">
                <span class="prepay-currency">zł</span>
              </div>
            </div>
            <div class="prepay-row">
              <span class="form-label">${t('przedplata_fv')}</span>
              <div class="prepay-status">
                <input class="form-input" id="pp-fv-date" type="date" value="${deal.przedplata_fv_data||''}" onchange="savePrepayment(${id})">
                ${deal.przedplata_fv_data ? `<span class="prepay-badge prepay-issued">🧾 ${deal.przedplata_fv_data}</span>` : `<span class="prepay-badge prepay-none">${t('nie_wystawiono')}</span>`}
              </div>
            </div>
            <div class="prepay-row">
              <span class="form-label">${t('przedplata_oplacona')}</span>
              <div class="prepay-status">
                <input class="form-input" id="pp-paid-date" type="date" value="${deal.przedplata_oplacona_data||''}" onchange="savePrepayment(${id})">
                ${deal.przedplata_oplacona_data ? `<span class="prepay-badge prepay-paid">✅ ${t('oplacono')} ${deal.przedplata_oplacona_data}</span>` : `<span class="prepay-badge prepay-waiting">${deal.przedplata_fv_data ? '⏳ ' + t('oczekuje') : ''}</span>`}
              </div>
            </div>
          </div>
        </div>
      </div>` : ''}

      <div class="deal-section">
        <div class="deal-section-header">
          <span>${t('zadania')} ${totalTasks ? `(${doneCount}/${totalTasks})` : ''}</span>
        </div>
        <div id="deal-tasks">
          ${(deal.zadania||[]).map(z => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = z.termin && !z.wykonane && z.termin < today;
            const isToday = z.termin === today;
            return `
            <div class="task-list-item ${z.wykonane ? 'done' : ''} ${isOverdue ? 'overdue' : ''}">
              <input type="checkbox" ${z.wykonane ? 'checked' : ''} onchange="toggleTask(${z.id},${id})">
              ${z.przypisany_imie ? `<span class="task-assignee-chip" style="background:${z.przypisany_kolor||'#4A8EFF'}22;color:${z.przypisany_kolor||'#4A8EFF'}">${z.przypisany_imie}</span>` : ''}
              <span class="task-text" style="cursor:pointer" onclick="closeModal();setTimeout(()=>showTaskDetail(${z.id}),200)">${z.tresc}</span>
              ${z.termin ? `<span class="task-deadline ${isOverdue ? 'overdue' : isToday ? 'today' : 'future'}">${z.termin}</span>` : ''}
              <button type="button" class="task-del" onclick="deleteTask(${z.id},${id})">×</button>
            </div>`;
          }).join('')}
        </div>
        <div class="task-add-row">
          <input type="text" id="new-task-input" placeholder="${t('nowe_zadanie')}" class="form-input" onkeydown="if(event.key==='Enter'){event.preventDefault();addNewTask(${id})}">
          <select class="form-select" id="new-task-assignee">${teamOpts()}</select>
          <input type="date" class="form-input" id="new-task-deadline">
          <button type="button" class="btn-sm" onclick="addNewTask(${id})">+</button>
        </div>
      </div>

      ${deal.voronka === 'wykonanie' ? `
      <div class="deal-section materials-section">
        <div class="deal-section-header">
          <span>📦 ${t('zbior_materialow')}</span>
          <div style="display:flex;gap:6px">
            <button type="button" class="btn-sm" onclick="showPickFromStock(${id})">📥 ${t('wybierz_ze_skladu')}</button>
            <button type="button" class="btn-sm" onclick="showPurchaseForDeal(${id})">🛒 ${t('zakup_nowy')}</button>
          </div>
        </div>

        ${deal.zuzycie?.length ? `
        <div class="mat-sub-header">${t('pobrane_ze_skladu')}</div>
        <div class="mat-items-list">
          ${deal.zuzycie.map(z => `
            <div class="mat-item">
              <span class="mat-item-name">${z.material_nazwa}</span>
              <span class="mat-item-qty">${z.ilosc} ${z.jednostka}</span>
              <span class="mat-item-date">${z.data_zuzycia}</span>
            </div>
          `).join('')}
        </div>` : ''}

        ${deal.zakupy_deal?.length ? `
        <div class="mat-sub-header">${t('zakupione')}</div>
        <div class="mat-items-list">
          ${deal.zakupy_deal.map(z => `
            <div class="mat-item mat-item-purchased">
              <span class="mat-item-name">${z.material_nazwa}</span>
              <span class="mat-item-qty">${z.ilosc} ${z.jednostka}</span>
              <span class="mat-item-price">${z.cena ? z.cena.toFixed(2) + ' zł' : ''}</span>
              <span class="mat-item-date">${z.data_zakupu}</span>
            </div>
          `).join('')}
        </div>` : ''}

        <div class="mat-sub-header">${t('faktura_zakupu')}</div>
        <div class="mat-invoices" id="deal-invoices-${id}">
          ${(deal.zakupy_pliki||[]).map(f => {
            const parsedHtml = f.pozycje ? '<div class="mat-parsed-items">' + renderParsedItems(f.id, JSON.parse(f.pozycje), id) + '</div>' : '';
            return `<div class="mat-invoice-item" id="inv-${f.id}">
              <a href="/uploads/${f.plik}" target="_blank" class="mat-invoice-link">
                ${/\.(jpg|jpeg|png|webp|gif)$/i.test(f.plik) ? `<img src="/uploads/${f.plik}" class="mat-invoice-thumb">` : '📄'}
                <span>${f.nazwa || f.plik}</span>
              </a>
              <div class="mat-invoice-actions">
                <button type="button" class="btn-sm" onclick="aiParseInvoice(${f.id},${id})" title="${t('ai_parsuj')}">🤖 AI</button>
                <button type="button" class="btn-sm btn-danger" onclick="deleteInvoiceFile(${f.id},${id})">×</button>
              </div>
              ${parsedHtml}
            </div>`;
          }).join('')}
        </div>
        <div class="mat-upload-row">
          <input type="file" id="invoice-file-${id}" accept="image/*,.pdf" style="display:none" onchange="uploadInvoiceFile(${id})">
          <button type="button" class="btn-sm" onclick="document.getElementById('invoice-file-${id}').click()">📎 ${t('wgraj_fakture')}</button>
        </div>

        ${!deal.zuzycie?.length && !deal.zakupy_deal?.length && !deal.zakupy_pliki?.length ? `<div class="empty-state" style="padding:12px 0">${t('brak_materialow')}</div>` : ''}
      </div>` : `
      ${deal.zuzycie?.length ? `
      <div class="deal-section">
        <div class="deal-section-header"><span>${t('zuzycie_materialow')}</span></div>
        ${deal.zuzycie.map(z => `<div class="task-item"><span>${z.material_nazwa}: ${z.ilosc} ${z.jednostka}</span><small style="color:var(--text-muted);margin-left:auto">${z.data_zuzycia}</small></div>`).join('')}
      </div>` : ''}`}

      ${deal.voronka === 'wykonanie' ? (() => {
        const revenue = deal.kwota || 0;
        const matCost = (deal.zakupy_deal||[]).reduce((s,z) => s + (z.cena||0), 0);
        const laborCost = (deal.koszty||[]).filter(k => k.typ === 'praca').reduce((s,k) => s + k.kwota, 0);
        const otherCost = (deal.koszty||[]).filter(k => k.typ !== 'praca').reduce((s,k) => s + k.kwota, 0);
        const totalCost = matCost + laborCost + otherCost;
        const profit = revenue - totalCost;
        const margin = revenue > 0 ? (profit / revenue * 100).toFixed(1) : 0;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        return `
      <div class="deal-section balance-section">
        <div class="deal-section-header"><span>📊 ${t('balans')}</span></div>
        <div class="balance-grid">
          <div class="balance-row balance-revenue">
            <span class="balance-label">${t('przychod')}</span>
            <span class="balance-value">${revenue.toLocaleString()} zł</span>
          </div>
          <div class="balance-row balance-expense">
            <span class="balance-label">— ${t('koszty_materialow')}</span>
            <span class="balance-value">${matCost.toLocaleString()} zł</span>
          </div>
          <div class="balance-row balance-expense">
            <span class="balance-label">— ${t('koszty_pracy')}</span>
            <span class="balance-value">${laborCost.toLocaleString()} zł</span>
          </div>
          ${otherCost > 0 ? `<div class="balance-row balance-expense">
            <span class="balance-label">— ${t('koszty_inne')}</span>
            <span class="balance-value">${otherCost.toLocaleString()} zł</span>
          </div>` : ''}
          <div class="balance-divider"></div>
          <div class="balance-row balance-profit ${profitClass}">
            <span class="balance-label">${t('zysk')}</span>
            <span class="balance-value">${profit >= 0 ? '+' : ''}${profit.toLocaleString()} zł</span>
          </div>
          <div class="balance-row balance-margin ${profitClass}">
            <span class="balance-label">${t('marza')}</span>
            <span class="balance-value">${margin}%</span>
          </div>
        </div>
      </div>

      <div class="deal-section costs-section">
        <div class="deal-section-header">
          <span>💰 ${t('koszty')} (${(deal.koszty||[]).length})</span>
          <button type="button" class="btn-sm" onclick="showAddCostForm(${id})">+ ${t('dodaj_koszt')}</button>
        </div>
        ${(deal.koszty||[]).length ? `
        <div class="costs-list">
          ${(deal.koszty||[]).map(k => `
            <div class="cost-item cost-type-${k.typ}">
              <div class="cost-item-main">
                <span class="cost-type-badge">${k.typ === 'praca' ? '👷' : k.typ === 'transport' ? '🚚' : '📋'} ${t(k.typ === 'praca' ? 'praca' : k.typ === 'transport' ? 'transport' : 'inne_koszty')}</span>
                <span class="cost-desc">${k.opis}</span>
                ${k.wykonawca_imie ? `<span class="task-assignee-chip" style="background:${k.wykonawca_kolor||'#4A8EFF'}22;color:${k.wykonawca_kolor||'#4A8EFF'}">${k.wykonawca_imie}</span>` : ''}
              </div>
              <div class="cost-item-right">
                <span class="cost-amount">${k.kwota.toLocaleString()} zł</span>
                <span class="cost-date">${k.data_kosztu}</span>
                <button type="button" class="task-del" onclick="deleteCost(${k.id},${id})">×</button>
              </div>
            </div>
          `).join('')}
        </div>` : ''}
      </div>`;
      })() : ''}

      ${deal.historia?.length ? `
      <div class="deal-section">
        <div class="deal-section-header"><span>${t('historia')}</span></div>
        ${deal.historia.map(h => `<div style="padding:0.3rem 0;font-size:0.8rem;color:var(--text-secondary)">${h.opis} <span style="color:var(--text-muted)">(${new Date(h.created_at).toLocaleString('pl')})</span></div>`).join('')}
      </div>` : ''}

      <div class="form-actions">
        ${canEdit() ? `<button class="btn-submit" onclick="showEditDealForm(${id})">${t('edytuj')}</button>
        <button class="btn-cancel" onclick="deleteDeal(${id})">${t('usun')}</button>` : ''}
        <button class="btn-cancel" onclick="closeModal()">${t('zamknij')}</button>
      </div>
    </div>
  `);
  if (deal.lat && deal.lng) {
    loadGoogleMaps().then(ok => { if (ok) initMapDetail('map-detail-' + deal.id, deal.lat, deal.lng); });
  }
}

function togglePrepayment(dealId, checked) {
  const details = document.getElementById('prepay-details');
  if (details) details.style.display = checked ? '' : 'none';
  savePrepayment(dealId);
}

async function savePrepayment(dealId) {
  await fetch(`${API}/api/transakcje/${dealId}/przedplata`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      przedplata_wymagana: document.getElementById('pp-required')?.checked ? 1 : 0,
      przedplata_kwota: parseFloat(document.getElementById('pp-amount')?.value) || 0,
      przedplata_fv_data: document.getElementById('pp-fv-date')?.value || null,
      przedplata_oplacona_data: document.getElementById('pp-paid-date')?.value || null,
    })
  });
}

async function addNewTask(dealId) {
  const input = document.getElementById('new-task-input');
  if (!input.value.trim()) return;
  const assigneeVal = document.getElementById('new-task-assignee')?.value;
  const assignee = assigneeVal ? parseInt(assigneeVal) : null;
  const deadline = document.getElementById('new-task-deadline')?.value || null;
  await fetch(`${API}/api/transakcje/${dealId}/zadania`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tresc: input.value.trim(), przypisany_id: assignee, termin: deadline })
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
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/transakcje/${id}`, { method: 'DELETE' });
  closeModal();
  loadView(currentView);
}

/* ===== INLINE QUICK-CREATE (company/contact from deal form) ===== */
async function inlineCreateCompany() {
  const wrap = document.getElementById('inline-company-form');
  if (wrap.style.display === 'block') { wrap.style.display = 'none'; return; }
  wrap.innerHTML = `
    <div class="inline-form">
      <input class="form-input" id="ic-name" placeholder="${t('nazwa')} *" required>
      <div class="form-row" style="margin-top:6px">
        <input class="form-input" id="ic-phone" placeholder="${t('telefon')}">
        <input class="form-input" id="ic-email" placeholder="${t('email')}" type="email">
      </div>
      <button type="button" class="btn-sm" style="margin-top:6px;width:100%" onclick="submitInlineCompany()">+ ${t('dodaj')}</button>
    </div>`;
  wrap.style.display = 'block';
}

async function submitInlineCompany() {
  const nazwa = document.getElementById('ic-name').value.trim();
  if (!nazwa) return;
  const res = await fetch(`${API}/api/kompanie`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nazwa, telefon: document.getElementById('ic-phone').value, email: document.getElementById('ic-email').value })
  });
  const data = await res.json();
  const sel = document.getElementById('d-company');
  const opt = document.createElement('option');
  opt.value = data.id || data.lastInsertRowid;
  opt.textContent = nazwa;
  opt.selected = true;
  sel.appendChild(opt);
  document.getElementById('inline-company-form').style.display = 'none';
}

async function inlineCreateContact() {
  const wrap = document.getElementById('inline-contact-form');
  if (wrap.style.display === 'block') { wrap.style.display = 'none'; return; }
  wrap.innerHTML = `
    <div class="inline-form">
      <div class="form-row">
        <input class="form-input" id="ict-first" placeholder="${t('imie')} *" required>
        <input class="form-input" id="ict-last" placeholder="${t('nazwisko')}">
      </div>
      <div class="form-row" style="margin-top:6px">
        <input class="form-input" id="ict-phone" placeholder="${t('telefon')}">
        <input class="form-input" id="ict-email" placeholder="${t('email')}" type="email">
      </div>
      <button type="button" class="btn-sm" style="margin-top:6px;width:100%" onclick="submitInlineContact()">+ ${t('dodaj')}</button>
    </div>`;
  wrap.style.display = 'block';
}

async function submitInlineContact() {
  const imie = document.getElementById('ict-first').value.trim();
  if (!imie) return;
  const kompania_id = document.getElementById('d-company').value || null;
  const res = await fetch(`${API}/api/kontakty`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imie, nazwisko: document.getElementById('ict-last').value, telefon: document.getElementById('ict-phone').value, email: document.getElementById('ict-email').value, kompania_id })
  });
  const data = await res.json();
  const sel = document.getElementById('d-contact');
  const opt = document.createElement('option');
  opt.value = data.id || data.lastInsertRowid;
  opt.textContent = imie + ' ' + (document.getElementById('ict-last').value || '');
  opt.selected = true;
  sel.appendChild(opt);
  document.getElementById('inline-contact-form').style.display = 'none';
}

/* ===== NEW / EDIT DEAL FORM ===== */
async function showNewDealForm(voronka, etap) {
  const companies = await fetch(`${API}/api/kompanie`).then(r => r.json());
  const contacts = await fetch(`${API}/api/kontakty`).then(r => r.json());
  const funnel = funnels[voronka];
  const stageOpts = funnel ? funnel.stages.map(s => `<option value="${s.id}" ${s.id===etap?'selected':''}>${tName(s.name)}</option>`).join('') : '';
  const compOpts = `<option value="">${t('brak')}</option>` + companies.map(c => `<option value="${c.id}">${c.nazwa}</option>`).join('');
  const contOpts = `<option value="">${t('brak')}</option>` + contacts.map(c => `<option value="${c.id}">${c.imie} ${c.nazwisko||''} ${c.kompania_nazwa ? '('+c.kompania_nazwa+')' : ''}</option>`).join('');

  openModal(t('nowa_transakcja'), `
    <form onsubmit="submitDeal(event,'${voronka}')">
      <div class="form-group"><label class="form-label">${t('nazwa')} *</label><input class="form-input" id="d-name" required placeholder="np. Warbud - Poznań - Szpital"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('kwota')}</label><input class="form-input" id="d-amount" type="number" step="0.01" placeholder="0.00"></div>
        <div class="form-group"><label class="form-label">${t('etap')}</label><select class="form-select" id="d-stage">${stageOpts}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('kompania')} <button type="button" class="btn-inline-add" onclick="inlineCreateCompany()">+</button></label>
          <select class="form-select" id="d-company">${compOpts}</select>
          <div id="inline-company-form" style="display:none"></div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('kontakt')} <button type="button" class="btn-inline-add" onclick="inlineCreateContact()">+</button></label>
          <select class="form-select" id="d-contact">${contOpts}</select>
          <div id="inline-contact-form" style="display:none"></div>
        </div>
      </div>
      <div class="form-group"><label class="form-label">${t('schemat_platnosci')}</label><select class="form-select" id="d-payment">
        <option value="100">${t('sp_100')}</option><option value="70_30">${t('sp_70_30')}</option><option value="50_50">${t('sp_50_50')}</option><option value="custom">${t('sp_custom')}</option>
      </select></div>
      <div class="form-group"><label class="form-label">${t('opis')}</label><textarea class="form-textarea" id="d-desc" placeholder="${t('notatki')}..."></textarea></div>
      <div class="form-group">
        <label class="form-label">${t('adres_realizacji')}</label>
        <div class="map-picker-wrap">
          <input class="form-input" id="d-address" placeholder="ul. ..." autocomplete="off">
          <div class="map-container" id="map-new-deal"></div>
          <input type="hidden" id="d-lat"><input type="hidden" id="d-lng">
        </div>
      </div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('utworz')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
    </form>
  `);
  loadGoogleMaps().then(ok => { if (ok) initMapPicker('map-new-deal', 'd-address', 'd-lat', 'd-lng'); });
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
      lat: parseFloat(document.getElementById('d-lat').value) || null,
      lng: parseFloat(document.getElementById('d-lng').value) || null,
      schemat_platnosci: document.getElementById('d-payment').value,
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
  const stageOpts = funnel ? funnel.stages.map(s => `<option value="${s.id}" ${s.id===deal.etap?'selected':''}>${tName(s.name)}</option>`).join('') : '';
  const funnelOpts = Object.entries(funnels).map(([k,v]) => `<option value="${k}" ${k===deal.voronka?'selected':''}>${tName(v.name)}</option>`).join('');
  const compOpts = `<option value="">${t('brak')}</option>` + companies.map(c => `<option value="${c.id}" ${c.id==deal.kompania_id?'selected':''}>${c.nazwa}</option>`).join('');
  const contOpts = `<option value="">${t('brak')}</option>` + contacts.map(c => `<option value="${c.id}" ${c.id==deal.kontakt_id?'selected':''}>${c.imie} ${c.nazwisko||''}</option>`).join('');

  openModal(t('edytuj_transakcje'), `
    <form onsubmit="submitEditDeal(event,${id})">
      <div class="form-group"><label class="form-label">${t('nazwa')} *</label><input class="form-input" id="d-name" required value="${deal.nazwa}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('kwota')}</label><input class="form-input" id="d-amount" type="number" step="0.01" value="${deal.kwota||''}"></div>
        <div class="form-group"><label class="form-label">${t('voronka')}</label><select class="form-select" id="d-funnel">${funnelOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">${t('etap')}</label><select class="form-select" id="d-stage">${stageOpts}</select></div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('kompania')} <button type="button" class="btn-inline-add" onclick="inlineCreateCompany()">+</button></label>
          <select class="form-select" id="d-company">${compOpts}</select>
          <div id="inline-company-form" style="display:none"></div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('kontakt')} <button type="button" class="btn-inline-add" onclick="inlineCreateContact()">+</button></label>
          <select class="form-select" id="d-contact">${contOpts}</select>
          <div id="inline-contact-form" style="display:none"></div>
        </div>
      </div>
      <div class="form-group"><label class="form-label">${t('schemat_platnosci')}</label><select class="form-select" id="d-payment">
        <option value="100" ${deal.schemat_platnosci==='100'?'selected':''}>${t('sp_100')}</option>
        <option value="70_30" ${deal.schemat_platnosci==='70_30'?'selected':''}>${t('sp_70_30')}</option>
        <option value="50_50" ${deal.schemat_platnosci==='50_50'?'selected':''}>${t('sp_50_50')}</option>
        <option value="custom" ${deal.schemat_platnosci==='custom'?'selected':''}>${t('sp_custom')}</option>
      </select></div>
      <div class="form-group"><label class="form-label">${t('opis')}</label><textarea class="form-textarea" id="d-desc">${deal.opis||''}</textarea></div>
      <div class="form-group">
        <label class="form-label">${t('adres_realizacji')}</label>
        <div class="map-picker-wrap">
          <input class="form-input" id="d-address" value="${deal.adres_realizacji||''}" autocomplete="off">
          <div class="map-container" id="map-edit-deal"></div>
          <input type="hidden" id="d-lat" value="${deal.lat||''}"><input type="hidden" id="d-lng" value="${deal.lng||''}">
        </div>
      </div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('zapisz')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
    </form>
  `);
  loadGoogleMaps().then(ok => { if (ok) initMapPicker('map-edit-deal', 'd-address', 'd-lat', 'd-lng', deal.lat || null, deal.lng || null); });
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
      adres_realizacji: document.getElementById('d-address').value,
      lat: parseFloat(document.getElementById('d-lat').value) || null,
      lng: parseFloat(document.getElementById('d-lng').value) || null,
      schemat_platnosci: document.getElementById('d-payment').value
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
      <div class="table-header"><span class="table-title">${t('kontakty')} (${contacts.length})</span></div>
      ${contacts.length ? `<table><thead><tr><th>${t('imie')} ${t('nazwisko')}</th><th>${t('email')}</th><th>${t('telefon')}</th><th>${t('kompania')}</th><th></th></tr></thead><tbody>
        ${contacts.map(ct => `<tr>
          <td><strong>${ct.imie} ${ct.nazwisko||''}</strong></td>
          <td>${ct.email||'—'}</td>
          <td>${ct.telefon||'—'}</td>
          <td>${ct.kompania_nazwa||'—'}</td>
          <td><button class="btn-sm" onclick="showEditContactForm(${ct.id})">✏️</button> <button class="btn-sm btn-danger" onclick="deleteContact(${ct.id})">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">' + t('brak_kontaktow') + '</div>'}
    </div>
  `;
}

async function showNewContactForm() {
  const companies = await fetch(`${API}/api/kompanie`).then(r => r.json());
  const compOpts = `<option value="">${t('brak')}</option>` + companies.map(c => `<option value="${c.id}">${c.nazwa}</option>`).join('');
  openModal(t('nowy_kontakt'), `
    <form onsubmit="submitContact(event)">
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('imie')} *</label><input class="form-input" id="c-first" required></div>
        <div class="form-group"><label class="form-label">${t('nazwisko')}</label><input class="form-input" id="c-last"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('email')}</label><input class="form-input" id="c-email" type="email"></div>
        <div class="form-group"><label class="form-label">${t('telefon')}</label><input class="form-input" id="c-phone"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('kompania')}</label><select class="form-select" id="c-company">${compOpts}</select></div>
      <div class="form-group"><label class="form-label">${t('stanowisko')}</label><input class="form-input" id="c-position"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('dodaj')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  const compOpts = `<option value="">${t('brak')}</option>` + companies.map(c => `<option value="${c.id}" ${c.id==ct.kompania_id?'selected':''}>${c.nazwa}</option>`).join('');
  openModal(t('edytuj_kontakt'), `
    <form onsubmit="submitEditContact(event,${id})">
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('imie')} *</label><input class="form-input" id="c-first" required value="${ct.imie}"></div>
        <div class="form-group"><label class="form-label">${t('nazwisko')}</label><input class="form-input" id="c-last" value="${ct.nazwisko||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('email')}</label><input class="form-input" id="c-email" value="${ct.email||''}"></div>
        <div class="form-group"><label class="form-label">${t('telefon')}</label><input class="form-input" id="c-phone" value="${ct.telefon||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('kompania')}</label><select class="form-select" id="c-company">${compOpts}</select></div>
      <div class="form-group"><label class="form-label">${t('stanowisko')}</label><input class="form-input" id="c-position" value="${ct.stanowisko||''}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('zapisz')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/kontakty/${id}`, { method: 'DELETE' });
  loadView('kontakty');
}

/* ===== COMPANIES ===== */
async function loadCompanies() {
  const c = document.getElementById('content');
  const comps = await fetch(`${API}/api/kompanie`).then(r => r.json());
  c.innerHTML = `
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">${t('kompanie')} (${comps.length})</span></div>
      ${comps.length ? `<table><thead><tr><th>${t('nazwa')}</th><th>${t('email')}</th><th>${t('telefon')}</th><th>${t('adres')}</th><th>${t('nip')}</th><th></th></tr></thead><tbody>
        ${comps.map(co => `<tr>
          <td><strong>${co.nazwa}</strong></td>
          <td>${co.email||'—'}</td>
          <td>${co.telefon||'—'}</td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${co.adres||'—'}</td>
          <td>${co.nip||'—'}</td>
          <td><button class="btn-sm" onclick="showEditCompanyForm(${co.id})">✏️</button> <button class="btn-sm btn-danger" onclick="deleteCompany(${co.id})">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">' + t('brak_kompanii') + '</div>'}
    </div>
  `;
}

async function showNewCompanyForm() {
  openModal(t('nowa_kompania'), `
    <form onsubmit="submitCompany(event)">
      <div class="form-group"><label class="form-label">${t('nazwa')} *</label><input class="form-input" id="co-name" required></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('email')}</label><input class="form-input" id="co-email" type="email"></div>
        <div class="form-group"><label class="form-label">${t('telefon')}</label><input class="form-input" id="co-phone"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('adres')}</label><input class="form-input" id="co-address"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('nip')}</label><input class="form-input" id="co-nip" placeholder="000-000-00-00"></div>
        <div class="form-group"><label class="form-label">${t('email_faktury')}</label><input class="form-input" id="co-inv-email" type="email"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('odpowiedzialny')}</label><input class="form-input" id="co-resp"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('dodaj')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  openModal(t('edytuj_kompanie'), `
    <form onsubmit="submitEditCompany(event,${id})">
      <div class="form-group"><label class="form-label">${t('nazwa')} *</label><input class="form-input" id="co-name" required value="${co.nazwa}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('email')}</label><input class="form-input" id="co-email" value="${co.email||''}"></div>
        <div class="form-group"><label class="form-label">${t('telefon')}</label><input class="form-input" id="co-phone" value="${co.telefon||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('adres')}</label><input class="form-input" id="co-address" value="${co.adres||''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('nip')}</label><input class="form-input" id="co-nip" value="${co.nip||''}"></div>
        <div class="form-group"><label class="form-label">${t('email_faktury')}</label><input class="form-input" id="co-inv-email" value="${co.email_faktury||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('odpowiedzialny')}</label><input class="form-input" id="co-resp" value="${co.odpowiedzialny||''}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('zapisz')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  if (!confirm(t('na_pewno_usunac'))) return;
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
      <div class="stat-card"><div class="stat-card-label">${t('pozycje')}</div><div class="stat-card-value">${items.length}</div></div>
      <div class="stat-card"><div class="stat-card-label">${t('wartosc')}</div><div class="stat-card-value accent">${totalVal.toLocaleString()} zł</div></div>
    </div>
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">${t('stan_magazynowy')}</span></div>
      ${items.length ? `<table><thead><tr><th>${t('nazwa')}</th><th>${t('kategoria')}</th><th>${t('ilosc')}</th><th>${t('cena_jedn')}</th><th>${t('wartosc')}</th><th>${t('dostawca')}</th><th></th></tr></thead><tbody>
        ${items.map(i => `<tr style="cursor:pointer" onclick="showStockDetail(${i.id})">
          <td><strong>${i.nazwa}</strong></td>
          <td>${getStockCat(i.kategoria)}</td>
          <td>${i.ilosc} ${STOCK_UNITS[i.jednostka]||i.jednostka}</td>
          <td>${i.cena_jedn.toLocaleString()} zł</td>
          <td>${(i.ilosc * i.cena_jedn).toLocaleString()} zł</td>
          <td>${i.dostawca||'—'}</td>
          <td>
            <button class="btn-sm" onclick="event.stopPropagation();showPurchaseForm(${i.id},'${i.nazwa.replace(/'/g,"\\'")}')" title="${t('zakup')}">📥</button>
            <button class="btn-sm" onclick="event.stopPropagation();showConsumeForm(${i.id},'${i.nazwa.replace(/'/g,"\\'")}')" title="${t('zuzycie')}">📤</button>
            <button class="btn-sm" onclick="event.stopPropagation();showEditStockForm(${i.id})">✏️</button>
            <button class="btn-sm btn-danger" onclick="event.stopPropagation();deleteStock(${i.id})">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty-state">' + t('magazyn_pusty') + '</div>'}
    </div>
  `;
}

function showNewStockForm() {
  const catOpts = Object.entries(STOCK_CATS_I18N).map(([k,v]) => `<option value="${k}">${tName(v)}</option>`).join('');
  const unitOpts = Object.entries(STOCK_UNITS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  openModal(t('nowa_pozycja_mag'), `
    <form onsubmit="submitStock(event)">
      <div class="form-group"><label class="form-label">${t('nazwa')} *</label><input class="form-input" id="s-name" required placeholder="np. Farba RAL 7016"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('kategoria')}</label><select class="form-select" id="s-cat">${catOpts}</select></div>
        <div class="form-group"><label class="form-label">${t('jednostka')}</label><select class="form-select" id="s-unit">${unitOpts}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('ilosc_poczatkowa')}</label><input class="form-input" id="s-qty" type="number" step="0.01" value="0"></div>
        <div class="form-group"><label class="form-label">${t('cena_jedn')} (zł)</label><input class="form-input" id="s-price" type="number" step="0.01" value="0"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('dostawca')}</label><input class="form-input" id="s-supplier"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('dodaj')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  const catOpts = Object.entries(STOCK_CATS_I18N).map(([k,v]) => `<option value="${k}" ${k===item.kategoria?'selected':''}>${tName(v)}</option>`).join('');
  const unitOpts = Object.entries(STOCK_UNITS).map(([k,v]) => `<option value="${k}" ${k===item.jednostka?'selected':''}>${v}</option>`).join('');
  openModal(t('edytuj_pozycje'), `
    <form onsubmit="submitEditStock(event,${id})">
      <div class="form-group"><label class="form-label">${t('nazwa')} *</label><input class="form-input" id="s-name" required value="${item.nazwa}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('kategoria')}</label><select class="form-select" id="s-cat">${catOpts}</select></div>
        <div class="form-group"><label class="form-label">${t('jednostka')}</label><select class="form-select" id="s-unit">${unitOpts}</select></div>
      </div>
      <div class="form-group"><label class="form-label">${t('cena_jedn')} (zł)</label><input class="form-input" id="s-price" type="number" step="0.01" value="${item.cena_jedn}"></div>
      <div class="form-group"><label class="form-label">${t('dostawca')}</label><input class="form-input" id="s-supplier" value="${item.dostawca||''}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('zapisz')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  openModal(`${t('zakup')}: ${name}`, `
    <form onsubmit="submitPurchase(event,${id})">
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('ilosc')} *</label><input class="form-input" id="p-qty" type="number" step="0.01" required></div>
        <div class="form-group"><label class="form-label">${t('cena')} (zł)</label><input class="form-input" id="p-price" type="number" step="0.01"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('nr_faktury')}</label><input class="form-input" id="p-invoice"></div>
        <div class="form-group"><label class="form-label">${t('dostawca')}</label><input class="form-input" id="p-supplier" placeholder="${t('dostawca')}"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('data_zakupu')}</label><input class="form-input" id="p-date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('zapisz_zakup')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
      dostawca: document.getElementById('p-supplier')?.value || null,
      data_zakupu: document.getElementById('p-date').value
    })
  });
  closeModal(); loadView('magazyn');
}

async function showConsumeForm(stockId, name) {
  const deals = await fetch(`${API}/api/transakcje?voronka=wykonanie`).then(r => r.json());
  const dealOpts = `<option value="">${t('brak')}</option>` + deals.map(d => `<option value="${d.id}">${d.nazwa} (${(d.kwota||0).toLocaleString()} zł)</option>`).join('');
  openModal(`${t('zuzycie')}: ${name}`, `
    <form onsubmit="submitConsume(event,${stockId})">
      <div class="form-group"><label class="form-label">${t('ilosc')} *</label><input class="form-input" id="u-qty" type="number" step="0.01" required></div>
      <div class="form-group"><label class="form-label">${t('transakcja')}</label><select class="form-select" id="u-deal">${dealOpts}</select></div>
      <div class="form-group"><label class="form-label">${t('notatka')}</label><input class="form-input" id="u-note"></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('zapisz_zuzycie')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/magazyn/${id}`, { method: 'DELETE' });
  loadView('magazyn');
}

/* ===== STOCK DETAIL (history of purchases & consumption) ===== */
async function showStockDetail(id) {
  const item = await fetch(`${API}/api/magazyn/${id}`).then(r => r.json());
  if (!item) return;
  const totalPurchased = item.zakupy.reduce((s, z) => s + z.ilosc, 0);
  const totalSpent = item.zakupy.reduce((s, z) => s + (z.cena || 0), 0);
  const totalConsumed = item.zuzycie.reduce((s, z) => s + z.ilosc, 0);

  openModal(item.nazwa, `
    <div class="stock-detail">
      <div class="stock-detail-top">
        <div class="stock-detail-badge">${getStockCat(item.kategoria)}</div>
        <div class="stock-detail-qty">${item.ilosc} ${STOCK_UNITS[item.jednostka]||item.jednostka}</div>
        <div class="stock-detail-val">${(item.ilosc * item.cena_jedn).toLocaleString()} zł</div>
      </div>

      <div class="stock-detail-stats">
        <div class="sd-stat"><span class="sd-stat-label">${t('aktualny_stan')}</span><span class="sd-stat-value">${item.ilosc} ${STOCK_UNITS[item.jednostka]||item.jednostka}</span></div>
        <div class="sd-stat"><span class="sd-stat-label">${t('cena_jedn')}</span><span class="sd-stat-value">${item.cena_jedn.toLocaleString()} zł</span></div>
        <div class="sd-stat"><span class="sd-stat-label">${t('lacznie_kupiono')}</span><span class="sd-stat-value">${totalPurchased} ${STOCK_UNITS[item.jednostka]||item.jednostka}</span></div>
        <div class="sd-stat"><span class="sd-stat-label">${t('lacznie_zuzyto')}</span><span class="sd-stat-value">${totalConsumed} ${STOCK_UNITS[item.jednostka]||item.jednostka}</span></div>
        <div class="sd-stat"><span class="sd-stat-label">${t('suma_zakupow')}</span><span class="sd-stat-value accent">${totalSpent.toLocaleString()} zł</span></div>
        ${item.dostawca ? `<div class="sd-stat"><span class="sd-stat-label">${t('dostawca')}</span><span class="sd-stat-value">${item.dostawca}</span></div>` : ''}
      </div>

      <div class="deal-section">
        <div class="deal-section-header">
          <span>📥 ${t('historia_zakupow')} (${item.zakupy.length})</span>
          <button type="button" class="btn-sm" onclick="closeModal();setTimeout(()=>showPurchaseForm(${id},'${item.nazwa.replace(/'/g,"\\'")}'),200)">+ ${t('zakup')}</button>
        </div>
        ${item.zakupy.length ? `
        <table class="stock-history-table"><thead><tr>
          <th>${t('data')}</th><th>${t('ilosc')}</th><th>${t('cena')}</th><th>${t('nr_faktury')}</th><th>${t('dostawca')}</th><th>${t('transakcja_powiazana_short')}</th>
        </tr></thead><tbody>
          ${item.zakupy.map(z => `<tr>
            <td>${z.data_zakupu||'—'}</td>
            <td class="accent"><strong>+${z.ilosc}</strong> ${STOCK_UNITS[item.jednostka]||item.jednostka}</td>
            <td>${z.cena ? z.cena.toLocaleString() + ' zł' : '—'}</td>
            <td>${z.faktura||'—'}</td>
            <td>${z.dostawca||'—'}</td>
            <td>${z.transakcja_nazwa ? `<span class="stock-deal-link" onclick="closeModal();setTimeout(()=>showDealDetail(${z.transakcja_id}),200)">${z.transakcja_nazwa}</span>` : '—'}</td>
          </tr>`).join('')}
        </tbody></table>` : `<div class="empty-state" style="padding:8px 0;font-size:0.85rem">—</div>`}
      </div>

      <div class="deal-section">
        <div class="deal-section-header">
          <span>📤 ${t('historia_zuzycia')} (${item.zuzycie.length})</span>
          <button type="button" class="btn-sm" onclick="closeModal();setTimeout(()=>showConsumeForm(${id},'${item.nazwa.replace(/'/g,"\\'")}'),200)">+ ${t('zuzycie')}</button>
        </div>
        ${item.zuzycie.length ? `
        <table class="stock-history-table"><thead><tr>
          <th>${t('data')}</th><th>${t('ilosc')}</th><th>${t('transakcja_powiazana_short')}</th><th>${t('notatka')}</th>
        </tr></thead><tbody>
          ${item.zuzycie.map(z => `<tr>
            <td>${z.data_zuzycia||'—'}</td>
            <td style="color:#ef4444"><strong>-${z.ilosc}</strong> ${STOCK_UNITS[item.jednostka]||item.jednostka}</td>
            <td>${z.transakcja_nazwa ? `<span class="stock-deal-link" onclick="closeModal();setTimeout(()=>showDealDetail(${z.transakcja_id}),200)">${z.transakcja_nazwa}</span>` : '—'}</td>
            <td>${z.notatki||'—'}</td>
          </tr>`).join('')}
        </tbody></table>` : `<div class="empty-state" style="padding:8px 0;font-size:0.85rem">—</div>`}
      </div>

      <div class="form-actions">
        <button type="button" class="btn-submit" onclick="closeModal();setTimeout(()=>showEditStockForm(${id}),200)">${t('edytuj')}</button>
        <button type="button" class="btn-cancel" onclick="closeModal()">${t('zamknij')}</button>
      </div>
    </div>
  `, 'modal-wide');
}

/* ===== TASK DETAIL MODAL (2-column layout like Dashboard_CRM) ===== */
async function showTaskDetail(taskId) {
  const task = await fetch(`${API}/api/zadania/${taskId}`).then(r => r.json());
  if (!task) return;
  const team = await getTeam();
  const statuses = await getTaskStatuses();
  const categories = await getTaskCategories();
  const subDone = task.podzadania?.filter(p => p.wykonane).length || 0;
  const subTotal = task.podzadania?.length || 0;
  const isImg = (f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f);
  const timerRunning = !!task.timer_start;
  const timeSpent = task.czas_spedzony || 0;
  const priorityIcons = { niski:'⚪', normalny:'🟢', wysoki:'🟡', pilny:'🔴' };
  const priLabels = { niski:t('p_niski'), normalny:t('p_normalny'), wysoki:t('p_wysoki'), pilny:t('p_pilny') };
  const priColors = { niski:'#9e9e9e', normalny:'#4caf50', wysoki:'#ff9800', pilny:'#e53935' };
  const currentStatus = statuses.find(s => s.id == task.status_id) || statuses[0];
  const currentCategory = categories.find(c => c.id == task.kategoria_id);
  const assignees = task.przypisani || [];
  const relations = task.relacje || [];
  const pColor = priColors[task.priorytet] || priColors.normalny;

  document.getElementById('modal').classList.add('modal-wide');
  openModal(`#${task.id} ${task.tresc}`, `
    <div class="td2">
      <!-- Header: badges row -->
      <div class="td2-header">
        <div class="td2-badges">
          ${statuses.map(s => `
            <span class="task-badge ${s.id == task.status_id ? 'active' : ''}" style="--badge-color:${s.kolor}" onclick="updateTaskStatus(${taskId},${s.id})">${s.ikona||''} ${s.nazwa}</span>
          `).join('')}
          <span class="task-badge" style="--badge-color:${pColor}">${priorityIcons[task.priorytet]||'🟢'} ${priLabels[task.priorytet]||priLabels.normalny}</span>
          ${currentCategory ? `<span class="task-badge" style="--badge-color:${currentCategory.kolor}">${currentCategory.ikona||''} ${currentCategory.nazwa}</span>` : ''}
        </div>
        <div class="td2-header-actions">
          <button type="button" class="td-btn-complete ${task.wykonane?'done':''}" onclick="toggleTaskAndReload(${taskId})">
            ${task.wykonane ? '✅' : '○'} ${task.wykonane ? t('zakonczone') : t('wykonaj')}
          </button>
          <button type="button" class="td-btn-timer ${timerRunning?'running':''}" onclick="${timerRunning ? `stopTimer(${taskId})` : `startTimer(${taskId})`}">
            ${timerRunning ? '⏸' : '▶'} ${timerRunning ? t('stop') : t('start')}
          </button>
        </div>
      </div>

      <!-- 2-column grid -->
      <div class="td2-grid">
        <!-- LEFT: main content -->
        <div class="td2-main">

          <!-- Description -->
          <div class="td2-card">
            <h4 class="td2-card-title">${t('opis_zadania')}</h4>
            <textarea class="td2-textarea" id="td-desc" placeholder="${t('opis_zadania')}..." onblur="saveTaskDetail(${taskId})">${task.opis||''}</textarea>
          </div>

          <!-- Subtasks -->
          <div class="td2-card">
            <h4 class="td2-card-title">${t('podzadania')} <span class="td2-count">${subDone}/${subTotal}</span></h4>
            ${subTotal > 0 ? `<div class="td2-progress"><div class="td2-progress-bar" style="width:${subTotal?Math.round(subDone/subTotal*100):0}%"></div></div>` : ''}
            <div class="td2-subtasks">
              ${(task.podzadania||[]).map(p => `
                <div class="td2-subtask ${p.wykonane ? 'done' : ''}">
                  <input type="checkbox" ${p.wykonane ? 'checked' : ''} onchange="toggleSubtask(${p.id},${taskId})">
                  <span class="${p.wykonane ? 'td2-done-text' : ''}">${p.tresc}</span>
                  <button type="button" class="td2-del" onclick="deleteSubtask(${p.id},${taskId})">×</button>
                </div>
              `).join('')}
              <div class="td2-add-row">
                <input type="text" id="td-new-subtask" placeholder="${t('nowe_podzadanie')}" class="td2-input" onkeydown="if(event.key==='Enter'){event.preventDefault();addSubtask(${taskId})}">
                <button type="button" class="td2-add-btn" onclick="addSubtask(${taskId})">+</button>
              </div>
            </div>
          </div>

          <!-- Relations -->
          ${relations.length > 0 || true ? `
          <div class="td2-card">
            <h4 class="td2-card-title">${t('relacje')}</h4>
            ${relations.map(r => `
              <div class="td2-relation">
                <span class="td2-rel-type td-relation-${r.typ}">${t(r.typ) || r.typ}</span>
                <span class="td2-rel-link" onclick="closeModal();setTimeout(()=>showTaskDetail(${r.related_id}),200)">#${r.related_id} ${r.related_tresc||''}</span>
                <button type="button" class="td2-del" onclick="deleteRelation(${r.id},${taskId})">×</button>
              </div>
            `).join('')}
            <div class="td2-add-relation">
              <select id="td-rel-type" class="td2-select-sm">
                <option value="blokuje">${t('blokuje')}</option>
                <option value="zablokowane">${t('zablokowane')}</option>
                <option value="powiazane">${t('powiazane')}</option>
                <option value="duplikat">${t('duplikat')}</option>
              </select>
              <div class="td-rel-search-wrap" style="flex:1">
                <input type="text" class="td2-input" id="td-rel-search" placeholder="${t('szukaj_zadania')}" oninput="searchRelationTasks(this.value,${taskId})">
                <div class="td-rel-dropdown" id="td-rel-dropdown"></div>
              </div>
            </div>
          </div>` : ''}

          <!-- Files -->
          <div class="td2-card">
            <div class="td2-card-header">
              <h4 class="td2-card-title">${t('pliki_zadania')} <span class="td2-count">${task.pliki?.length||0}</span></h4>
              <input type="file" id="td-file-input" style="display:none" multiple onchange="uploadTaskFiles(${taskId})">
              <button type="button" class="td2-add-btn" onclick="document.getElementById('td-file-input').click()">📎 ${t('dodaj_plik')}</button>
            </div>
            <div class="task-files-grid">
              ${(task.pliki||[]).map(f => isImg(f.plik) ? `
                <div class="task-file-thumb">
                  <img src="/uploads/${f.plik}" alt="${f.nazwa}" onclick="window.open('/uploads/${f.plik}','_blank')">
                  <span class="task-file-name">${f.nazwa||f.plik}</span>
                  <button type="button" class="task-file-del" onclick="deleteTaskFile(${f.id},${taskId})">×</button>
                </div>
              ` : `
                <div class="task-file-doc">
                  <a href="/uploads/${f.plik}" target="_blank">📄 ${f.nazwa||f.plik}</a>
                  <button type="button" class="td2-del" onclick="deleteTaskFile(${f.id},${taskId})">×</button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- History -->
          ${task.historia?.length ? `
          <div class="td2-card">
            <h4 class="td2-card-title">${t('historia_zadania')}</h4>
            <div class="td2-history">
              ${task.historia.map(h => `
                <div class="td2-history-item">
                  <span class="td2-history-meta">${h.uzytkownik_imie||'System'} · ${new Date(h.created_at).toLocaleString()}</span>
                  <span class="td2-history-text">${h.opis}</span>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Comments -->
          <div class="td2-card">
            <h4 class="td2-card-title">💬 ${t('komentarze')} <span class="td2-count">${task.komentarze?.length||0}</span></h4>
            ${(task.komentarze||[]).map(c => `
              <div class="td2-comment">
                <div class="td2-comment-avatar" style="background:${c.autor_kolor||'#999'}">${(c.autor_imie||'?')[0]}</div>
                <div class="td2-comment-body">
                  <span class="td2-comment-meta">${c.autor_imie||'—'} · ${new Date(c.created_at).toLocaleString()}</span>
                  <p class="td2-comment-text">${c.tresc}</p>
                </div>
              </div>
            `).join('')}
            <div class="td2-comment-form">
              <input type="text" id="td-comment-input" class="td2-input" placeholder="${t('dodaj_komentarz')}" onkeydown="if(event.key==='Enter'){event.preventDefault();addTaskComment(${taskId})}">
              <button type="button" class="td2-add-btn" onclick="addTaskComment(${taskId})">→</button>
            </div>
          </div>
        </div>

        <!-- RIGHT: sidebar -->
        <div class="td2-sidebar">

          <!-- Details card -->
          <div class="td2-card">
            <h4 class="td2-card-title">${t('opis')}</h4>
            <dl class="td2-details">
              <div class="td2-detail-row">
                <dt>${t('projekt')}</dt>
                <dd>${task.deal_id ? `<span class="td2-link" onclick="closeModal();setTimeout(()=>showDealDetail(${task.deal_id}),200)">${task.deal_nazwa}</span>` : '—'}</dd>
              </div>
              <div class="td2-detail-row">
                <dt>${t('kategoria_zadania')}</dt>
                <dd><select id="td-category" class="td2-select-sm" onchange="saveTaskDetail(${taskId})">
                  <option value="">—</option>
                  ${categories.map(c => `<option value="${c.id}" ${c.id==task.kategoria_id?'selected':''}>${c.ikona||''} ${c.nazwa}</option>`).join('')}
                </select></dd>
              </div>
              <div class="td2-detail-row">
                <dt>${t('priorytet_label')}</dt>
                <dd><select id="td-priority" class="td2-select-sm" onchange="saveTaskDetail(${taskId})">
                  <option value="niski" ${task.priorytet==='niski'?'selected':''}>⚪ ${t('p_niski')}</option>
                  <option value="normalny" ${task.priorytet==='normalny'||!task.priorytet?'selected':''}>🟢 ${t('p_normalny')}</option>
                  <option value="wysoki" ${task.priorytet==='wysoki'?'selected':''}>🟡 ${t('p_wysoki')}</option>
                  <option value="pilny" ${task.priorytet==='pilny'?'selected':''}>🔴 ${t('p_pilny')}</option>
                </select></dd>
              </div>
              <div class="td2-detail-row">
                <dt>${t('termin')}</dt>
                <dd><input type="date" id="td-deadline" value="${task.termin||''}" class="td2-select-sm" onchange="saveTaskDetail(${taskId})"></dd>
              </div>
              <div class="td2-detail-row">
                <dt>${t('czas_szac')}</dt>
                <dd><input type="number" id="td-time-est" step="0.5" value="${task.czas_szacowany||''}" class="td2-select-sm" style="width:60px" onchange="saveTaskDetail(${taskId})"> <small>${t('godzin')}</small></dd>
              </div>
              <div class="td2-detail-row">
                <dt>${t('data')}</dt>
                <dd>${new Date(task.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          <!-- Assignees card -->
          <div class="td2-card">
            <h4 class="td2-card-title">${t('przypisani')}</h4>
            ${assignees.length ? `
              <div class="td2-assignee-list">
                ${assignees.map(a => `
                  <div class="td2-assignee-row">
                    <span class="td2-avatar" style="background:${a.kolor||'#4A8EFF'}">${(a.imie||'?')[0]}</span>
                    <span class="td2-assignee-name">${a.imie}</span>
                    <button type="button" class="td2-del" onclick="removeAssignee(${taskId},${a.user_id})">×</button>
                  </div>
                `).join('')}
              </div>
            ` : `<p class="td2-empty">${t('brak')}</p>`}
            <select class="td2-select-sm td2-add-select" onchange="if(this.value){addAssignee(${taskId},this.value)}">
              <option value="">+ ${t('dodaj')}</option>
              ${team.filter(m => !assignees.some(a => a.user_id == m.id)).map(m => `<option value="${m.id}">${m.imie}</option>`).join('')}
            </select>
          </div>

          <!-- Tags card -->
          <div class="td2-card">
            <h4 class="td2-card-title">${t('tagi_label')}</h4>
            <input type="text" id="td-tags" value="${task.tagi||''}" placeholder="tag1, tag2..." class="td2-input" onblur="saveTaskDetail(${taskId})">
            ${task.tagi ? `<div class="td2-tags">${task.tagi.split(',').map(tg => tg.trim()).filter(Boolean).map(tg => `<span class="td2-tag">${tg}</span>`).join('')}</div>` : ''}
          </div>

          <!-- Time tracking card -->
          <div class="td2-card">
            <h4 class="td2-card-title">${t('czas_sped')}</h4>
            <p class="td2-time-total">${timeSpent > 0 ? timeSpent.toFixed(1) + ' ' + t('godzin') : '0 ' + t('godzin')}</p>
          </div>

          <!-- Geo card -->
          <div class="td2-card">
            <h4 class="td2-card-title">📍 ${t('lokalizacja')}</h4>
            <input class="td2-input" id="td-address" value="${task.adres||''}" placeholder="${t('adres')}..." onblur="saveTaskDetail(${taskId})">
            <div class="map-container" id="td-map" style="margin-top:6px"></div>
            <input type="hidden" id="td-lat" value="${task.lat||''}"><input type="hidden" id="td-lng" value="${task.lng||''}">
            ${task.lat && task.lng ? `<a class="td2-link" href="https://www.google.com/maps/search/?api=1&query=${task.lat},${task.lng}" target="_blank" style="font-size:11px;margin-top:4px;display:block">📍 ${t('pokaz_na_mapie')}</a>` : ''}
          </div>

          <!-- Delete -->
          <button type="button" class="td2-delete-btn" onclick="deleteTaskFromDetail(${taskId})">🗑️ ${t('usun')}</button>
        </div>
      </div>
    </div>
  `);
  loadGoogleMaps().then(ok => { if (ok) initMapPicker('td-map', 'td-address', 'td-lat', 'td-lng', task.lat || null, task.lng || null); });
}

async function saveTaskDetail(taskId) {
  await fetch(`${API}/api/zadania/${taskId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tresc: document.querySelector('.modal-title')?.textContent?.replace(/^#\d+\s/, '') || '',
      opis: document.getElementById('td-desc')?.value || null,
      przypisany_id: document.getElementById('td-assignee')?.value || null,
      termin: document.getElementById('td-deadline')?.value || null,
      adres: document.getElementById('td-address')?.value || null,
      lat: parseFloat(document.getElementById('td-lat')?.value) || null,
      lng: parseFloat(document.getElementById('td-lng')?.value) || null,
      priorytet: document.getElementById('td-priority')?.value || 'normalny',
      tagi: document.getElementById('td-tags')?.value || null,
      czas_szacowany: parseFloat(document.getElementById('td-time-est')?.value) || null,
      kategoria_id: document.getElementById('td-category')?.value || null,
    })
  });
}

async function updateTaskStatus(taskId, statusId) {
  await fetch(`${API}/api/zadania/${taskId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status_id: statusId })
  });
  showTaskDetail(taskId);
}

async function toggleTaskAndReload(taskId) {
  await fetch(`${API}/api/zadania/${taskId}/toggle`, { method: 'PUT' });
  showTaskDetail(taskId);
}
async function startTimer(taskId) {
  await fetch(`${API}/api/zadania/${taskId}/timer/start`, { method: 'PUT' });
  showTaskDetail(taskId);
}
async function stopTimer(taskId) {
  await fetch(`${API}/api/zadania/${taskId}/timer/stop`, { method: 'PUT' });
  showTaskDetail(taskId);
}

async function addSubtask(taskId) {
  const input = document.getElementById('td-new-subtask');
  if (!input?.value.trim()) return;
  await fetch(`${API}/api/zadania/${taskId}/podzadania`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tresc: input.value.trim() })
  });
  showTaskDetail(taskId);
}
async function toggleSubtask(subId, taskId) {
  await fetch(`${API}/api/podzadania/${subId}/toggle`, { method: 'PUT' });
  showTaskDetail(taskId);
}
async function deleteSubtask(subId, taskId) {
  await fetch(`${API}/api/podzadania/${subId}`, { method: 'DELETE' });
  showTaskDetail(taskId);
}

async function uploadTaskFiles(taskId) {
  const input = document.getElementById('td-file-input');
  for (const file of input.files) {
    const fd = new FormData();
    fd.append('file', file);
    await fetch(`${API}/api/zadania/${taskId}/pliki`, { method: 'POST', body: fd });
  }
  showTaskDetail(taskId);
}
async function deleteTaskFile(fileId, taskId) {
  await fetch(`${API}/api/zadania_pliki/${fileId}`, { method: 'DELETE' });
  showTaskDetail(taskId);
}

async function addTaskComment(taskId) {
  const input = document.getElementById('td-comment-input');
  if (!input?.value.trim()) return;
  const team = await getTeam();
  const autorId = team.length ? team[0].id : null;
  await fetch(`${API}/api/zadania/${taskId}/komentarze`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tresc: input.value.trim(), autor_id: autorId })
  });
  showTaskDetail(taskId);
}

async function deleteTaskFromDetail(taskId) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/zadania/${taskId}`, { method: 'DELETE' });
  closeModal();
  if (currentView === 'zadania') loadTasksView();
}

/* ===== TASKS VIEW ===== */
let tasksFilter = { assignee: '', status: 'open', status_id: '', kategoria_id: '', standalone: '' };
let tasksViewMode = localStorage.getItem('crm_tasks_view') || 'list';
let calendarMonth = new Date();
let _taskStatusesCache = null;
let _taskCategoriesCache = null;

async function getTaskStatuses() {
  if (!_taskStatusesCache) _taskStatusesCache = await fetch(`${API}/api/task-statusy`).then(r => r.json());
  return _taskStatusesCache;
}
async function getTaskCategories() {
  if (!_taskCategoriesCache) _taskCategoriesCache = await fetch(`${API}/api/task-kategorie`).then(r => r.json());
  return _taskCategoriesCache;
}

function loadTaskModule(hash) {
  const c = document.getElementById('content');
  c.innerHTML = `<iframe src="/taskmodule/index.html${hash||''}" id="taskmodule-iframe" style="width:100%;height:calc(100vh - 80px);border:none;border-radius:12px;background:#fff"></iframe>`;
}

async function loadTasksView() {
  if (!window._tasksLegacyMode) { loadTaskModule('#tasks'); return; }
  const c = document.getElementById('content');
  // legacy view (set window._tasksLegacyMode=true to restore)
  const [team, statuses, categories] = await Promise.all([getTeam(), getTaskStatuses(), getTaskCategories()]);
  const qp = new URLSearchParams();
  if (tasksFilter.assignee) qp.set('assignee', tasksFilter.assignee);
  if (tasksFilter.status) qp.set('status', tasksFilter.status);
  if (tasksFilter.status_id) qp.set('status_id', tasksFilter.status_id);
  if (tasksFilter.kategoria_id) qp.set('kategoria_id', tasksFilter.kategoria_id);
  if (tasksFilter.standalone) qp.set('standalone', '1');
  const tasks = await fetch(`${API}/api/zadania?${qp}`).then(r => r.json());

  const today = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(z => z.termin && !z.wykonane && z.termin < today).length;

  c.innerHTML = `
    <div class="team-manage">
      <span class="form-label" style="margin:0">${t('zespol')} (Telegram bot):</span>
      ${team.length ? team.map(m => `
        <span class="team-chip" style="background:${m.kolor||'#4A8EFF'}">
          ${m.imie}
          <span class="role-badge-sm ${getRoleBadgeClass(m.rola)}">${getRoleLabel(m.rola)}</span>
          ${canEdit() ? `<input type="color" value="${m.kolor||'#4A8EFF'}" style="width:14px;height:14px;border:none;padding:0;cursor:pointer;vertical-align:middle" onchange="updateMemberColor(${m.id},this.value)">` : ''}
          ${canManageUsers() ? `<select class="role-select" onchange="updateMemberRole(${m.id},this.value)" style="font-size:11px;padding:1px 2px;margin-left:2px">
            <option value="wykonawca" ${m.rola==='wykonawca'?'selected':''}>${t('rola_wykonawca')}</option>
            <option value="wlasciciel" ${m.rola==='wlasciciel'?'selected':''}>${t('rola_wlasciciel')}</option>
            <option value="admin" ${m.rola==='admin'?'selected':''}>${t('rola_admin')}</option>
          </select>` : ''}
        </span>
      `).join('') : '<span style="font-size:12px;color:var(--text-muted)">Надішліть /start у @Mrowkicoloringbot</span>'}
    </div>

    <div class="tasks-toolbar">
      <div class="tasks-toolbar-row">
        <button class="tasks-filter-btn ${tasksFilter.status===''&&!tasksFilter.status_id?'active':''}" onclick="setTaskFilter('status','');setTaskFilter('status_id','')">${t('wszystkie')}</button>
        <button class="tasks-filter-btn ${tasksFilter.status==='open'?'active':''}" onclick="setTaskFilter('status','open')">${t('otwarte')}</button>
        <button class="tasks-filter-btn ${tasksFilter.status==='done'?'active':''}" onclick="setTaskFilter('status','done')">${t('zakonczone')}</button>
        ${statuses.map(s => `<button class="tasks-filter-btn task-status-filter ${tasksFilter.status_id==s.id?'active':''}" onclick="setTaskFilter('status','');setTaskFilter('status_id','${s.id}')" style="--status-color:${s.kolor}"><span class="status-dot" style="background:${s.kolor}"></span>${s.nazwa}</button>`).join('')}
        ${overdue > 0 ? `<span style="font-size:12px;color:#e53935;margin-left:4px">⚠ ${overdue} ${t('przeterminowane').toLowerCase()}</span>` : ''}
      </div>
      <div class="tasks-toolbar-row">
        <select class="form-select tasks-select" onchange="setTaskFilter('assignee',this.value)">
          <option value="">👤 ${t('wszystkie')}</option>
          ${team.map(m => `<option value="${m.id}" ${tasksFilter.assignee==m.id?'selected':''}>${m.imie}</option>`).join('')}
        </select>
        <select class="form-select tasks-select" onchange="setTaskFilter('kategoria_id',this.value)">
          <option value="">${t('kategoria_zadania')}: ${t('wszystkie')}</option>
          ${categories.map(k => `<option value="${k.id}" ${tasksFilter.kategoria_id==k.id?'selected':''}>${k.ikona} ${k.nazwa}</option>`).join('')}
        </select>
        <label class="tasks-standalone-toggle"><input type="checkbox" ${tasksFilter.standalone?'checked':''} onchange="setTaskFilter('standalone',this.checked?'1':'')"> ${t('bez_projektu')}</label>
        <div style="flex:1"></div>
        <button class="btn-primary btn-sm" onclick="showNewTaskModal()">${t('nowe_zadanie')}</button>
        <button class="btn-sm" onclick="showTaskSettingsModal()" title="${t('ustawienia_zadan')}">⚙</button>
        <div class="tasks-view-toggle">
          <button class="tasks-view-btn ${tasksViewMode==='list'?'active':''}" onclick="setTasksViewMode('list')" title="${t('widok_lista')}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="2" rx="1" fill="currentColor"/><rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor"/><rect x="1" y="12" width="14" height="2" rx="1" fill="currentColor"/></svg>
          </button>
          <button class="tasks-view-btn ${tasksViewMode==='week'?'active':''}" onclick="setTasksViewMode('week')" title="${t('widok_tydzien')}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="1" y1="5" x2="15" y2="5" stroke="currentColor" stroke-width="1.5"/><line x1="5.5" y1="5" x2="5.5" y2="15" stroke="currentColor" stroke-width="1"/><line x1="10.5" y1="5" x2="10.5" y2="15" stroke="currentColor" stroke-width="1"/></svg>
          </button>
        </div>
      </div>
    </div>

    ${tasksViewMode === 'week' ? renderTasksWeekView(tasks, team, today) : `
    <div class="tasks-table-wrap">
      ${tasks.length ? `
      <table class="tasks-table">
        <thead>
          <tr>
            <th>${t('zadania')}</th>
            <th>${t('status_zadania')}</th>
            <th>${t('priorytet_label')}</th>
            <th>${t('projekt')}</th>
            <th>${t('przypisani')}</th>
            <th>${t('termin')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(z => {
            const isOverdue = z.termin && !z.wykonane && z.termin < today;
            const isToday = z.termin === today;
            const priColors = { niski:'#9e9e9e', normalny:'#4caf50', wysoki:'#ff9800', pilny:'#e53935' };
            const priLabels = { niski:t('p_niski'), normalny:t('p_normalny'), wysoki:t('p_wysoki'), pilny:t('p_pilny') };
            const pColor = priColors[z.priorytet] || priColors.normalny;
            const pLabel = priLabels[z.priorytet] || priLabels.normalny;
            return `
            <tr class="tasks-row ${z.wykonane ? 'done' : ''} ${isOverdue ? 'overdue' : ''}" onclick="showTaskDetail(${z.id})">
              <td class="tasks-td-title">
                <span class="tasks-title-text">${z.tresc}</span>
                ${z.kategoria_nazwa ? `<span class="task-category-tag-sm" style="--cat-color:${z.kategoria_kolor}">${z.kategoria_ikona||''} ${z.kategoria_nazwa}</span>` : ''}
              </td>
              <td>
                ${z.status_nazwa ? `<span class="task-badge" style="--badge-color:${z.status_kolor}">${z.status_ikona||''} ${z.status_nazwa}</span>` : '—'}
              </td>
              <td>
                <span class="task-badge" style="--badge-color:${pColor}">${pLabel}</span>
              </td>
              <td class="tasks-td-project">
                ${z.deal_nazwa ? `<span class="tasks-project-dot" style="background:var(--accent)"></span><span class="tasks-project-name" onclick="event.stopPropagation();navToDeal(${z.transakcja_id})">${z.deal_nazwa}</span>` : `<span style="color:var(--text-muted);font-size:12px">—</span>`}
              </td>
              <td>
                <div class="tasks-avatars">
                  ${z.przypisany_imie ? `<span class="tasks-avatar" style="--av-color:${z.przypisany_kolor||'#4A8EFF'}" title="${z.przypisany_imie}">${z.przypisany_imie[0]}</span>` : '<span style="color:var(--text-muted);font-size:12px">—</span>'}
                </div>
              </td>
              <td class="tasks-td-deadline ${isOverdue ? 'overdue' : isToday ? 'today' : ''}">
                ${z.termin ? (isToday ? t('dzisiaj') : new Date(z.termin).toLocaleDateString()) : '—'}
              </td>
              <td class="tasks-td-actions">
                <button type="button" class="tasks-del-btn" onclick="event.stopPropagation();deleteTaskGlobal(${z.id})" title="${t('usun')}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                </button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      ` : `<div class="empty-state">${t('brak_zadan')}</div>`}
    </div>
    `}
  `;
}

function setTaskFilter(key, val) {
  tasksFilter[key] = val;
  loadTasksView();
}

function setTasksViewMode(mode) {
  tasksViewMode = mode;
  localStorage.setItem('crm_tasks_view', mode);
  loadTasksView();
}

let weekOffset = 0;
function navigateWeek(dir) {
  weekOffset += dir;
  loadTasksView();
}

function getWeekDays(offset) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + (offset * 7));
  monday.setHours(0,0,0,0);
  const days = [];
  const dayKeys = ['pn','wt','sr','cz','pt','sb','nd'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d,
      iso: d.toISOString().split('T')[0],
      label: t(dayKeys[i]),
      dayNum: d.getDate(),
      monthNum: d.getMonth() + 1
    });
  }
  return days;
}

/* ===== TASKS KANBAN VIEW ===== */
let dragTaskId = null;
async function loadTasksKanbanView() {
  const c = document.getElementById('content');
  try {
    const [tasks, statuses, team] = await Promise.all([
      fetch(`${API}/api/zadania`).then(r => r.json()),
      fetch(`${API}/api/task-statusy`).then(r => r.json()),
      fetch(`${API}/api/users`).then(r => r.json())
    ]);

    // Group tasks by status_id
    const grouped = {};
    const noStatus = [];
    statuses.forEach(s => grouped[s.id] = []);
    tasks.forEach(task => {
      if (task.status_id && grouped[task.status_id]) {
        grouped[task.status_id].push(task);
      } else {
        noStatus.push(task);
      }
    });

    const today = new Date().toISOString().slice(0, 10);

    c.innerHTML = `
      <div class="kanban-board">
        ${noStatus.length ? `
          <div class="kanban-column" data-status-id="0"
               ondragover="event.preventDefault();this.classList.add('drag-over')"
               ondragleave="this.classList.remove('drag-over')"
               ondrop="handleTaskDrop(event, 0)">
            <div class="kanban-col-header">
              <span class="kanban-col-title">📋 ${t('bez_statusu') || 'Bez statusu'}</span>
              <span class="kanban-col-count">${noStatus.length}</span>
            </div>
            <div class="kanban-col-body">
              ${noStatus.map(task => taskKanbanCard(task, today)).join('')}
            </div>
          </div>
        ` : ''}
        ${statuses.map(status => {
          const statusTasks = grouped[status.id] || [];
          return `
            <div class="kanban-column" data-status-id="${status.id}"
                 ondragover="event.preventDefault();this.classList.add('drag-over')"
                 ondragleave="this.classList.remove('drag-over')"
                 ondrop="handleTaskDrop(event, ${status.id})">
              <div class="kanban-col-header">
                <span class="kanban-col-title">${status.ikona || '●'} ${status.nazwa}</span>
                <span class="kanban-col-count">${statusTasks.length}</span>
              </div>
              <div class="kanban-col-body">
                ${statusTasks.map(task => taskKanbanCard(task, today)).join('')}
                <button class="kanban-add-btn" onclick="showNewTaskModal(null, ${status.id})">+ ${t('dodaj')}</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">' + t('blad') + '</div>'; }
}

function taskKanbanCard(task, today) {
  const isOverdue = task.termin && task.termin < today && !task.wykonane;
  const isToday = task.termin === today;
  const prioColor = task.priorytet === 'wysoki' ? '#e53935' : task.priorytet === 'krytyczny' ? '#9c27b0' : task.priorytet === 'niski' ? '#4caf50' : '#4A8EFF';
  const assignee = task.przypisany_imie || '';
  const initials = assignee.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const subtasksDone = task.podzadania_done || 0;
  const subtasksTotal = task.podzadania_total || 0;

  return `
    <div class="deal-card task-kanban-card ${task.wykonane ? 'task-done' : ''}" draggable="true" data-task-id="${task.id}"
         ondragstart="dragTaskId=${task.id};this.classList.add('dragging')"
         ondragend="this.classList.remove('dragging')"
         onclick="showTaskDetail(${task.id})">
      <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:${prioColor};border-radius:4px 0 0 4px"></div>
      <div class="deal-card-title" style="padding-left:8px;${task.wykonane ? 'text-decoration:line-through;opacity:0.6' : ''}">${task.tresc}</div>
      <div class="deal-card-meta" style="padding-left:8px">
        ${task.kategoria_nazwa ? `<span class="deal-tag" style="background:${task.kategoria_kolor || '#eee'};color:#fff">${task.kategoria_nazwa}</span>` : ''}
        ${task.termin ? `<span class="deal-tag ${isOverdue ? 'deal-tag-overdue' : isToday ? 'deal-tag-today' : ''}">${isOverdue ? '⚠️' : isToday ? '📅' : '🗓️'} ${task.termin}</span>` : ''}
        ${assignee ? `<span class="task-assignee-dot" title="${assignee}">${initials}</span>` : ''}
        ${subtasksTotal > 0 ? `<span class="deal-tag" style="background:#f0f0f0;color:#555">✅ ${subtasksDone}/${subtasksTotal}</span>` : ''}
      </div>
    </div>
  `;
}

async function handleTaskDrop(event, newStatusId) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  if (!dragTaskId) return;
  await fetch(`${API}/api/zadania/${dragTaskId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status_id: newStatusId || null })
  });
  dragTaskId = null;
  loadTasksKanbanView();
}

/* ===== MY TASKS VIEW ===== */
async function loadMyTasksView() {
  const c = document.getElementById('content');
  const userId = currentUser?.id;
  try {
    const tasks = await fetch(`${API}/api/zadania?assignee=${userId || ''}`).then(r => r.json());
    const today = new Date().toISOString().slice(0, 10);

    const total = tasks.length;
    const inProgress = tasks.filter(t => !t.wykonane).length;
    const overdue = tasks.filter(t => t.termin && t.termin < today && !t.wykonane).length;
    const dueToday = tasks.filter(t => t.termin === today && !t.wykonane).length;
    const done = tasks.filter(t => t.wykonane).length;

    c.innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card"><div class="stat-card-label">${t('wszystkie') || 'Wszystkie'}</div><div class="stat-card-value primary">${total}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('otwarte') || 'W toku'}</div><div class="stat-card-value accent">${inProgress}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('przeterminowane') || 'Przeterminowane'}</div><div class="stat-card-value" style="color:#e53935">${overdue}</div></div>
        <div class="stat-card"><div class="stat-card-label">${t('dzisiaj') || 'Dziś'}</div><div class="stat-card-value success">${dueToday}</div></div>
      </div>
      <div class="table-wrapper">
        <div class="table-header"><span class="table-title">${t('moje_zadania') || 'Moje zadania'} (${total})</span></div>
        ${tasks.length ? `<table><thead><tr>
          <th style="width:30px"></th>
          <th>${t('nazwa') || 'Zadanie'}</th>
          <th>${t('priorytet_label') || 'Priorytet'}</th>
          <th>${t('kategoria_zadania') || 'Kategoria'}</th>
          <th>${t('termin') || 'Termin'}</th>
          <th>${t('status_zadania') || 'Status'}</th>
        </tr></thead><tbody>
          ${tasks.map(task => {
            const isOverdue = task.termin && task.termin < today && !task.wykonane;
            const isToday = task.termin === today;
            const prioMap = {krytyczny:'🔴',wysoki:'🟠',normalny:'🔵',niski:'🟢'};
            return `<tr style="cursor:pointer;${task.wykonane ? 'opacity:0.5' : ''}" onclick="showTaskDetail(${task.id})">
              <td><input type="checkbox" ${task.wykonane ? 'checked' : ''} onclick="event.stopPropagation();toggleTaskDone(${task.id})" style="cursor:pointer"></td>
              <td><strong>${task.tresc}</strong>${task.deal_nazwa ? `<br><small style="color:var(--text-muted)">📎 ${task.deal_nazwa}</small>` : ''}</td>
              <td>${prioMap[task.priorytet] || '🔵'} ${task.priorytet || 'normalny'}</td>
              <td>${task.kategoria_nazwa ? `<span style="background:${task.kategoria_kolor || '#eee'};color:#fff;padding:2px 8px;border-radius:10px;font-size:0.75em">${task.kategoria_nazwa}</span>` : '—'}</td>
              <td class="${isOverdue ? 'task-deadline overdue' : isToday ? 'task-deadline today' : ''}">${task.termin || '—'}</td>
              <td>${task.status_nazwa ? `<span class="task-status-badge" style="background:${task.status_kolor || '#999'}">${task.status_ikona || '●'} ${task.status_nazwa}</span>` : '—'}</td>
            </tr>`;
          }).join('')}
        </tbody></table>` : `<div class="empty-state">${t('brak_zadan') || 'Brak zadań'}</div>`}
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">' + t('blad') + '</div>'; }
}

async function toggleTaskDone(id) {
  await fetch(`${API}/api/zadania/${id}/toggle`, { method: 'PUT' });
  loadView(currentView);
}

function renderTasksWeekView(tasks, team, today) {
  const days = getWeekDays(weekOffset);
  const firstDay = days[0];
  const lastDay = days[6];
  const monthNames = {
    pl: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
    ua: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
  };
  const months = monthNames[currentLang] || monthNames.pl;
  const headerMonth = firstDay.date.getMonth() === lastDay.date.getMonth()
    ? `${months[firstDay.date.getMonth()]} ${firstDay.date.getFullYear()}`
    : `${months[firstDay.date.getMonth()]} — ${months[lastDay.date.getMonth()]} ${lastDay.date.getFullYear()}`;

  // Group tasks by date
  const tasksByDate = {};
  const noDate = [];
  tasks.forEach(z => {
    if (z.termin) {
      if (!tasksByDate[z.termin]) tasksByDate[z.termin] = [];
      tasksByDate[z.termin].push(z);
    } else {
      noDate.push(z);
    }
  });

  const renderCard = (z) => {
    const isOverdue = z.termin && !z.wykonane && z.termin < today;
    return `<div class="cal-task-card ${z.wykonane ? 'done' : ''} ${isOverdue ? 'overdue' : ''}" onclick="showTaskDetail(${z.id})">
      <div class="cal-task-top">
        <input type="checkbox" ${z.wykonane ? 'checked' : ''} onclick="event.stopPropagation();toggleTaskGlobal(${z.id})">
        <span class="cal-task-title">${z.tresc}</span>
      </div>
      ${z.deal_nazwa ? `<span class="cal-task-deal" onclick="event.stopPropagation();navToDeal(${z.transakcja_id})">${z.deal_nazwa}</span>` : ''}
      ${z.przypisany_imie ? `<span class="cal-task-assignee" style="background:${z.przypisany_kolor||'#4A8EFF'}22;color:${z.przypisany_kolor||'#4A8EFF'}">${z.przypisany_imie}</span>` : ''}
    </div>`;
  };

  return `
    <div class="cal-week-nav">
      <button class="btn-sm" onclick="navigateWeek(-1)">←</button>
      <span class="cal-week-title">${headerMonth}</span>
      ${weekOffset !== 0 ? `<button class="btn-sm" onclick="weekOffset=0;loadTasksView()" style="font-size:11px">${t('dzisiaj')}</button>` : ''}
      <button class="btn-sm" onclick="navigateWeek(1)">→</button>
    </div>
    <div class="cal-week-grid">
      ${days.map(d => {
        const isToday = d.iso === today;
        const dayTasks = tasksByDate[d.iso] || [];
        return `<div class="cal-day-column ${isToday ? 'today' : ''}">
          <div class="cal-day-header ${isToday ? 'today' : ''}">
            <span class="cal-day-name">${d.label}</span>
            <span class="cal-day-num ${isToday ? 'today' : ''}">${d.dayNum}.${String(d.monthNum).padStart(2,'0')}</span>
          </div>
          <div class="cal-day-body">
            ${dayTasks.map(renderCard).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    ${noDate.length ? `
      <div class="cal-no-date">
        <div class="cal-no-date-header">${t('bez_terminu')} (${noDate.length})</div>
        <div class="cal-no-date-list">
          ${noDate.map(renderCard).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

async function toggleTaskGlobal(taskId) {
  await fetch(`${API}/api/zadania/${taskId}/toggle`, { method: 'PUT' });
  loadTasksView();
}

async function deleteTaskGlobal(taskId) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/zadania/${taskId}`, { method: 'DELETE' });
  loadTasksView();
}

function navToDeal(dealId) {
  showDealDetail(dealId);
}

async function updateMemberColor(id, color) {
  await fetch(`${API}/api/zespol/${id}/kolor`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kolor: color })
  });
  teamCache = null;
  await getTeam();
}

async function updateMemberRole(id, rola) {
  await fetch(`${API}/api/users/${id}/rola`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rola })
  });
  teamCache = null;
  await getTeam();
  loadTasksView();
}

/* ===== NEW TASK MODAL ===== */
async function showNewTaskModal() {
  const [team, statuses, categories, templates, deals] = await Promise.all([
    getTeam(), getTaskStatuses(), getTaskCategories(),
    fetch(`${API}/api/task-szablony`).then(r => r.json()),
    fetch(`${API}/api/transakcje`).then(r => r.json())
  ]);
  const defaultStatus = statuses.find(s => s.domyslny) || statuses[0];
  openModal(t('nowe_zadanie'), `
    <form onsubmit="event.preventDefault();createNewTask()">
      ${templates.length ? `<div class="form-group">
        <label class="form-label">${t('z_szablonu')}</label>
        <select id="nt-template" class="form-select" onchange="applyTaskTemplate(this.value)">
          <option value="">— ${t('szablon')} —</option>
          ${templates.map(tmpl => `<option value="${tmpl.id}">${tmpl.nazwa}</option>`).join('')}
        </select>
      </div>` : ''}
      <div class="form-group"><label class="form-label">${t('zadania_all')}</label><input type="text" id="nt-tresc" class="form-input" required placeholder="${t('nowe_zadanie')}..."></div>
      <div class="form-group"><label class="form-label">${t('opis_zadania')}</label><textarea id="nt-opis" class="form-input" rows="2"></textarea></div>
      <div class="form-row">
        <div class="form-group" style="flex:1"><label class="form-label">${t('status_zadania')}</label><select id="nt-status" class="form-select">${statuses.map(s => `<option value="${s.id}" ${s.id===defaultStatus?.id?'selected':''}>${s.ikona} ${s.nazwa}</option>`).join('')}</select></div>
        <div class="form-group" style="flex:1"><label class="form-label">${t('kategoria_zadania')}</label><select id="nt-kategoria" class="form-select"><option value="">—</option>${categories.map(k => `<option value="${k.id}">${k.ikona} ${k.nazwa}</option>`).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex:1"><label class="form-label">${t('przypisany')}</label><select id="nt-assignee" class="form-select"><option value="">—</option>${team.map(m => `<option value="${m.id}">${m.imie}</option>`).join('')}</select></div>
        <div class="form-group" style="flex:1"><label class="form-label">${t('priorytet_label')}</label><select id="nt-priority" class="form-select"><option value="niski">⚪ ${t('p_niski')}</option><option value="normalny" selected>🟢 ${t('p_normalny')}</option><option value="wysoki">🟡 ${t('p_wysoki')}</option><option value="pilny">🔴 ${t('p_pilny')}</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex:1"><label class="form-label">${t('termin')}</label><input type="date" id="nt-termin" class="form-input"></div>
        <div class="form-group" style="flex:1"><label class="form-label">${t('projekt')}</label><select id="nt-deal" class="form-select"><option value="">${t('bez_projektu')}</option>${deals.map(d => `<option value="${d.id}">${d.nazwa}</option>`).join('')}</select></div>
      </div>
      <div class="form-actions"><button type="button" class="btn-secondary" onclick="closeModal()">${t('anuluj')}</button><button type="submit" class="btn-primary">${t('zapisz')}</button></div>
    </form>
  `);
}

async function applyTaskTemplate(templateId) {
  if (!templateId) return;
  const templates = await fetch(`${API}/api/task-szablony`).then(r => r.json());
  const tmpl = templates.find(t => t.id == templateId);
  if (!tmpl) return;
  document.getElementById('nt-tresc').value = tmpl.nazwa;
  if (tmpl.opis) document.getElementById('nt-opis').value = tmpl.opis;
  if (tmpl.kategoria_id) document.getElementById('nt-kategoria').value = tmpl.kategoria_id;
  if (tmpl.priorytet) document.getElementById('nt-priority').value = tmpl.priorytet;
}

async function createNewTask() {
  const data = {
    tresc: document.getElementById('nt-tresc').value.trim(),
    opis: document.getElementById('nt-opis').value.trim() || null,
    status_id: document.getElementById('nt-status').value || null,
    kategoria_id: document.getElementById('nt-kategoria').value || null,
    przypisany_id: document.getElementById('nt-assignee').value || null,
    priorytet: document.getElementById('nt-priority').value,
    termin: document.getElementById('nt-termin').value || null,
    transakcja_id: document.getElementById('nt-deal').value || null,
  };
  if (!data.tresc) return;
  await fetch(`${API}/api/zadania`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  closeModal();
  loadTasksView();
}

/* ===== TASK SETTINGS MODAL ===== */
async function showTaskSettingsModal() {
  const [statuses, categories, templates] = await Promise.all([getTaskStatuses(), getTaskCategories(), fetch(`${API}/api/task-szablony`).then(r => r.json())]);
  openModal(t('ustawienia_zadan'), `
    <div class="task-settings">
      <div class="task-settings-section"><h3>${t('statusy')}</h3><div id="ts-statuses">
        ${statuses.map(s => `<div class="task-setting-row"><input type="color" value="${s.kolor}" onchange="updateTaskStatusColor(${s.id},this.value)" style="width:28px;height:28px;border:none;padding:0;cursor:pointer"><input type="text" value="${s.ikona}" style="width:36px" onchange="updateTaskStatusField(${s.id},'ikona',this.value)"><input type="text" value="${s.nazwa}" style="flex:1" onchange="updateTaskStatusField(${s.id},'nazwa',this.value)"><button class="task-del" onclick="deleteTaskStatusItem(${s.id})">×</button></div>`).join('')}
        <div class="task-setting-add"><input type="text" id="ts-new-status" placeholder="${t('statusy')}..." class="form-input" style="flex:1"><input type="color" id="ts-new-status-color" value="#4A90D9" style="width:28px;height:28px;border:none;padding:0;cursor:pointer"><button class="btn-sm" onclick="addNewTaskStatus()">+</button></div>
      </div></div>
      <div class="task-settings-section"><h3>${t('kategorie')}</h3><div id="ts-categories">
        ${categories.map(k => `<div class="task-setting-row"><input type="color" value="${k.kolor}" onchange="updateTaskCategoryColor(${k.id},this.value)" style="width:28px;height:28px;border:none;padding:0;cursor:pointer"><input type="text" value="${k.ikona}" style="width:36px" onchange="updateTaskCategoryField(${k.id},'ikona',this.value)"><input type="text" value="${k.nazwa}" style="flex:1" onchange="updateTaskCategoryField(${k.id},'nazwa',this.value)"><button class="task-del" onclick="deleteTaskCategoryItem(${k.id})">×</button></div>`).join('')}
        <div class="task-setting-add"><input type="text" id="ts-new-cat" placeholder="${t('kategorie')}..." class="form-input" style="flex:1"><input type="color" id="ts-new-cat-color" value="#3498DB" style="width:28px;height:28px;border:none;padding:0;cursor:pointer"><button class="btn-sm" onclick="addNewTaskCategory()">+</button></div>
      </div></div>
      <div class="task-settings-section"><h3>${t('szablony')}</h3><div id="ts-templates">
        ${templates.map(tmpl => `<div class="task-setting-row"><span style="flex:1">${tmpl.nazwa} ${tmpl.kategoria_nazwa ? `<span class="task-category-tag" style="background:${tmpl.kategoria_kolor}18;color:${tmpl.kategoria_kolor}">${tmpl.kategoria_nazwa}</span>` : ''}</span><button class="task-del" onclick="deleteTaskTemplateItem(${tmpl.id})">×</button></div>`).join('')}
        <button class="btn-sm" onclick="closeModal();showNewTemplateModal()" style="margin-top:6px">${t('nowy_szablon')}</button>
      </div></div>
    </div>
  `);
}

async function addNewTaskStatus() {
  const name = document.getElementById('ts-new-status').value.trim();
  const color = document.getElementById('ts-new-status-color').value;
  if (!name) return;
  await fetch(`${API}/api/task-statusy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nazwa:name, kolor:color}) });
  _taskStatusesCache = null; showTaskSettingsModal();
}
async function updateTaskStatusColor(id, color) {
  const statuses = await getTaskStatuses(); const s = statuses.find(x => x.id === id);
  if (s) await fetch(`${API}/api/task-statusy/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...s, kolor:color}) });
  _taskStatusesCache = null;
}
async function updateTaskStatusField(id, field, value) {
  const statuses = await getTaskStatuses(); const s = statuses.find(x => x.id === id);
  if (s) { s[field] = value; await fetch(`${API}/api/task-statusy/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(s) }); }
  _taskStatusesCache = null;
}
async function deleteTaskStatusItem(id) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/task-statusy/${id}`, { method:'DELETE' }); _taskStatusesCache = null; showTaskSettingsModal();
}
async function addNewTaskCategory() {
  const name = document.getElementById('ts-new-cat').value.trim();
  const color = document.getElementById('ts-new-cat-color').value;
  if (!name) return;
  await fetch(`${API}/api/task-kategorie`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nazwa:name, kolor:color}) });
  _taskCategoriesCache = null; showTaskSettingsModal();
}
async function updateTaskCategoryColor(id, color) {
  const cats = await getTaskCategories(); const c = cats.find(x => x.id === id);
  if (c) await fetch(`${API}/api/task-kategorie/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...c, kolor:color}) });
  _taskCategoriesCache = null;
}
async function updateTaskCategoryField(id, field, value) {
  const cats = await getTaskCategories(); const c = cats.find(x => x.id === id);
  if (c) { c[field] = value; await fetch(`${API}/api/task-kategorie/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(c) }); }
  _taskCategoriesCache = null;
}
async function deleteTaskCategoryItem(id) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/task-kategorie/${id}`, { method:'DELETE' }); _taskCategoriesCache = null; showTaskSettingsModal();
}
async function deleteTaskTemplateItem(id) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/task-szablony/${id}`, { method:'DELETE' }); showTaskSettingsModal();
}

async function showNewTemplateModal() {
  const categories = await getTaskCategories();
  openModal(t('nowy_szablon'), `
    <form onsubmit="event.preventDefault();createNewTemplate()">
      <div class="form-group"><label class="form-label">${t('nazwa')}</label><input type="text" id="tmpl-name" class="form-input" required></div>
      <div class="form-group"><label class="form-label">${t('opis_zadania')}</label><textarea id="tmpl-desc" class="form-input" rows="2"></textarea></div>
      <div class="form-row">
        <div class="form-group" style="flex:1"><label class="form-label">${t('kategoria_zadania')}</label><select id="tmpl-cat" class="form-select"><option value="">—</option>${categories.map(k => `<option value="${k.id}">${k.ikona} ${k.nazwa}</option>`).join('')}</select></div>
        <div class="form-group" style="flex:1"><label class="form-label">${t('priorytet_label')}</label><select id="tmpl-priority" class="form-select"><option value="niski">⚪ ${t('p_niski')}</option><option value="normalny" selected>🟢 ${t('p_normalny')}</option><option value="wysoki">🟡 ${t('p_wysoki')}</option><option value="pilny">🔴 ${t('p_pilny')}</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">${t('podzadania')}</label><textarea id="tmpl-subs" class="form-input" rows="4" placeholder="Subtask 1\nSubtask 2\nSubtask 3"></textarea></div>
      <div class="form-actions"><button type="button" class="btn-secondary" onclick="closeModal()">${t('anuluj')}</button><button type="submit" class="btn-primary">${t('zapisz')}</button></div>
    </form>
  `);
}

async function createNewTemplate() {
  const subs = document.getElementById('tmpl-subs').value.split('\n').map(s => s.trim()).filter(Boolean);
  await fetch(`${API}/api/task-szablony`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nazwa: document.getElementById('tmpl-name').value.trim(), opis: document.getElementById('tmpl-desc').value.trim() || null,
      kategoria_id: document.getElementById('tmpl-cat').value || null, priorytet: document.getElementById('tmpl-priority').value, podzadania_json: JSON.stringify(subs) })
  });
  closeModal();
}

/* ===== TASK ASSIGNEES ===== */
async function addAssignee(taskId, userId) {
  if (!userId) return;
  await fetch(`${API}/api/zadania/${taskId}/przypisani`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId }) });
  showTaskDetail(taskId);
}
async function removeAssignee(taskId, userId) {
  await fetch(`${API}/api/zadania/${taskId}/przypisani/${userId}`, { method: 'DELETE' }); showTaskDetail(taskId);
}

/* ===== TASK RELATIONS ===== */
let _relSearchTimeout = null;
async function searchRelationTasks(query, taskId) {
  clearTimeout(_relSearchTimeout);
  const container = document.getElementById('td-rel-dropdown');
  if (!container) return;
  if (query.length < 2) { container.innerHTML = ''; container.classList.remove('visible'); return; }
  _relSearchTimeout = setTimeout(async () => {
    const results = await fetch(`${API}/api/zadania-search?q=${encodeURIComponent(query)}`).then(r => r.json());
    container.innerHTML = results.filter(r => r.id !== taskId).map(r => `
      <div class="td-rel-option ${r.wykonane?'done':''}" onclick="addRelation(${taskId},${r.id})">#${r.id} ${r.tresc}</div>
    `).join('') || '<div class="td-rel-option" style="color:var(--text-muted)">—</div>';
    container.classList.add('visible');
  }, 300);
}
async function addRelation(taskId, relatedId) {
  const typ = document.getElementById('td-rel-type')?.value || 'related';
  await fetch(`${API}/api/zadania/${taskId}/relacje`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ powiazane_id: relatedId, typ }) });
  showTaskDetail(taskId);
}
async function deleteRelation(relId, taskId) {
  await fetch(`${API}/api/task-relacje/${relId}`, { method: 'DELETE' }); showTaskDetail(taskId);
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
              <div class="photo-card-badge">${getCat(item.kategoria)}</div>
              ${!item.widoczny ? `<div class="photo-card-hidden-label">${t('ukryte')}</div>` : ''}
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
        `}).join('') : '<div class="empty-state">' + t('brak_zdjec') + '</div>'}
      </div>
    `;
  } catch(e) { c.innerHTML = '<div class="empty-state">' + t('blad') + '</div>'; }
}

function editPhotoCategory(id, tytul, opis, kategoria, widoczny) {
  const catOpts = Object.entries(CATEGORIES_I18N).map(([k,v]) => `<option value="${k}" ${k===kategoria?'selected':''}>${tName(v)}</option>`).join('');
  openModal(t('edytuj_realizacje'), `
    <form onsubmit="submitPhotoEdit(event, ${id}, ${widoczny})">
      <div class="form-group"><label class="form-label">${t('tytul')}</label><input class="form-input" id="ep-title" required value="${tytul}"></div>
      <div class="form-group"><label class="form-label">${t('opis')}</label><textarea class="form-textarea" id="ep-desc">${opis}</textarea></div>
      <div class="form-group"><label class="form-label">${t('kategoria')}</label><select class="form-select" id="ep-cat">${catOpts}</select></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('zapisz')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/realizacje/${id}`, { method: 'DELETE' });
  loadView('realizacje');
}

function showUploadPhotoForm() {
  const catOpts = Object.entries(CATEGORIES_I18N).map(([k,v]) => `<option value="${k}">${tName(v)}</option>`).join('');
  openModal(t('dodaj_zdjecie'), `
    <form id="upload-form" onsubmit="submitPhoto(event)">
      <div class="form-group">
        <label class="form-label">${t('zdjecie')} *</label>
        <div class="upload-drop-zone" id="drop-zone">
          <input type="file" id="f-photo" accept="image/*" required style="display:none">
          <div class="drop-zone-content" id="drop-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--accent)"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>${t('kliknij_przeciagnij')}</span>
          </div>
          <img id="drop-preview" style="display:none;max-width:100%;max-height:200px;border-radius:4px;">
        </div>
      </div>
      <div class="form-group"><label class="form-label">${t('tytul')} *</label><input class="form-input" id="f-title" required></div>
      <div class="form-group"><label class="form-label">${t('opis')}</label><textarea class="form-textarea" id="f-desc"></textarea></div>
      <div class="form-group"><label class="form-label">${t('kategoria')}</label><select class="form-select" id="f-cat">${catOpts}</select></div>
      <div class="form-actions"><button type="submit" class="btn-submit" id="upload-btn">Dodaj</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
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

/* ===== MATERIALS / ZBIOR SECTION ===== */

function renderParsedItems(invoiceId, items, dealId) {
  if (!items || !items.length) return '<div class="empty-state" style="padding:6px 0;font-size:0.8rem">—</div>';
  let total = 0;
  const rows = items.map((it, i) => {
    const sum = (it.cena || 0) * (it.ilosc || 1);
    total += sum;
    return `<div class="parsed-item">
      <span class="parsed-name">${it.nazwa}</span>
      <span class="parsed-qty">${it.ilosc || 1} ${it.jednostka || 'szt'}</span>
      <span class="parsed-price">${(it.cena || 0).toFixed(2)} zł</span>
      <span class="parsed-sum">${sum.toFixed(2)} zł</span>
    </div>`;
  }).join('');
  return `
    <div class="parsed-items-list">${rows}</div>
    <div class="parsed-total"><strong>${t('razem')}:</strong> ${total.toFixed(2)} zł</div>
    <button type="button" class="btn-sm btn-accent" onclick="applyInvoiceItems(${invoiceId},${dealId})">✅ ${t('dodaj_do_magazynu')}</button>
  `;
}

async function showPickFromStock(dealId) {
  const stock = await fetch(`${API}/api/magazyn`).then(r => r.json());
  const available = stock.filter(s => s.ilosc > 0);
  if (!available.length) { alert(t('magazyn_pusty')); return; }

  const rows = available.map(s => `
    <div class="stock-pick-row" id="spr-${s.id}">
      <div class="stock-pick-info">
        <strong>${s.nazwa}</strong>
        <small>${t('dostepne')}: ${s.ilosc} ${s.jednostka}</small>
      </div>
      <input type="number" class="form-input stock-pick-qty" id="spq-${s.id}" min="0.01" max="${s.ilosc}" step="0.01" placeholder="${t('ilosc')}" style="width:80px">
      <button type="button" class="btn-sm" onclick="pickStockItem(${dealId},${s.id},'${s.jednostka}')">${t('pobierz')}</button>
    </div>
  `).join('');

  openModal(`📥 ${t('wybierz_ze_skladu')}`, `
    <div class="stock-pick-list">${rows}</div>
    <div class="form-actions"><button type="button" class="btn-cancel" onclick="closeModal()">${t('zamknij')}</button></div>
  `);
}

async function pickStockItem(dealId, stockId, unit) {
  const input = document.getElementById(`spq-${stockId}`);
  const qty = parseFloat(input?.value);
  if (!qty || qty <= 0) return;
  await fetch(`${API}/api/transakcje/${dealId}/zuzycie`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ magazyn_id: stockId, ilosc: qty })
  });
  const row = document.getElementById(`spr-${stockId}`);
  if (row) { row.style.opacity = '0.4'; row.querySelector('button').disabled = true; row.querySelector('button').textContent = '✅'; }
}

async function showPurchaseForDeal(dealId) {
  const stock = await fetch(`${API}/api/magazyn`).then(r => r.json());
  const stockOpts = stock.map(s => `<option value="${s.id}">${s.nazwa} (${s.ilosc} ${s.jednostka})</option>`).join('');

  openModal(`🛒 ${t('zakup_nowy')}`, `
    <div style="margin-bottom:12px">
      <label class="form-label">${t('dodaj_material')}</label>
      <div class="purchase-tabs">
        <button type="button" class="btn-sm purchase-tab active" onclick="switchPurchaseTab('existing',this)">${t('wybierz_ze_skladu')}</button>
        <button type="button" class="btn-sm purchase-tab" onclick="switchPurchaseTab('new',this)">+ ${t('nowa_pozycja')}</button>
      </div>
    </div>

    <div id="purchase-existing">
      <div class="form-group"><label class="form-label">${t('nazwa')}</label><select class="form-select" id="pz-stock">${stockOpts}</select></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('ilosc')}</label><input class="form-input" id="pz-qty" type="number" step="0.01" min="0.01" value="1"></div>
        <div class="form-group"><label class="form-label">${t('cena')}</label><input class="form-input" id="pz-price" type="number" step="0.01" min="0" placeholder="0.00"></div>
      </div>
    </div>

    <div id="purchase-new" style="display:none">
      <div class="form-group"><label class="form-label">${t('nazwa')}</label><input class="form-input" id="pn-name" placeholder="${t('nazwa')}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('ilosc')}</label><input class="form-input" id="pn-qty" type="number" step="0.01" min="0.01" value="1"></div>
        <div class="form-group"><label class="form-label">${t('jednostka')}</label><input class="form-input" id="pn-unit" value="szt" placeholder="szt/kg/l"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('cena')}</label><input class="form-input" id="pn-price" type="number" step="0.01" placeholder="0.00"></div>
        <div class="form-group"><label class="form-label">${t('kategoria')}</label>
          <select class="form-select" id="pn-cat">
            <option value="material">Material</option>
            <option value="farba">Farba</option>
            <option value="grunt">Grunt</option>
            <option value="narzedzie">Narzędzie</option>
            <option value="chemia">Chemia</option>
            <option value="inne">Inne</option>
          </select>
        </div>
      </div>
    </div>

    <div class="form-group"><label class="form-label">${t('nr_faktury')}</label><input class="form-input" id="pz-invoice" placeholder="${t('nr_faktury')}"></div>
    <div class="form-actions">
      <button type="button" class="btn-submit" onclick="submitPurchaseForDeal(${dealId})">${t('zapisz_zakup')}</button>
      <button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button>
    </div>
  `);
}

function switchPurchaseTab(tab, btn) {
  document.getElementById('purchase-existing').style.display = tab === 'existing' ? '' : 'none';
  document.getElementById('purchase-new').style.display = tab === 'new' ? '' : 'none';
  document.querySelectorAll('.purchase-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function submitPurchaseForDeal(dealId) {
  const isNew = document.getElementById('purchase-new').style.display !== 'none';

  if (isNew) {
    const nazwa = document.getElementById('pn-name')?.value?.trim();
    if (!nazwa) return;
    await fetch(`${API}/api/transakcje/${dealId}/material-nowy`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nazwa,
        ilosc: parseFloat(document.getElementById('pn-qty')?.value) || 1,
        jednostka: document.getElementById('pn-unit')?.value || 'szt',
        cena_jedn: parseFloat(document.getElementById('pn-price')?.value) || 0,
        cena: parseFloat(document.getElementById('pn-price')?.value) || 0,
        kategoria: document.getElementById('pn-cat')?.value || 'material'
      })
    });
  } else {
    const stockId = document.getElementById('pz-stock')?.value;
    if (!stockId) return;
    await fetch(`${API}/api/transakcje/${dealId}/zakup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        magazyn_id: parseInt(stockId),
        ilosc: parseFloat(document.getElementById('pz-qty')?.value) || 1,
        cena: parseFloat(document.getElementById('pz-price')?.value) || 0,
        faktura: document.getElementById('pz-invoice')?.value || null
      })
    });
  }
  closeModal();
  showDealDetail(dealId);
}

async function uploadInvoiceFile(dealId) {
  const input = document.getElementById(`invoice-file-${dealId}`);
  if (!input?.files?.[0]) return;
  const fd = new FormData();
  fd.append('file', input.files[0]);
  await fetch(`${API}/api/transakcje/${dealId}/faktura`, { method: 'POST', body: fd });
  showDealDetail(dealId);
}

async function deleteInvoiceFile(invoiceId, dealId) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/zakupy_pliki/${invoiceId}`, { method: 'DELETE' });
  showDealDetail(dealId);
}

async function aiParseInvoice(invoiceId, dealId) {
  const btn = event.target;
  const origText = btn.innerHTML;
  btn.innerHTML = `⏳ ${t('ai_parsowanie')}`;
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/api/faktura/${invoiceId}/parse`, { method: 'POST' });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      btn.innerHTML = origText;
      btn.disabled = false;
      return;
    }

    // Re-render the deal detail to show parsed items
    showDealDetail(dealId);
  } catch (err) {
    alert('AI error: ' + err.message);
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

async function applyInvoiceItems(invoiceId, dealId) {
  const invoice = await fetch(`${API}/api/faktura/${invoiceId}/parse`).catch(() => null);
  // Get the parsed items from the invoice record
  const invoiceData = await fetch(`${API}/api/transakcje/${dealId}`).then(r => r.json());
  const inv = invoiceData.zakupy_pliki?.find(f => f.id === invoiceId);
  if (!inv?.pozycje) { alert('No items to apply'); return; }

  const items = JSON.parse(inv.pozycje);
  if (!items.length) return;

  const res = await fetch(`${API}/api/faktura/${invoiceId}/apply`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (data.ok) {
    showDealDetail(dealId);
  }
}

/* ===== DEAL COSTS (labor, transport, other) ===== */
async function showAddCostForm(dealId) {
  const team = await getTeam();
  const memberOpts = `<option value="">${t('brak')}</option>` + team.map(m => `<option value="${m.id}">${m.imie}</option>`).join('');
  openModal(`${t('dodaj_koszt')}`, `
    <form onsubmit="submitCost(event,${dealId})">
      <div class="form-group">
        <label class="form-label">${t('typ_kosztu')}</label>
        <select class="form-select" id="cost-type">
          <option value="praca">👷 ${t('praca')}</option>
          <option value="transport">🚚 ${t('transport')}</option>
          <option value="inne">📋 ${t('inne_koszty')}</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">${t('opis')} *</label><input class="form-input" id="cost-desc" required placeholder="${t('opis')}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">${t('kwota')} (zł) *</label><input class="form-input" id="cost-amount" type="number" step="0.01" min="0" required></div>
        <div class="form-group"><label class="form-label">${t('data')}</label><input class="form-input" id="cost-date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
      </div>
      <div class="form-group"><label class="form-label">${t('wykonawca')}</label><select class="form-select" id="cost-worker">${memberOpts}</select></div>
      <div class="form-actions"><button type="submit" class="btn-submit">${t('dodaj')}</button><button type="button" class="btn-cancel" onclick="closeModal()">${t('anuluj')}</button></div>
    </form>
  `);
}

async function submitCost(e, dealId) {
  e.preventDefault();
  await fetch(`${API}/api/transakcje/${dealId}/koszty`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      typ: document.getElementById('cost-type').value,
      opis: document.getElementById('cost-desc').value,
      kwota: parseFloat(document.getElementById('cost-amount').value) || 0,
      wykonawca_id: document.getElementById('cost-worker').value || null,
      data_kosztu: document.getElementById('cost-date').value
    })
  });
  closeModal();
  showDealDetail(dealId);
}

async function deleteCost(costId, dealId) {
  if (!confirm(t('na_pewno_usunac'))) return;
  await fetch(`${API}/api/koszty/${costId}`, { method: 'DELETE' });
  showDealDetail(dealId);
}
