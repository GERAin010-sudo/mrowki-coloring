# Mrówki Coloring — сайт + CRM

Монорепо с двумя deployable частями:

```
┌────────────────────────────┐      ┌────────────────────────────┐
│  site/   → публичный сайт  │      │  crm/    → внутренний CRM  │
│  mrowki-coloring.pl        │ ───► │  crm.mrowki-coloring.pl    │
│                            │      │                            │
│  • Статика (HTML/CSS/JS)   │      │  • Node.js + Express       │
│  • Галерея (fetch из CRM)  │      │  • SQLite + Telegram bot   │
│                            │      │  • Login / сессии          │
│  Host: Vercel/Netlify/VPS  │      │  • Task module             │
└────────────────────────────┘      │  Host: VPS (Hetzner/DO)    │
                                    └────────────────────────────┘
```

## Локальный запуск (разработка)

**Две команды в двух терминалах:**

```bash
# Terminal 1 — CRM
cd crm
npm install
cp .env.example .env
# (в первый раз) node setup-password.js set --user 1 --login admin --password MyPass
node server.js                         # → http://localhost:3000
```

```bash
# Terminal 2 — сайт
cd site
npx serve . -l 3021 --no-clipboard     # → http://localhost:3021
```

Сайт при `hostname === 'localhost'` дергает CRM на `http://localhost:3000` (см. `site/js/config.js`).

## Структура

```
/
├── site/              # → публичный хост
│   ├── index.html
│   ├── css/, js/, assets/
│   ├── js/config.js   # ← URL CRM API в проде
│   └── README.md
│
├── crm/               # → приватный VPS
│   ├── server.js
│   ├── database.js
│   ├── admin/
│   │   ├── index.html, admin.js, admin.css
│   │   ├── login.html, login.js, login.css
│   │   └── taskmodule/
│   ├── bot/
│   ├── uploads/       # загрузки (фото для галереи сайта)
│   ├── crm.db         # SQLite
│   ├── package.json
│   ├── setup-password.js
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── deploy/            # конфиги для продакшна
│   ├── crm.service    # systemd
│   ├── crm-nginx.conf
│   └── site-nginx.conf
│
└── README.md
```

## Деплой на продакшн — чеклист

### Шаг 1. Подготовка сервера CRM (VPS)

```bash
# На VPS (Ubuntu 22.04+):
sudo apt update && sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx build-essential
sudo mkdir -p /opt/mrowki-crm && sudo chown $USER:$USER /opt/mrowki-crm

# Скопировать crm/ на сервер
rsync -av --exclude='node_modules' --exclude='*.db*' ./crm/ user@vps:/opt/mrowki-crm/

# На сервере:
cd /opt/mrowki-crm
npm ci --production
cp .env.example .env
nano .env   # задать TELEGRAM_BOT_TOKEN, COOKIE_SECURE=1, SITE_ORIGIN=https://mrowki-coloring.pl

# Создать админа
node setup-password.js set --user 1 --login admin --password <strong-password>
# Или создать нового
node setup-password.js create --telegram 0 --name "Admin" --role admin --login admin --password ChangeMe2026

# systemd service
sudo cp /opt/mrowki-crm/../deploy/crm.service /etc/systemd/system/
# (или вручную скопировать из репо)
sudo systemctl daemon-reload
sudo systemctl enable --now mrowki-crm
sudo systemctl status mrowki-crm

# Nginx + HTTPS
sudo cp deploy/crm-nginx.conf /etc/nginx/sites-available/crm.mrowki-coloring.pl
sudo ln -s /etc/nginx/sites-available/crm.mrowki-coloring.pl /etc/nginx/sites-enabled/
sudo certbot --nginx -d crm.mrowki-coloring.pl
sudo nginx -t && sudo systemctl reload nginx
```

### Шаг 2. Сайт — выбрать способ

**Вариант A — Vercel (проще всего)**
1. Открой [vercel.com](https://vercel.com), импортируй репо.
2. Root Directory → `site/`.
3. Build command: (пусто)
4. Output directory: `.`
5. Укажи домен → привяжи DNS.
6. В `site/js/config.js` проверь prod URL CRM.

**Вариант Б — тот же VPS (или другой)**
```bash
sudo mkdir -p /var/www/mrowki-site
sudo rsync -av ./site/ /var/www/mrowki-site/
sudo cp deploy/site-nginx.conf /etc/nginx/sites-available/mrowki-coloring.pl
sudo ln -s /etc/nginx/sites-available/mrowki-coloring.pl /etc/nginx/sites-enabled/
sudo certbot --nginx -d mrowki-coloring.pl -d www.mrowki-coloring.pl
sudo nginx -t && sudo systemctl reload nginx
```

### Шаг 3. Проверка связки

```bash
# 1. Сайт открывается:           https://mrowki-coloring.pl
# 2. CRM редиректит на логин:    https://crm.mrowki-coloring.pl → /login.html
# 3. Публичный API работает:     curl https://crm.mrowki-coloring.pl/api/public/realizacje
# 4. Галерея на сайте грузится:  DevTools → Network → fetch realizacje должен быть 200
# 5. Админка: логин → загрузить фото → появляется в галерее сайта
```

## Безопасность

- ✅ HTTPS обязателен (сертификаты Let's Encrypt)
- ✅ Сессионные cookie (`httpOnly`, `SameSite=Lax`, `Secure` в проде)
- ✅ Пароли scrypt (встроенный crypto, без зависимостей)
- ✅ Rate-limit на логин (10 попыток / 15 мин / IP)
- ✅ CORS ограничен доменом сайта (через `SITE_ORIGIN`)
- ⚙️ Опционально: IP allowlist в `deploy/crm-nginx.conf` (раскомментить блок `allow ...; deny all;`)
- ⚙️ Опционально: Tailscale/Cloudflare Access вместо публичного интернета

## Бэкапы

БД:
```bash
# cron на VPS
0 3 * * * sqlite3 /opt/mrowki-crm/crm.db ".backup /backup/crm_$(date +\%F).db" && find /backup -name 'crm_*.db' -mtime +30 -delete
```

Фото (`uploads/`) — копировать через rsync на S3/другой сервер.

## Docker (альтернатива systemd)

```bash
cd crm
docker build -t mrowki-crm .
docker run -d \
  --name mrowki-crm \
  -p 3000:3000 \
  -v $(pwd)/crm.db:/app/crm.db \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env \
  --restart unless-stopped \
  mrowki-crm
```

## Ссылки

- `site/README.md` — детали сайта
- `crm/README.md` — детали CRM
- `deploy/` — готовые конфиги nginx/systemd
