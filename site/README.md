# Mrówki Coloring — публичный сайт

Статический сайт компании. Галерея (`realizacje`) подгружается с CRM-сервера через публичный API.

## Структура

```
site/
├── index.html
├── css/              # базовые стили
├── js/
│   ├── config.js     # ← URL CRM API (правится под продакшн)
│   ├── app.js
│   ├── gallery.js
│   ├── animations.js
│   └── form.js
└── assets/
    └── images/       # статические картинки (hero, work-*)
```

## Настройка URL CRM

Открой `js/config.js`:

```js
window.__CRM_API__ = (function () {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000';
  return 'https://crm.mrowki-coloring.pl';    // ← сюда вставить свой URL
})();
```

## Локальный запуск

```bash
cd site
npx serve . -l 3021
# Открыть http://localhost:3021
```

CRM должен быть запущен параллельно на :3000.

## Деплой — варианты

### А) Vercel / Netlify (бесплатно, самый простой)

1. Залить папку `site/` на Vercel (drag-n-drop или через git).
2. Домен привязать в Vercel dashboard.
3. В `js/config.js` указать prod URL CRM.

### Б) Nginx на VPS

```bash
# На сервере:
sudo mkdir -p /var/www/mrowki-site
sudo rsync -av /path/to/site/ /var/www/mrowki-site/
sudo chown -R www-data:www-data /var/www/mrowki-site

# Nginx config
sudo cp deploy/site-nginx.conf /etc/nginx/sites-available/mrowki-coloring.pl
sudo ln -s /etc/nginx/sites-available/mrowki-coloring.pl /etc/nginx/sites-enabled/

# HTTPS через Let's Encrypt
sudo certbot --nginx -d mrowki-coloring.pl -d www.mrowki-coloring.pl

sudo nginx -t && sudo systemctl reload nginx
```

### В) S3 + CloudFront / любой static host

Просто залить содержимое `site/`.

## Обновление галереи

Галерея читается с CRM-сервера: `GET <CRM_API>/api/public/realizacje`. Добавляй фото через админку CRM — они сразу появятся на сайте (без пересборки).

## Требования к CRM

Чтобы сайт работал:
- CRM должен быть доступен по HTTPS (иначе браузер заблокирует mixed content)
- CRM должен разрешать CORS с домена сайта:
  ```bash
  # в crm/.env:
  SITE_ORIGIN=https://mrowki-coloring.pl
  ```
- CRM отдаёт публично: `GET /api/public/realizacje`, `GET /uploads/*`
