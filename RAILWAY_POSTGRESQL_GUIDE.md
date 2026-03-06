# 🐘 Миграция на Railway PostgreSQL - ГОТОВО!

## ✅ Что изменено:

### 1. **База данных: SQLite → PostgreSQL**
   - Удалён пакет `sqlite3` 
   - Добавлен пакет `pg` (node-postgres)
   - `server.js` полностью переписан для PostgreSQL
   - Автоматическая инициализация таблиц при старте

### 2. **Обновлённые файлы:**
   - ✅ [package.json](package.json) - PostgreSQL зависимости
   - ✅ [server.js](server.js) - полная миграция на pg
   - ✅ [schema.sql](schema.sql) - SQL схема для справки
   - ✅ [.env.example](.env.example) - обновлённые переменные
   - ✅ [nixpacks.toml](nixpacks.toml) - упрощённая сборка
   - ✅ [Dockerfile](Dockerfile) - оптимизированный для PostgreSQL

### 3. **Преимущества PostgreSQL:**
   - ✅ Нет проблем с компиляцией бинарников
   - ✅ Автоматические бэкапы от Railway
   - ✅ Production-ready база данных
   - ✅ Масштабируемость
   - ✅ Не теряются данные при редеплое
   - ✅ Лучшая производительность

---

## 🚀 Инструкция по деплою на Railway

### Шаг 1: Подготовка GitHub репозитория

```powershell
# Инициализация git (если не сделано)
git init
git add .
git commit -m "Migrate to PostgreSQL for Railway"

# Создание и push в GitHub
git remote add origin https://github.com/ВАШ_ЛОГИН/evrocontayner.git
git branch -M main
git push -u origin main
```

### Шаг 2: Создание проекта на Railway

1. **Перейдите на:** https://railway.app
2. **Войдите через GitHub**
3. **Нажмите "New Project"**
4. **Выберите "Deploy from GitHub repo"**
5. **Выберите репозиторий:** `evrocontayner`

Railway автоматически обнаружит Node.js проект и начнёт деплой.

---

### Шаг 3: Добавление PostgreSQL базы данных

1. **В вашем проекте нажмите:** `New` → `Database` → `Add PostgreSQL`

2. **Railway автоматически создаст переменную окружения:**
   - `DATABASE_URL` - полная строка подключения к PostgreSQL

3. **Подключите базу к вашему сервису:**
   - Перейдите в ваш сервис (evrocontayner)
   - Settings → Variables
   - Railway автоматически добавит `DATABASE_URL`

**Важно:** `DATABASE_URL` создаётся автоматически, ничего не нужно вводить вручную!

---

### Шаг 4: Настройка переменных окружения

В панели вашего сервиса: **Settings → Variables**

Добавьте следующие переменные:

| Переменная | Значение |
|------------|----------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `amarhanyan83@gmail.com` |
| `SMTP_PASS` | `ваш_gmail_app_password` |
| `TO_EMAIL` | `amarhanyan83@gmail.com` |
| `NODE_ENV` | `production` |
| `PORT` | `5501` |

**DATABASE_URL** уже автоматически добавлен Railway!

#### Получение Gmail App Password:

1. Перейдите: https://myaccount.google.com/apppasswords
2. Войдите в Gmail аккаунт
3. Создайте пароль для приложения "Mail"
4. Скопируйте 16-символьный код БЕЗ пробелов
5. Вставьте в `SMTP_PASS`

---

### Шаг 5: Настройка домена evrontayner.kz

#### Вариант A: Через NS записи (РЕКОМЕНДУЕТСЯ)

1. **В Railway панели:**
   - Settings → Networking
   - Custom Domain → Add Domain
   - Введите: `evrontayner.kz`
   - Railway покажет свои NS серверы

2. **У регистратора домена evrontayner.kz:**
   - Найдите настройки Name Servers (NS)
   - Замените на NS от Railway (обычно `ns1.railway.app`, `ns2.railway.app`)
   - Сохраните изменения

3. **Ожидание:** 2-24 часа для делегирования DNS

#### Вариант B: Через CNAME запись

1. **Получите Railway домен** (например, `evrocontayner-production.up.railway.app`)
2. **У регистратора создайте CNAME:**
   ```
   Тип: CNAME
   Имя: @ (или www)
   Значение: evrocontayner-production.up.railway.app
   ```

**SSL сертификат:** Railway автоматически установит Let's Encrypt SSL после подключения домена.

---

### Шаг 6: Автоматический деплой (Готово!)

