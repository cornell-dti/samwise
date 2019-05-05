import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
tasks = db.collection(u'samwise-user-actions').get()

for task in tasks:
    db.collection(u'samwise-user-actions').document(task.id).set({'type': 'HOURLY'}, merge=True)