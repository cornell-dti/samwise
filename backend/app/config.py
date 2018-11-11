import os

DEBUG = True
SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24))
