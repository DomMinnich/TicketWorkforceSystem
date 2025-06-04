import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

def send_email(receiver_email, subject, email_message):
    sender_email = Config.SYSTEM_EMAIL_NAME
    password = Config.SYSTEM_EMAIL_PASSWORD

    if not sender_email or not password:
        print("Email sender credentials not configured. Skipping email.")
        return

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(MIMEText(email_message, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print(f"Email notification sent successfully to {receiver_email}.")
    except Exception as e:
        print(f"Error sending email notification to {receiver_email}: {e}")

def send_report_email(subject, content):
    receiver_email = Config.FEEDBACK_EMAIL
    if not receiver_email:
        print("Feedback email not configured. Skipping report email.")
        return
    send_email(receiver_email, subject, content)