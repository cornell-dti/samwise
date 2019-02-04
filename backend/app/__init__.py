"""
Initialize the flask app and database connection.

Based on the link below:
https://www.digitalocean.com/community/tutorials/how-to-structure-large-flask-applications
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app import config
import os

app = Flask(__name__, static_folder=os.path.abspath('static'))
app.config.from_object(config)
db = SQLAlchemy(app)

from app.api.views import api

app.register_blueprint(api)
