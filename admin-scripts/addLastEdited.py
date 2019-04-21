import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
tasks = db.collection(u'samwise-tasks').get()

for task in tasks:
    task.set({'lastEdited': datetime.datetime.now()}, merge=True)

tasks = db.collection(u'samwise-subtasks').get()

for task in subtasks:
    task.set({'lastEdited': datetime.datetime.now()}, merge=True)