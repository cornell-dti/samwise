import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
tasks = db.collection(u'samwise-tasks')
cutoff = datetime.datetime.today() - datetime.timedelta(days=(60))
oldTasks = tasks.where(u'date', u'<', cutoff).get()

for task in oldTasks:
    for subtask in task.get(u'children'):
        #TODO: Fix delete children by name not reference
        subtask = db.collection(u'samwise-subtasks').document(subtask).get()
        subtask.delete()
    print(u'Document data: {}'.format(task.to_dict()))
    task.reference.delete()
