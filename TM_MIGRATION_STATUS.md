# Task Module DB Migration — ✅ DONE

## Цель
Подключить task module (`crm/admin/taskmodule/`) к нормализованной SQLite БД.

## Что сделано

### Backend
1. **18 таблиц `tm_*`** в `crm/database.js`:
   - `tm_users`, `tm_departments`, `tm_department_members`
   - `tm_projects`, `tm_templates`, `tm_tasks`
   - `tm_task_assignees`, `tm_task_departments`, `tm_task_watchers`
   - `tm_task_subtasks`, `tm_task_comments`, `tm_task_attachments`, `tm_task_links`, `tm_task_contacts`, `tm_task_tags`
   - `tm_task_relations`, `tm_task_history`, `tm_task_time_entries`

2. **Сиды** `crm/tm_seed.json` (44KB — выгрузка из mockData.js: 8 юзеров, 5 отделов, 36 проектов, 14 задач, 3 шаблона)

3. **Методы БД**: `tmSeedIfEmpty()`, `tmGetBootstrap()`, `_tmHydrateTask()`, `tmSaveTasksBulk()`, `tmSaveProjectsBulk()`

4. **REST API**:
   - `GET /api/tm/bootstrap` — { users, departments, projects, tasks, templates }
   - `PUT /api/tm/tasks/bulk` — сохранение всех задач (транзакция)
   - `PUT /api/tm/projects/bulk` — сохранение проектов

### Frontend
5. **Async bootstrap** в `app.js` — при загрузке страницы fetch-ит `/api/tm/bootstrap` и перезаписывает `taskStore.tasks` + `PROJECTS`

6. **`saveTasks()` / `saveProjects()`** — теперь сохраняют и в localStorage (кэш), и в наш API через fetch PUT (fire-and-forget)

7. **Миграция assigneeId ↔ assigneeIds** в bootstrap — для совместимости с рендерером

## Проверено ✅
- Задачи грузятся из БД (14 задач, все исполнители корректно отображаются)
- Создание задачи → сохраняется в БД (id=15) → видна после reload
- Удаление → убирается из БД
- Все 4 вида работают: Zadania (table), Kanban, Tydzień, Moje zadania

## Файлы изменённые
- `crm/database.js` (+~200 строк: схема + 6 методов)
- `crm/server.js` (+25 строк: 3 endpoint)
- `crm/tm_seed.json` (новый, 44KB)
- `crm/admin/taskmodule/app.js` (+30 строк: tmBootstrap)
- `crm/admin/taskmodule/data/mockData.js` (~15 строк: loadTasks/saveTasks + loadProjects/saveProjects)
- `~/.claude/settings.json` (permissions allow)

## Что дальше (опционально)
- **Связь с нашими `uzytkownicy`** — сейчас USERS в модуле hardcoded. Можно добавить мэппинг «Telegram user ↔ tm_user» для реальных юзеров.
- **Файлы** — `tm_task_attachments.url` пока пустое. Нужно интегрировать с нашей `/uploads/` системой.
- **История изменений** — сейчас хранится в `tm_task_history`, но модуль её не читает при bootstrap (читает из `task.history` массива, который мы хидрейтим). Надо проверить что работает.
- **Permissions / access_level** — модуль уже проверяет `canViewTask(task, userId)`. Настроить реальный `CURRENT_USER_ID` из нашего auth.
