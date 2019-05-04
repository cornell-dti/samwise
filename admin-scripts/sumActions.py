import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore
from collections import Counter
import pytz
from dateutil.relativedelta import relativedelta

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
actions = db.collection(u'fake-user-actions')

min_day = datetime.datetime(2019, 3, 3, )
today = datetime.datetime.now()
num_days = ((today-min_day).days)

usernames = set()
for ob in actions.get():
    usernames.add(ob.get('user'))

all_actions = ['editTask', 'editTag', 'deleteTag', 'createSubTask', 
'completeFocusedTask', 'deleteTask', 'createTag', 'focusTask', 'completeTask',
 'createTask', 'deleteSubTask']

#adding daily sum
for user in usernames:
    for i in range(num_days+1):
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

        for action in all_actions:
            result[action] += 0
        sum_day = {
            'actions': dict(result),
            'time': start,
            'user': user,
            'type': 'DAILY' 
        }
        db.collection('fake-user-actions').add(sum_day)

print("starting weekly")
idx = (min_day.weekday() + 1) % 7 
first_sun = min_day - datetime.timedelta(7+idx)

end_goal = today + datetime.timedelta(days=(7))
end_goal = end_goal.replace(tzinfo=pytz.UTC)

for user in usernames:
    start = first_sun
    end = start + datetime.timedelta(days=(7))
    start = start.replace(tzinfo=pytz.UTC)
    end = end.replace(tzinfo=pytz.UTC)
    while(end < end_goal):
]]
        user_elems = db.collection('fake-user-actions').where('user', '==', user).where('type', '==', 'DAILY').get()
        my_dict = { el.id: el.to_dict() for el in user_elems }
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
            'user': user,
            'type': 'WEEKLY' 
        }
        db.collection('fake-user-actions').add(sum_day)
        end = end + datetime.timedelta(days=(7))
        end = end.replace(tzinfo=pytz.UTC)


print("starting monthly")
#adding monthly sum
num_months = today.month - min_day.month
first_month = min_day.month

for user in usernames:
     for i in range(num_months+1):
        start = datetime.datetime(2019, first_month + i, 1)
        end = start + relativedelta(months=+1)
        start = start.replace(tzinfo=pytz.UTC)
        end = end.replace(tzinfo=pytz.UTC)
        user_elems = db.collection('fake-user-actions').where('user', '==', user).where('type', '==', 'DAILY').get()
        my_dict = { el.id: el.to_dict() for el in user_elems }
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
            'user': user,
            'type': 'MONTHLY' 
        }
        db.collection('fake-user-actions').add(sum_day)