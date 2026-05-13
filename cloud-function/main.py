import functions_framework
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.cloud import firestore
from google.cloud import secretmanager
from datetime import datetime


def получить_секрет(идентификатор_секрета, версия="latest"):
    """Получить секрет из Google Cloud Secret Manager"""
    клиент = secretmanager.SecretManagerServiceClient()
    проект_ид = "budilnik-notifications"
    имя = f"projects/{проект_ид}/secrets/{идентификатор_секрета}/versions/{версия}"
    ответ = клиент.access_secret_version(request={"name": имя})
    return ответ.payload.data.decode("UTF-8")


def отправить_письмо(адрес_получателя, тема, содержание_html):
    """Отправить письмо через Gmail SMTP"""
    try:
        # Получить пароль приложения Gmail из Secret Manager
        пароль_гмаил = получить_секрет("gmail-app-password")
        адрес_отправителя = "wuallar@gmail.com"

        # Создать сообщение
        сообщение = MIMEMultipart("alternative")
        сообщение["Subject"] = тема
        сообщение["From"] = адрес_отправителя
        сообщение["To"] = адрес_получателя

        # Добавить HTML содержание
        часть = MIMEText(содержание_html, "html")
        сообщение.attach(часть)

        # Отправить через Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as сервер:
            сервер.login(адрес_отправителя, пароль_гмаил)
            сервер.sendmail(адрес_отправителя, адрес_получателя, сообщение.as_string())

        return True
    except Exception as e:
        print(f"Ошибка отправки письма {адрес_получателя}: {str(e)}")
        return False


@functions_framework.cloud_event
def отправить_письма_марафона(cloud_event):
    """Основная функция для отправки писем напоминаний о марафоне"""
    бд = firestore.client()

    try:
        # Получить неотправленные письма из очереди
        очередь_рассылки = бд.collection("mailing_queue").where("sent", "==", False).stream()

        отправлено = 0
        ошибок = 0

        for док in очередь_рассылки:
            запись = док.to_dict()
            получатель = запись.get("email")
            тема = запись.get("subject", "🌙 Лунный марафон - напоминание о практике")
            содержание = запись.get("htmlContent", "")

            if отправить_письмо(получатель, тема, содержание):
                # Отметить как отправленное
                бд.collection("mailing_queue").document(док.id).update({
                    "sent": True,
                    "sentAt": datetime.now()
                })
                отправлено += 1
            else:
                ошибок += 1

        print(f"Писем отправлено: {отправлено}, Ошибок: {ошибок}")
        return {"status": "success", "отправлено": отправлено, "ошибок": ошибок}

    except Exception as e:
        print(f"Ошибка Cloud Function: {str(e)}")
        return {"status": "error", "сообщение": str(e)}, 500
