# Lunar Alarm Cloud Mailer

Google Cloud Run приложение для отправки email уведомлений для приложения "Лунный Будильник".

## Функции

- 📧 Отправка тестовых писем
- 🧘 Напоминания о практике
- 📖 Уведомления о заданиях марафона
- 🌙 Красивые HTML шаблоны писем
- ⚡ Быстрое развертывание на Cloud Run

## Быстрый старт

1. **Локальное тестирование:**
```bash
npm install
npm start
```

Приложение запустится на http://localhost:8080

2. **Тестирование endpoint'а:**
```bash
curl -X POST http://localhost:8080/sendTestEmail \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","nick":"Test User"}'
```

3. **Развертывание на Cloud Run:**
   - Смотрите [DEPLOY.md](DEPLOY.md)

## Переменные окружения

```
GMAIL_USER      - Email адрес для отправки
GMAIL_PASSWORD  - App Password из Google
PORT            - Порт (по умолчанию 8080)
```

## Структура

```
cloud-function/
├── index.js          - Основная логика приложения
├── package.json      - Зависимости
├── Dockerfile        - Конфигурация контейнера
├── .dockerignore     - Исключения при сборке
├── DEPLOY.md         - Инструкции по развертыванию
└── README.md         - Этот файл
```

## Безопасность

- Используется CORS для контроля доступа
- Переменные окружения для чувствительных данных
- Валидация входных данных

## Лицензия

MIT
