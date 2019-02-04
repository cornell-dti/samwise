import os
from dotenv import load_dotenv

load_dotenv(override=True)

PORT = os.environ.get('PORT', 5000)
DEBUG = os.environ.get('DEBUG', '').lower() == 'true'
SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24))
