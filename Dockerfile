# syntax=docker/dockerfile:1

FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей (PostgreSQL не требует компиляции)
RUN npm ci --omit=dev

# Копирование остальных файлов
COPY . .

# Порт
EXPOSE 5501

# Запуск
CMD ["npm", "start"]
