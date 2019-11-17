import {fromURL} from 'ical';
import {tasksCollection} from './db';
import getOrder from './order-manager';

//todo make this work with repeating tasks & support tags
let calLink: string = 'http://p49-caldav.icloud.com/published/2/MjU1MjYxMDc0MjQyNTUyNrbuSqmZmLMJBaHe_zS6XS6_mwNxYp-dEIrIBLSXyiw7';
let user: string = "jt568@cornell.edu";

function parseICal(link: string, user: string): void {
    fromURL(link, {}, async function (err, data) {
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                var ev = data[k];
                if (data[k].type == 'VEVENT') {
                    const taskName = ev['summary'];
                    const endDate = ev['end'] == undefined ? new Date() : new Date(ev['end']);
                    const taskID: string = tasksCollection().doc().id;
                    const order: number = await getOrder('tasks');
                    await tasksCollection().doc(taskID).set({
                        children: [],
                        complete: endDate <= new Date(),
                        date: endDate,
                        inFocus: false,
                        name: taskName,
                        order: order,
                        owner: user,
                        tag: 'THE_GLORIOUS_NONE_TAG',
                        type: 'ONE_TIME'
                    }).catch((e: Error) => console.log(e));
                }
            }
        }
    });
}

parseICal(calLink, user);