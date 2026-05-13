gcloud scheduler jobs create pubsub send-marathon-daily --location=us-central1 --schedule="0 7 * * *" --topic=marathon-emails --message-body="{}"
