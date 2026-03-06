# 🚀 Инструкция по деплою на Railway.app

## Почему Railway?
- ✅ Поддержка полноценных Node.js серверов с Express
- ✅ Встроенная поддержка баз данных (SQLite/MySQL/PostgreSQL)
- ✅ Автоматический деплой через GitHub
- ✅ Поддержка кастомных доменов через NS
- ✅ Бесплатный план с достаточными ресурсами
- ✅ Интеграция с VS Code

## Шаг 1: Подготовка репозитория

1. **Инициализируйте git (если еще не сделано):**
```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

2. **Создайте репозиторий на GitHub:**
   - Перейдите на https://github.com/new
   - Создайте новый репозиторий (можно приватный)
   - Не добавляйте README, .gitignore, license

3. **Подключите и запушьте:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/evrocontayner.git
git branch -M main
git push -u origin main
```

## Шаг 2: Настройка Railway

1. **Регистрация:**
   - Перейдите на https://railway.app
   - Войдите через GitHub

2. **Создание проекта:**
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите репозиторий evrocontayner
   - Railway автоматически определит Node.js проект

3. **Настройка переменных окружения:**
   В панели Railway → Settings → Variables добавьте:
   ```
   PORT=5501
   TO_EMAIL=amarhanyan83@gmail.com
   SMTP_HOST=ваш_smtp_хост
   SMTP_PORT=ваш_smtp_порт
   SMTP_USER=ваш_smtp_пользователь
   SMTP_PASS=ваш_smtp_пароль
   NODE_ENV=production
   ```

4. **Добавление базы данных (если нужна MySQL вместо SQLite):**
   - В проекте нажмите "New" → "Database" → "Add MySQL"
   - Railway автоматически создаст переменные DB_HOST, DB_USER, DB_PASSWORD и т.д.

## Шаг 3: Настройка домена evrontayner.kz

### Вариант А: Через NS записи (Name Servers)

1. **В Railway панели:**
   - Перейдите в Settings → Networking
   - Нажмите "Custom Domain"
   - Введите: `evrontayner.kz`
   - Railway покажет свои NS записи (обычно это ns1.railway.app и ns2.railway.app)

2. **У вашего регистратора домена:**
   - Зайдите в панель управления доменом evrontayner.kz
   - Найдите раздел "Name Servers" или "NS записи"
   - Замените существующие NS на:
     ```
     ns1.railway.app
     ns2.railway.app
     ```
   - Сохраните изменения

3. **Ожидание делегирования:**
   - DNS обновление может занять до 24-48 часов
   - Проверить статус: `nslookup evrontayner.kz`

### Вариант Б: Через CNAME (если NS недоступны)

1. **В Railway:**
   - Получите ваш railway домен (например, `evrocontayner-production.up.railway.app`)

2. **У регистратора:**
   - Создайте CNAME запись:
     ```
     Тип: CNAME
     Имя: @
     Значение: evrocontayner-production.up.railway.app
     ```

### SSL сертификат
Railway автоматически установит бесплатный SSL от Let's Encrypt после подключения домена.

## Шаг 4: Автоматический деплой

**Автодеплой уже настроен!** После push в GitHub:
```bash
git add .
git commit -m "Update site"
git push
```

Railway автоматически:
1. Обнаружит изменения
2. Соберет проект
3. Запустит `npm start`
4. Обновит сайт без даунтайма

## Шаг 5: VS Code интеграция

1. **Установите расширение Railway:**
   - Откройте VS Code
   - Перейдите в Extensions (Ctrl+Shift+X)
   - Найдите "Railway" 
   - Установите официальное расширение

2. **Подключите аккаунт:**
   - Нажмите на иконку Railway в сайдбаре
   - Войдите через GitHub
   - Выберите проект evrocontayner

3. **Быстрые команды в VS Code:**
   - `Ctrl+Shift+P` → "Railway: View Logs" - просмотр логов
   - `Ctrl+Shift+P` → "Railway: Open Dashboard" - открыть панель
   - `Ctrl+Shift+P` → "Railway: Redeploy" - ручной редеплой

## Мониторинг и логи

1. **Посмотреть логи:**
   - В Railway Dashboard → View Logs
   - Или через VS Code: Railway extension → View Logs

2. **Метрики:**
   - Railway Dashboard → Metrics (использование CPU, RAM, Network)

3. **Уведомления:**
   - Settings → Notifications (настройте уведомления в Discord/Slack)

## Бэкапы базы данных

Если используете Railway MySQL:
1. Settings → Database → Create Backup
2. Автоматические бэкапы: Settings → Backups → Enable

Для SQLite создайте регулярные коммиты файла базы:
```bash
git add data/db.sqlite
git commit -m "Database backup"
git push
```

## Rollback (откат на предыдущую версию)

1. В Railway Dashboard:
   - Deployments → выберите предыдущий деплой
   - Нажмите "Redeploy"

2. Или через Git:
```bash
git revert HEAD
git push
```

## Полезные команды

```bash
# Проверить домен
nslookup evrontayner.kz

# Проверить SSL
curl -I https://evrontayner.kz

# Посмотреть Git статус
git status

# Быстрый пуш
git add . && git commit -m "Quick update" && git push
```

## Стоимость

**Бесплатный план Railway:**
- $5 бесплатных кредитов каждый месяц
- ~500 часов работы приложения
- Достаточно для небольшого сайта

**Если превысите лимит:**
- Hobby план: $5/месяц
- Оплата только за использованные ресурсы

## Troubleshooting

**Проблема:** Приложение не запускается
- **Решение:** Проверьте логи в Railway Dashboard, убедитесь что все переменные окружения настроены

**Проблема:** Домен не работает через 24 часа
- **Решение:** Проверьте NS записи: `dig NS evrontayner.kz`

**Проблема:** База данных не работает
- **Решение:** Убедитесь что путь к SQLite правильный или используйте Railway MySQL

## Альтернативы Railway

Если Railway не подойдет:
- **Render.com** - уже есть конфигурация в `config/render.yaml`
- **Fly.io** - хорошая альтернатива
- **Cyclic.sh** - простой бесплатный хостинг для Node.js

## Контакты поддержки

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app
