import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-change-in-prod'
    DATABASE = os.path.join(os.getcwd(), 'dashboard.db')
    DEBUG = os.environ.get('FLASK_DEBUG', False)