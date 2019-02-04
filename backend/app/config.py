import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = os.environ.get('DEBUG', '').lower() == 'true'
SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24))
