import {fromURL} from 'ical';
import {settingsCollection, tasksCollection} from './db';
import getOrder from './order-manager';

export default async function getICalLink() {
    await settingsCollection().where("canvasCalendar", ">", "").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            try {
                parseICal(doc.data()['canvasCalendar'], doc.id);
            } catch {
                console.log("Failed to use this calendar link");
            }
        });
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

export function parseICal(link: string, user: string): void {
    fromURL(link, {}, async function (err, data) {
        const today = new Date();
        for (const k in data) {
            if (data.hasOwnProperty(k)) {
                const ev = data[k];
                if (data[k].type === 'VEVENT') {
                    const taskName = ev['summary'];
                    //the unique id i will use is a concat of the user and event uid because uids are not unique between
                    // users
                    const uid = ev['uid'] + user;
                    const endObject: any = ev['end'];
                    const endDate = endObject === null ? null : new Date(endObject.getTime());
                    const taskID: string = tasksCollection().doc().id;
                    const order: number = await getOrder(user, 'tasks');
                    if (endDate === null) {
                        continue;
                    }
                    if (endDate > today) {
                        await tasksCollection().where("icalUID", "==", uid).get().then(async function (querySnapshot) {
                            if (querySnapshot.size === 0) {
                                await tasksCollection().doc(taskID).set({
                                    children: [],
                                    complete: false,
                                    date: endDate,
                                    inFocus: false,
                                    name: taskName,
                                    order: order,
                                    owner: user,
                                    tag: 'THE_GLORIOUS_NONE_TAG',
                                    type: 'ONE_TIME',
                                    icalUID: uid
                                }).catch((e: Error) => console.log(e));
                            }
                        });
                    }
                }
            }
        }
    });
}