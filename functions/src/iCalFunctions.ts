/* eslint-disable no-await-in-loop */
import fetch from 'node-fetch';
import icalParse from './ical-parser';
import { settingsCollection, tasksCollection }
  from '../../frontend/src/firebase/db';
import getOrder from '../../frontend/src/firebase/order-manager';

process.env.TZ = 'America/New_York';

export default async function getICalLink(): Promise<void> {
  await settingsCollection()
    .where('canvasCalendar', '>', '')
    .get()
    .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
      querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
        try {
          parseICal(doc.data().canvasCalendar, doc.id);
        } catch {
          console.log('Failed to use this calendar link');
        }
      });
    })
    .catch((error: Error) => {
      console.log('Error getting documents: ', error);
    });
}

export function parseICal(link: string, user: string): void {
  // @ts-ignore
  fetch(link, { mode: 'GET' })
    .then((response: Response) => response.text())
    .then(async (data: string) => {
      const eventArray = icalParse(data);
      const today = new Date();
      for (let i = 0; i < eventArray.length; i += 1) {
        const ev = eventArray[i];
        const taskName = ev.name;
        // the unique id i will use is a concat of the user and event uid,
        // because uids are not unique between users.
        const uid = ev.uid + user;
        // const endObject: Date & { tz: string } = ev.date as any;
        const endObject = new Date(ev.date);
        if (endObject == null) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const endDate = new Date(endObject.getTime());
        const taskID: string = tasksCollection().doc().id;
        const order: number = await getOrder('tasks');
        if (endDate > today) {
          await tasksCollection()
            .where('icalUID', '==', uid)
            .get()
            .then(async (querySnapshot: firebase.firestore.QuerySnapshot) => {
              if (querySnapshot.size === 0) {
                await tasksCollection()
                  .doc(taskID)
                  .set({
                    children: [],
                    complete: false,
                    date: endDate,
                    inFocus: false,
                    name: taskName,
                    order,
                    owner: user,
                    tag: 'THE_GLORIOUS_NONE_TAG',
                    type: 'ONE_TIME',
                    icalUID: uid,
                  })
                  .catch((e: Error) => console.log(e));
              } else {
                querySnapshot.forEach(
                  (doc: firebase.firestore.QueryDocumentSnapshot) => {
                    tasksCollection()
                      .doc(doc.id)
                      .update({
                        name: taskName,
                        date: endDate,
                      });
                  },
                );
              }
            });
        }
      }
    });
}
