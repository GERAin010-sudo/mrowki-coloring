# Deployment — Mrówki Coloring (CRM + сайт)

Деплой через Docker Compose на одну VM. Всё работает в контейнерах, один порт наружу (или два — для внутреннего доступа).

## Файлы

| Файл | Назначение |
|------|-----------|
| `docker-compose.yml` | Два сервиса: `crm` (Node.js) + `site` (nginx статика) |
| `crm.env.example` | Шаблон env для CRM (скопируй в `crm.env`) |
| `site-nginx-internal.conf` | Nginx-конфиг внутри контейнера сайта |
| `Caddyfile` | HTTPS reverse-proxy (раскомментить в docker-compose если нужен внешний доступ через HTTPS) |
| `deploy.sh` | rsync + docker compose up на удалённой VM |
| `crm.service` | альтернатива — systemd без docker |
| `crm-nginx.conf`, `site-nginx.conf` | альтернатива — nginx на хосте без docker |

## Один деплой — одна команда

```bash
cd deploy
./deploy.sh user@openclaw2 /opt/mrowki
```

После этого на VM:
- CRM — `http://<vm-ip>:8080` (внутренний LAN доступ)
- Сайт — `http://<vm-ip>:8081`

Для внешнего HTTPS-доступа — раскомментить сервис `caddy` в `docker-compose.yml` + настроить DNS.

## Порты

```
  [ Интернет ] 
       │
       │ 80, 443 (Caddy — опционально)
       ▼
┌──────────────────────────────────┐
│  VM openclaw2                    │
│                                  │
│  ┌──────────┐   ┌──────────┐   │
│  │   caddy  │   │   crm    │:3000 (контейнер)
│  │  :80/:443│──►│  Node.js │:8080 (хост)
│  └────┬─────┘   └──────────┘   │
│       │                         │
│       │         ┌──────────┐   │
│       └────────►│   site   │:80 (контейнер)
│                 │  nginx   │:8081 (хост)
│                 └──────────┘   │
└──────────────────────────────────┘
       ▲                   ▲
       │ LAN 8080/8081     │
       │ (изнутри)         │
```

Изнутри VM / LAN — по `8080` (CRM) и `8081` (сайт), без HTTPS.  
Снаружи — через Caddy на `443` (авто SSL Let's Encrypt).

## Первый запуск

```bash
# На VM, после rsync:
cd /opt/mrowki/deploy
cp crm.env.example crm.env
nano crm.env                     # вписать TELEGRAM_BOT_TOKEN и т.д.

docker compose up -d --build

# Создать пароль для юзера:
docker compose exec crm node setup-password.js list
docker compose exec crm node setup-password.js set --user 1 --login admin --password MyPass2026

# Проверить:
curl http://localhost:8080/login.html
curl http://localhost:8081/
```

## Обновление

```bash
cd deploy
./deploy.sh user@openclaw2              # перекатит файлы + rebuild
```

БД и uploads сохраняются в volumes (`crm_data`, `crm_uploads`).

## Бэкапы

```bash
# На VM
docker compose exec crm sqlite3 /app/crm.db ".backup /app/backup-$(date +%F).db"
docker cp mrowki-crm:/app/backup-$(date +%F).db ./backups/

# или cron
0 3 * * * cd /opt/mrowki/deploy && docker compose exec -T crm sqlite3 /app/crm.db ".backup /app/backup-$(date +\%F).db" && docker cp mrowki-crm:/app/backup-$(date +\%F).db /backup/
```

## Логи

```bash
docker compose logs -f crm
docker compose logs -f site
docker compose logs --tail 100 crm
```

## Troubleshooting

**Порт занят** → меняешь `"8080:3000"` → например `"3200:3000"` в `docker-compose.yml`  
**Бот не подключается** → проверь `TELEGRAM_BOT_TOKEN` в `crm.env`  
**Сайт не видит галерею** → убедись что `SITE_ORIGIN` включает твой домен, и в `site/js/config.js` правильный URL CRM  
**CRM не пускает** → `docker compose exec crm node setup-password.js list` — посмотри юзеров
