import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore
from collections import Counter
import pytz

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
actions = db.collection(u'samwise-user-actions')

min_day = datetime.datetime(2019, 3, 3, )
today = datetime.datetime.now()
num_days = ((today-min_day).days)

usernames = set()
for ob in actions.get():
    usernames.add(ob.get('user'))

all_actions = ['editTask', 'editTag', 'deleteTag', 'createSubTask', 
'completeFocusedTask', 'deleteTask', 'createTag', 'focusTask', 'completeTask',
 'createTask', 'deleteSubTask']

#create daily sum for actions
for user in usernames:
    for i in range(num_days):
        start = min_day + datetime.timedelta(days=(i))
        end = start + datetime.timedelta(days=(1))
        start = start.replace(tzinfo=pytz.UTC)
        end = end.replace(tzinfo=pytz.UTC)
        user_elems = actions.where('user', '==', user).get()
        my_dict = { el.id: el.to_dict() for el in user_elems }
        result = Counter()
        for temp, entry in my_dict.items():
            if start <= entry['time'] < end:
                for key, value in entry['actions'].items():
                    result[key] += value

        if (len(result) == 0):
            continue
        print("not empty")
        for action in all_actions:
            result[action] += 0
        sum_day = {
            'actions': dict(result),
            'time': start,
            'user': user,
            'type': 'DAILY' 
        }
        db.collection('fake-user-actions').add(sum_day)