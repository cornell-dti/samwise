import firebase_admin
import json
from app import config
from firebase_admin import credentials, auth

firebase_config_string = config.FIREBASE_CONFIG
if firebase_config_string.startswith('{'):
    cred_obj = json.loads(firebase_config_string)
else:
    cred_obj = firebase_config_string

cred = credentials.Certificate(cred_obj)
default_app = firebase_admin.initialize_app(cred)
