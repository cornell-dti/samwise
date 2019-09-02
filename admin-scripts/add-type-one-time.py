import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate("firebaseadmin.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


def chunks(list, n):
    chunk = []
    for item in list:
        if len(chunk) == n:
            yield chunk
            chunk = []
        chunk.append(item)
    if len(chunk) > 0:
        yield chunk


def main() -> None:
    tasks = db.collection("samwise-tasks").stream()
    # A batch can update at most 500 objects at a time.
    for task_chunk in chunks(tasks, 500):
        batch = db.batch()
        for task in task_chunk:
            task_ref = db.collection("samwise-tasks").document(task.id)
            batch.update(task_ref, {"type": "ONE_TIME"})
        batch.commit()


main()
