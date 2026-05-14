# Используем официальный образ Node.js
FROM node:18-slim

# Установим рабочую директорию
WORKDIR /app

# Скопируем package files
COPY package*.json ./

# Установим зависимости
RUN npm install --production

# Скопируем код приложения
COPY . .

# Expose port
EXPOSE 8080

# Запуск приложения
CMD ["npm", "start"]
