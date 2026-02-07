🚀 РАЗВЕРТЫВАНИЕ НА RENDER (БЕСПЛАТНО)
========================================

## Render - облачный хостинг для Node.js (бесплатно!)

### Шаг 1: Регистрация
- Откройте: https://render.com
- Нажмите "Sign Up" → Google или GitHub

### Шаг 2: Новый Web Service
- Dashboard → "New Web Service"
- Загрузите ZIP с вашим проектом

### Шаг 3: Настройки
- **Name:** `evrocontayner`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Шаг 4: Environment Variables
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
TO_EMAIL=your_email@gmail.com
PORT=3000
NODE_ENV=production
```

### Шаг 5: Deploy
Нажмите "Deploy" и ждите!

Приложение будет доступно: `https://evrocontayner.onrender.com`

---

## ⚠️ Важно:

- **Бесплатный план:** спит через 15 минут без активности
- **БД SQLite:** сохраняется на сервере
- **SMTP:** используйте пароль приложения Google!

---

## Альтернативы:
- **Railway:** https://railway.app (бесплатный кредит $5)
- **Replit:** https://replit.com

Подробнее см. README.md
