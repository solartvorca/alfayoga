# Развертывание на Google Cloud Run

## Предварительные требования

1. Google Cloud Account (https://console.cloud.google.com)
2. Установлен Google Cloud SDK (https://cloud.google.com/sdk/docs/install)
3. Gmail аккаунт для отправки писем

## Шаг 1: Подготовка Gmail

1. Включите двухфакторную аутентификацию в Google Account
2. Создайте App Password:
   - Перейдите на https://myaccount.google.com/apppasswords
   - Выберите приложение: Mail
   - Выберите устройство: Windows Computer (или ваше)
   - Скопируйте сгенерированный пароль (16 символов)

## Шаг 2: Развертывание на Cloud Run

### Через Google Cloud Console (самый простой способ)

1. **Откройте Cloud Run:**
   - https://console.cloud.google.com/run
   - Нажмите "Create Service"

2. **Настройте контейнер:**
   - Выберите "Continuously deploy from a Git repository"
   - Подключите GitHub репозиторий
   - Выберите branch: main
   - Source type: Dockerfile
   - Dockerfile location: `cloud-function/Dockerfile`

3. **Настройте сервис:**
   - Service name: `lunar-alarm-mailer` (или другое)
   - Region: `europe-west1` (или ближайший)
   - CPU allocation: Allocate CPU only during request processing
   - Memory: 256 MB
   - Timeout: 60 seconds

4. **Переменные окружения:**
   - Нажмите "Runtime settings"
   - Добавьте переменные окружения:
     ```
     GMAIL_USER = ваш_email@gmail.com
     GMAIL_PASSWORD = пароль_из_шага_1
     ```

5. **Разрешения:**
   - Выберите "Allow unauthenticated invocations" (для простоты)
   - Нажмите "Create"

### Через Command Line (альтернативно)

```bash
# 1. Войдите в Google Cloud
gcloud auth login

# 2. Установите проект
gcloud config set project YOUR_PROJECT_ID

# 3. Разверните сервис
gcloud run deploy lunar-alarm-mailer \
  --source cloud-function \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GMAIL_USER=your_email@gmail.com,GMAIL_PASSWORD=your_app_password
```

## Шаг 3: Получение URL

После развертывания Google Cloud выдаст URL вида:
```
https://lunar-alarm-mailer-abc123-eu.a.run.app
```

## Шаг 4: Интеграция в приложение

Замените в `notifications.html`:
```javascript
const response = await fetch('https://YOUR_CLOUD_FUNCTION_URL/sendTestEmail', {
```

На полученный URL:
```javascript
const response = await fetch('https://lunar-alarm-mailer-abc123-eu.a.run.app/sendTestEmail', {
```

## API Endpoints

### Тестовое письмо
```
POST /sendTestEmail
Body: {
  "email": "user@example.com",
  "nick": "Имя пользователя"
}
```

### Напоминание о практике
```
POST /sendPracticeReminder
Body: {
  "email": "user@example.com",
  "nick": "Имя пользователя",
  "time": "07:00"
}
```

### Задание марафона
```
POST /sendMarathonTask
Body: {
  "email": "user@example.com",
  "nick": "Имя пользователя",
  "dayNum": 1,
  "taskContent": "Текст задания дня"
}
```

### Проверка здоровья
```
GET /health
```

## Решение проблем

### Ошибка: "Gmail authentication failed"
- Проверьте, что использован **App Password**, а не обычный пароль
- Убедитесь, что двухфакторная аутентификация включена

### Письма идут в спам
- Добавьте SPF и DKIM записи для вашего домена
- Или используйте SendGrid (更надежный вариант)

### Медленная отправка
- Это нормально для первого запроса (cold start)
- Последующие запросы будут быстрее

## Стоимость

Google Cloud Run предоставляет:
- **2M запросов в месяц** бесплатно
- **400,000 GB-сек** бесплатно (достаточно для 2M запросов по 200ms)

Для вашего приложения этого более чем достаточно!
