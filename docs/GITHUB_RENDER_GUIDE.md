🚀 ЗАГРУЗКА НА GITHUB И RENDER
================================

## Шаг 1: Установка Git

1. Откройте: https://git-scm.com/download/win
2. Скачайте Git для Windows (64-bit)
3. Запустите установщик
4. Нажимайте "Next" несколько раз
5. В конце выберите "Launch Git Bash" или просто Finish

**Проверка что установлено:**
```powershell
git --version
```

Должно вывести версию (например: `git version 2.43.0.windows.1`)

---

## Шаг 2: Создание репозитория на GitHub

1. Откройте: https://github.com
2. Нажмите **"Sign up"** (если нет аккаунта)
3. Заполните данные и подтвердите email
4. Нажмите **"+"** (сверху справа)
5. Выберите **"New repository"**
6. **Имя:** `evrocontayner`
7. **Description:** `Веб-сайт с админ-панелью для контактов`
8. Выберите **"Public"** (чтобы увидеть логи)
9. ❌ Не создавайте README (мы сами загрузим)
10. Нажмите **"Create repository"**

Вы увидите экран с командами. **НЕ закрывайте эту страницу!**

---

## Шаг 3: Загрузка проекта на GitHub

В папке `evrocontayner` откройте PowerShell и выполните:

### Первый раз (конфигурация Git):
```powershell
git config --global user.name "Ваше Имя"
git config --global user.email "ваш_email@gmail.com"
```

### Инициализация репозитория:
```powershell
git init
git add .
git commit -m "Initial commit - Evrocontayner project"
git branch -M main
```

### Добавление remote (ссылки на GitHub):
**ЗАМЕНИТЕ username на ваш GitHub ник:**
```powershell
git remote add origin https://github.com/USERNAME/evrocontayner.git
```

### Загрузка на GitHub:
```powershell
git push -u origin main
```

Введите свои **GitHub username и password** (или Personal Access Token если 2FA).

**После этого обновите страницу GitHub - ваш проект появится там!**

---

## Шаг 4: Развертывание на Render

### Вариант A: Автоматическое развертывание (рекомендую)

1. Откройте: https://render.com
2. Нажмите **"New +"** → **"Web Service"**
3. Нажмите **"Connect a repository"**
4. Авторизуйтесь через GitHub
5. Найдите и выберите `evrocontayner`
6. Нажмите **"Next"**

### Заполните параметры:

- **Name:** `evrocontayner`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (бесплатный)

### Environment Variables (добавьте вручную):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш_email@gmail.com
SMTP_PASS=пароль_приложения
TO_EMAIL=amarhanyan83@gmail.com
PORT=3000
NODE_ENV=production
```

7. Нажмите **"Create Web Service"**
8. Ждите развертывания (2-5 минут)

**Готово!** Приложение будет доступно по адресу: `https://evrocontayner.onrender.com`

---

## Результат:

🌍 **Сайт доступен всем в интернете:**
- Главная: https://evrocontayner.onrender.com
- Админ-панель: https://evrocontayner.onrender.com/admin.html
- Контакты: https://evrocontayner.onrender.com/contact.html

📊 **БД SQLite** работает на сервере
💾 **Данные сохраняются** между перезагрузками
📧 **Письма отправляются** через SMTP

---

## Если потом хотите обновить код:

1. Отредактируйте файлы локально
2. В PowerShell:
```powershell
git add .
git commit -m "Описание изменений"
git push
```
3. Render **автоматически** пересоберет сайт!

---

## Проблемы при загрузке?

### "fatal: not a git repository"
```powershell
git init
```

### "permission denied" при push
- Создайте Personal Access Token: https://github.com/settings/tokens
- Используйте его вместо пароля

### Render не обновляется
- Проверьте "Deploy" логи в Render Dashboard
- Посмотрите есть ли ошибки в "Logs"

---

**Готовы? Пишите "готово" и начинаем!**
