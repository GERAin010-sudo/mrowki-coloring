# Mrówki Coloring CRM

CRM-система с интегрированным Telegram-ботом и модулем управления задачами.

## Стек

- **Backend**: Node.js 18+ + Express + SQLite (better-sqlite3)
- **Frontend**: Vanilla JS + HTML + CSS (без сборщиков)
- **Bot**: node-telegram-bot-api (polling)
- **Task module**: встроенный как iframe, работает на той же БД

## Установка (production)

### 1. Требования на сервере
- Node.js 18+ (рекомендуется 20 LTS)
- npm
- 512 MB RAM минимум, 1 GB рекомендуется
- Порт 3000 свободен (или меняется в `.env`)

### 2. Быстрый старт
```bash
# Клонировать или скопировать папку crm/
cd /opt/mrowki-crm     # (или любой путь)

# Установить зависимости
npm install --production

# Скопировать и настроить .env
cp .env.example .env
nano .env              # заполнить TELEGRAM_BOT_TOKEN, ADMIN_TELEGRAM_IDS, GOOGLE_MAPS_API_KEY

# Запустить
npm start
```

Приложение доступно на `http://<сервер>:3000`.

### 3. Автозапуск через systemd (Linux)

Создай `/etc/systemd/system/mrowki-crm.service`:

```ini
[Unit]
Description=Mrowki Coloring CRM
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/mrowki-crm
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Затем:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mrowki-crm
sudo systemctl start mrowki-crm
sudo systemctl status mrowki-crm
```

### 4. Nginx reverse-proxy (HTTPS)

`/etc/nginx/sites-available/mrowki-crm`:
```nginx
server {
    listen 80;
    server_name crm.mrowki-coloring.pl;

    # Для Let's Encrypt:
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name crm.mrowki-coloring.pl;

    ssl_certificate     /etc/letsencrypt/live/crm.mrowki-coloring.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.mrowki-coloring.pl/privkey.pem;

    client_max_body_size 50M;   # для загрузки файлов

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mrowki-crm /etc/nginx/sites-enabled/
sudo certbot --nginx -d crm.mrowki-coloring.pl
sudo nginx -t && sudo systemctl reload nginx
```

## Структура проекта

```
crm/
├── server.js              # Express-сервер, API
├── database.js            # SQLite + схема + миграции + сиды
├── package.json           # npm зависимости
├── .env.example           # шаблон конфига
├── .env                   # (создать — не коммитится)
├── tm_seed.json           # сиды task module (usres, depts, projects, ...)
├── crm.db                 # SQLite БД (создаётся автоматически)
├── admin/                 # админ-панель (статика)
│   ├── index.html
│   ├── admin.js
│   ├── admin.css
│   └── taskmodule/        # встроенный task module
│       ├── index.html
│       ├── app.js
│       ├── index.css
│       ├── data/mockData.js
│       └── utils/helpers.js
├── bot/                   # Telegram bot
│   ├── commands.js
│   └── keyboards.js
├── uploads/               # загруженные файлы (создаётся автоматически)
└── README.md
```

## Переменные окружения (.env)

| Переменная              | Обязательная | Описание                                              |
|------------------------|:------------:|-------------------------------------------------------|
| `TELEGRAM_BOT_TOKEN`   |      ✅      | Токен от @BotFather. Если пусто — бот отключён        |
| `PORT`                 |      ❌      | Порт сервера (по умолчанию 3000)                      |
| `ADMIN_TELEGRAM_IDS`   |      ❌      | Telegram ID админов через запятую                     |
| `GOOGLE_MAPS_API_KEY`  |      ❌      | Google Maps API (для карты адресов)                   |
| `COMPANY_PHONE`        |      ❌      | Телефон компании (шаблоны email)                      |
| `COMPANY_EMAIL`        |      ❌      | Email компании (шаблоны email)                        |
| `NODE_ENV`             |      ❌      | `production` → включает Secure cookie                 |
| `COOKIE_SECURE`        |      ❌      | `1` → Secure cookies (нужно для HTTPS)                |
| `SITE_ORIGIN`          |      ❌      | CORS allowed origin (`https://mrowki-coloring.pl`)    |
| `UPLOADS_DIR`          |      ❌      | Путь к папке загрузок (по умолчанию `./uploads`)      |
| `AUTH_DISABLED`        |      ❌      | `1` → отключить логин (ТОЛЬКО для разработки)         |

