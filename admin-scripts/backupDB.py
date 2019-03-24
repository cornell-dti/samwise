import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore
import json

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
tasks = db.collection(u'samwise-fake-tasks')
cutoff = datetime.datetime.today() - datetime.timedelta(hours=(10))
backupTasks = tasks.where(u'added', u'>=', cutoff).get()
backup = {}

for task in backupTasks:
    backup[task.id] = task.to_dict()
    children = []
    for subtask in task.get(u'children'):
        subtask = db.collection(u'samwise-subtasks').document(subtask).get()
        children.append({subtask.id: subtask.to_dict()})
    backup[task.id]['children']= children
    print(task.get('added'))
    backup[task.id]['added']= str(task.get('added'))

print(u'Backup data: {}'.format(backup))

#not sure if should append or write new
with open('result.json', 'a') as fp:
    json.dump(backup, fp, indent=4)
