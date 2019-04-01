import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import datetime
from firebase_admin import firestore

cred = credentials.Certificate('firebaseadmin.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
tasks = db.collection(u'samwise-tasks')

def key_max_val(d):
     v=list(d.values())
     k=list(d.keys())
     return k[v.index(max(v))]

#int period given in number of days
def tasks_completed_in_period(tasks, period):
    cutoff = datetime.datetime.today() - datetime.timedelta(days=(period))
    completed = tasks.where(
        u'added', u'>=', cutoff).where(u'complete', u'==', True).get()
    return len(completed)

#int period given in number of days
#returns time saved in hours 
def time_saved_in_period(tasks, period):
    cutoff = datetime.datetime.today() - datetime.timedelta(days=(period))
    tasks = tasks.where(
        u'added', u'>=', cutoff).where(u'complete', u'==', True).get()

    hours_saved = 0
    for task in tasks:
        due = task.get(u'date')
        completed = task.get(u'dateCompleted')
        date_difference = due - completed
        hours_saved += date_difference.seconds // 3600

    return hours_saved

def most_completed_tag(db, period):
    cutoff = datetime.datetime.today() - datetime.timedelta(days=(period))
    tasks = db.collection(u'samwise-tasks').where(
        u'added', u'>=', cutoff).where(u'complete', u'==', True).get()
    tags = {}

    for task in tasks:
        if not task.get('tag') in tags:
            tags[task.get('tag')] = 1
        else:
            tags[task.get('tag')] += 1

    tag = db.collection(u'samwise-tags').document(key_max_val(tags)).get('name')

    return tag

def productivity_by_tag(tasks, period, tag):
    tasks = db.collection(u'samwise-tasks').where(u'tag', u'==', tag).get()
    return time_saved_in_period(tasks, period)

# TODO: def days_overdue_in_period():

# TODO: def most_completed_day():


