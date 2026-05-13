gcloud functions deploy send-marathon-emails --runtime python311 --trigger-topic marathon-emails --entry-point отправить_письма_марафона --memory 256MB --timeout 60s --region us-central1
