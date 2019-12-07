/* eslint-disable no-await-in-loop */
import { fromURL } from 'ical';
import OrderManager from 'common/lib/firebase/order-manager';
import database from './db';


export default async function getICalLink(): Promise<void> {
  await database.settingsCollection()
    .where('canvasCalendar', '>', '')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        try {
          parseICal(doc.data().canvasCalendar, doc.id);
        } catch {
          console.log('Failed to use this calendar link');
        }
      });
    })
    .catch((error) => {
      console.log('Error getting documents: ', error);
    });
}

export function parseICal(link: string, user: string): void {
  const orderManager = new OrderManager(database, () => user);
  fromURL(link, {}, async (_, data) => {
    const today = new Date();
    for (const k in data) {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(k)) {
        const ev = data[k];
        if (data[k].type === 'VEVENT') {
          const taskName = ev.summary;
          // the unique id i will use is a concat of the user and event uid,
          // because uids are not unique between users.
          const uid = ev.uid + user;
          const endObject: any = ev.end;
          const endDate = endObject === null ? null : new Date(endObject.getTime());
          const taskID: string = database.tasksCollection().doc().id;
          const order: number = await orderManager.allocateNewOrder('tasks');
          if (endDate === null) {
            // eslint-disable-next-line no-continue
            continue;
          }
          if (endDate > today) {
            await database.tasksCollection()
              .where('icalUID', '==', uid)
              .get()
              .then(async (querySnapshot) => {
                if (querySnapshot.size === 0) {
                  await database.tasksCollection()
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
                  querySnapshot.forEach((doc) => {
                    tasksCollection()
                      .doc(doc.id)
                      .update({
                        name: taskName,
                        date: endDate,
                      });
                  });
                }
              });
          }
        }
      }
    }
  });
}
