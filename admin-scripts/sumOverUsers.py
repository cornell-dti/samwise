import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
actions = db.collection(u'fake-user-actions')

min_day = datetime.datetime(2019, 3, 3, )
today = datetime.datetime.now()
num_hours = ((today-min_day).hours)

all_actions = ['editTask', 'editTag', 'deleteTag', 'createSubTask', 
'completeFocusedTask', 'deleteTask', 'createTag', 'focusTask', 'completeTask',
 'createTask', 'deleteSubTask']


elems = actions.get()
my_dict = { el.id: el.to_dict() for el in elems }

for i in range(num_hours+1):
    start = min_day + datetime.timedelta(hours=(i))
    end = start + datetime.timedelta(hours=(1))
    start = start.replace(tzinfo=pytz.UTC)
    end = end.replace(tzinfo=pytz.UTC)
    result = Counter()
    for temp, entry in my_dict.items():
        if start <= entry['time'] < end:
            for key, value in entry['actions'].items():
                result[key] += value

    if (len(result) == 0):
        continue

    for action in all_actions:
        result[action] += 0
    sum_day = {
        'actions': dict(result),
        'time': start,
        'user': 'all',
        'type': 'HOURLY' 
    }
    db.collection('fake-user-actions').add(sum_day)