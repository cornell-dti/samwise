import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate('app/serviceAccount.json')
default_app = firebase_admin.initialize_app(cred)
