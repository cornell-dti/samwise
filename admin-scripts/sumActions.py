import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore
from collections import Counter

def get_records(docs, start_date, end_date):
    for temp, entry in docs.items():
        print(start_date)
        print(end_date)
        print(entry['time'])
        if start_date <= entry['time'] < end_date:
            print(entry)

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
actions = db.collection(u'samwise-user-actions')

min_time = actions.order_by('time').limit(1).get()
for ob in min_time:
    min_time = ob.get('time')

min_day = datetime.datetime(2019, 3, 3)
today = datetime.datetime.now()
num_days = ((today-min_day).days)

usernames = set()
for ob in actions.get():
    usernames.add(ob.get('user'))

print(usernames)
for user in usernames:
    start = min_day + datetime.timedelta(days=(0))
    end = start + datetime.timedelta(days=(1))
    user_elems = actions.where('user', '==', user).get()
    my_dict = { el.id: el.to_dict() for el in user_elems }
    get_records(my_dict, start, end)
    print(my_dict)
    # for i in range(num_days):
    #     start = min_day + datetime.timedelta(days=(i))
    #     end = start + datetime.timedelta(days=(1))
        

    #     print(day)
    #     result = Counter()
    #     for ob in day:
    #         elem = ob.get('actions')
    #         for key, value in elem.items():
    #             result[key] += value

    #     sum_day = {
    #         'actions': dict(result),
    #         'time': start,
    #         'user': user,
    #         'type': 'DAILY' 
    #     }

    #     print(sum_day)


#daily sum
# user = 'my474@cornell.edu'
# day = actions.where('user', '=', user).where('time', '>', min_time).where('time', '<=', min_time + datetime.timedelta(days=(1))).get()
# result = Counter()
# for ob in day:
#     elem = ob.get('actions')
#     for key, value in elem.items():
#         result[key] += value

# actions.add


#weekly sum

#monthly sum
