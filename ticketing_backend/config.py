import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/tickets.db' # SQLite database path
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Email settings
    SYSTEM_EMAIL_NAME = os.getenv('SYSTEM_EMAIL_NAME')
    SYSTEM_EMAIL_PASSWORD = os.getenv('SYSTEM_EMAIL_PASSWORD')
    FEEDBACK_EMAIL = os.getenv('FEEDBACK_EMAIL')
    SUPER_ADMIN_EMAIL = os.getenv('SUPER_ADMIN_EMAIL').lower() if os.getenv('SUPER_ADMIN_EMAIL') else None

    # Authentication Codes (consider more secure ways to handle this in production)
    AUTH_CODE = os.getenv('AUTH_CODE')
    ADMIN_AUTH_CODE = os.getenv('ADMIN_AUTH_CODE')

    # File Uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx'}

    # Google Gemini AI (optional)
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

    # License Expiration
    LICENSE_EXPIRATION_URL = os.getenv('LICENSE_EXPIRATION_URL', "https://example.com/license_expiration")
    LICENSE_EXPIRATION_DEFAULT = os.getenv('LICENSE_EXPIRATION_DEFAULT', "2026-01-01")