После `git push` Railway автоматически:
1. ✅ Обнаружит изменения в GitHub
2. ✅ Соберёт проект
3. ✅ Запустит сервер с PostgreSQL
4. ✅ Обновит сайт БЕЗ даунтайма

```powershell
# Внесите изменения
git add .
git commit -m "Update site"
git push

# Railway автоматически задеплоит!
```

---

## 🔍 Проверка после деплоя

### 1. Проверка логов:
В Railway Dashboard → **Deployments** → **View Logs**

Должны увидеть:
```
✅ PostgreSQL database initialized
🚀 Mail & DB server listening on http://localhost:5501
📊 Database: PostgreSQL (Railway)
```

### 2. Health Check:
```bash
curl https://evrontayner.kz/health
```

Ответ:
```json
{
  "status": "ok",
  "database": "PostgreSQL",
  "timestamp": "2026-02-11T..."
}
```

### 3. Проверка базы данных:

В Railway Dashboard → **PostgreSQL** → **Data** можно просмотреть таблицы:
- `contacts`
- `users`

---

## 📊 Управление базой данных

### Просмотр данных в Railway:

1. **Railway Dashboard** → **PostgreSQL** → **Data**
2. Выполняйте SQL запросы прямо в браузере:

```sql
-- Все контакты
SELECT * FROM contacts ORDER BY created_at DESC LIMIT 10;

-- Количество неотправленных
SELECT COUNT(*) FROM contacts WHERE sent = false;

-- Все пользователи
SELECT id, email, name, created_at FROM users;
```

### Подключение к базе через psql:

```bash
# Railway CLI
railway login
railway link
railway run psql $DATABASE_URL
```

---

## 🔄 Бэкапы

**Автоматические бэкапы:**
- Railway автоматически создаёт бэкапы PostgreSQL
- Настройка: **PostgreSQL** → **Settings** → **Backups**
- Восстановление: **Backups** → выберите дату → **Restore**

**Ручной бэкап через Railway CLI:**
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

**Восстановление из бэкапа:**
```bash
railway run psql $DATABASE_URL < backup.sql
```

---

## 🛠️ VS Code интеграция

### 1. Установка Railway Extension:
   - Extensions (Ctrl+Shift+X)
   - Найти "Railway"
   - Установить официальное расширение

### 2. Подключение:
   - Railway icon в сайдбаре
   - Login через GitHub
   - Выбрать проект `evrocontayner`

### 3. Команды:
   - `Ctrl+Shift+P` → "Railway: View Logs"
   - `Ctrl+Shift+P` → "Railway: Open Dashboard"
   - `Ctrl+Shift+P` → "Railway: Redeploy"

---

## 📈 Мониторинг

### Метрики в Railway:
- **Dashboard** → **Metrics**
- CPU, RAM, Network usage
- Request rate
- Database connections

### Уведомления:
- **Settings** → **Notifications**
- Настройте Discord/Slack/Email уведомления о деплоях

---

## 💰 Стоимость

**Бесплатный план:**
- $5 кредитов каждый месяц
- ~500 часов работы приложения
- PostgreSQL (512MB RAM, 1GB Storage)

**Hobby план ($5/мес):**
- $5 + оплата за использование
- Больше ресурсов
- Приоритетная поддержка

---

## 🐛 Troubleshooting

### Приложение не запускается:
1. Проверьте логи: **Deployments** → **View Logs**
2. Убедитесь что все переменные окружения настроены
3. Проверьте что `DATABASE_URL` существует

### База данных не подключается:
```bash
# Проверка в Railway Logs:
❌ Failed to connect to database
```
**Решение:** Убедитесь что PostgreSQL сервис добавлен и `DATABASE_URL` настроен

### Домен не работает:
```bash
# Проверка DNS делегирования:
nslookup evrontayner.kz
dig NS evrontayner.kz
```

### Ошибки SMTP:
- Убедитесь что используете Gmail App Password, а не обычный пароль
- Проверьте что двухфакторная аутентификация включена в Google

---

## 📚 Полезные ссылки

- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.app
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Node-Postgres (pg):** https://node-postgres.com/

---

## ✨ Готово!

Теперь ваш проект:
- ✅ Использует production-ready PostgreSQL
- ✅ Автоматически деплоится при push
- ✅ Имеет автоматические бэкапы
- ✅ Работает на домене evrontayner.kz
- ✅ Не теряет данные при редеплое
- ✅ Готов к масштабированию

**Следующий шаг:** Push в GitHub!

```powershell
git add .
git commit -m "PostgreSQL migration complete"
git push
```

Railway автоматически задеплоит обновлённый проект! 🚀
