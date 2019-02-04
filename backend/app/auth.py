import firebase_admin
import yaml
import json
from app import config
from firebase_admin import credentials, auth

firebase_config_string = config.FIREBASE_CONFIG
if firebase_config_string.startswith('{'):
    cred_obj = yaml.load(firebase_config_string)
    cred_obj['private_key'] = \
        cred_obj['private_key'].replace(' ', '\n').replace(
            '-----BEGIN\nPRIVATE\nKEY-----',
            '-----BEGIN PRIVATE KEY-----').replace(
            '-----END\nPRIVATE\nKEY-----', '-----END PRIVATE KEY-----')
else:
    cred_obj = firebase_config_string

cred = credentials.Certificate(cred_obj)
default_app = firebase_admin.initialize_app(cred)