## Публичный API для внешнего сайта

Эти endpoints не требуют авторизации (используются `site/`):
- `GET /api/public/realizacje` — список фото галереи
- `GET /uploads/*` — сами файлы (фото)

Всё остальное под логином (middleware редиректит на `/login.html`).

## Первоначальная настройка юзеров

```bash
# Посмотреть существующих:
node setup-password.js list

# Задать логин/пароль существующему юзеру (созданному через Telegram bot /start):
node setup-password.js set --user 1 --login admin --password MyS3cretPass

# Создать нового (без Telegram):
node setup-password.js create --telegram 0 --name "Admin" --role admin --login admin --password MyS3cretPass
```

## Резервное копирование

БД — один файл `crm.db` + `crm.db-wal` + `crm.db-shm`. Копируй все три или сделай checkpoint:

```bash
# Через sqlite3 CLI
sqlite3 /opt/mrowki-crm/crm.db "PRAGMA wal_checkpoint(FULL);"
cp /opt/mrowki-crm/crm.db /backup/crm_$(date +%F).db

# Или hot backup
sqlite3 /opt/mrowki-crm/crm.db ".backup /backup/crm_$(date +%F).db"
```

Файлы также в `crm/uploads/` — копируй регулярно.

### cron для ежедневного бэкапа
```cron
0 3 * * * sqlite3 /opt/mrowki-crm/crm.db ".backup /backup/crm_$(date +\%F).db" && find /backup -name 'crm_*.db' -mtime +30 -delete
```

## Обновление

```bash
cd /opt/mrowki-crm
# Остановить сервис
sudo systemctl stop mrowki-crm

# Скопировать новые файлы (сохраняя .env, crm.db, uploads/)
# (удобно: перенести на сервер через rsync, git pull, scp)

# Обновить зависимости
npm install --production

# Запустить
sudo systemctl start mrowki-crm
sudo systemctl status mrowki-crm
```

Миграции БД выполняются автоматически при старте (`database.js:init()` → `ALTER TABLE ... IF NOT EXISTS`, сиды).

## Task Module — нормализованная БД

Модуль использует 18 таблиц `tm_*` (см. `database.js`):
- `tm_users`, `tm_departments`, `tm_department_members`
- `tm_projects`, `tm_templates`, `tm_tasks`
- `tm_task_assignees`, `tm_task_departments`, `tm_task_watchers`
- `tm_task_subtasks`, `tm_task_comments`, `tm_task_attachments`, `tm_task_links`, `tm_task_contacts`, `tm_task_tags`
- `tm_task_relations`, `tm_task_history`, `tm_task_time_entries`

Endpoints:
- `GET /api/tm/bootstrap` — все данные для модуля
- `PUT /api/tm/tasks/bulk` — bulk-сохранение задач
- `PUT /api/tm/projects/bulk` — bulk-сохранение проектов

На первом запуске, если БД пустая — подтягиваются сиды из `tm_seed.json`. Если ты уже удалил их через UI — повторно не накатываются.

## Логи

```bash
sudo journalctl -u mrowki-crm -f              # live
sudo journalctl -u mrowki-crm --since today   # сегодня
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| `EADDRINUSE: :::3000` | Порт занят — смени `PORT` в `.env` или убей процесс: `lsof -ti:3000 \| xargs kill` |
| `better-sqlite3` не собирается | Нужны build tools: `apt install build-essential python3` |
| Бот не отвечает | Проверь `TELEGRAM_BOT_TOKEN`, `journalctl -u mrowki-crm -f` |
| БД заблокирована | WAL mode используется — не редактируй crm.db руками во время работы |
