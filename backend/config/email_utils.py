from email.message import EmailMessage
import aiosmtplib
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

async def send_reset_email(to_email: str, reset_link: str):
    message = EmailMessage()
    message["From"] = EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = "Restablece tu contraseña - TaskProX"
    message.set_content(f"""
Hola,

Has solicitado restablecer tu contraseña en TaskProX.

Haz clic en el siguiente enlace para crear una nueva contraseña (válido por 15 minutos):

{reset_link}

Si no solicitaste este cambio, puedes ignorar este mensaje.

Saludos,
Equipo - TaskProX
""")

    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=EMAIL_FROM,
            password=EMAIL_PASSWORD
        )
    except Exception as e:
        print("[ERROR] No se pudo enviar el correo:", e)
        raise e
