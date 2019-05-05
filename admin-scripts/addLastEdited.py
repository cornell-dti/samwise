import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
tasks = db.collection(u'samwise-fake-tasks').get()

for task in tasks:
    db.collection(u'samwise-fake-tasks').document(task.id).set({'lastEdited': firestore.SERVER_TIMESTAMP}, merge=True)

tasks = db.collection(u'samwise-subtasks').get()

for task in subtasks:
    db.collection(u'samwise-user-actions').document(task.id).set({'lastEdited': firestore.SERVER_TIMESTAMP}, merge=True)

tags = db.collection(u'samwise-tags').get()

for tag in tags:
    db.collection(u'samwise-tags').document(task.id).set({'lastEdited': firestore.SERVER_TIMESTAMP}, merge=True)

settings = db.collection(u'samwise-settings').get()

for setting in settings:
    db.collection(u'samwise-settings').document(task.id).set({'lastEdited': firestore.SERVER_TIMESTAMP}, merge=True)