import {fromURL} from 'ical'
import {getNewTaskId} from '../frontend/src/firebase/id-provider'
import getOrder from '../frontend/src/firebase/order-manager'
import {CommonTask, OneTimeTask} from '../frontend/src/store/store-types'
import {TaskWithoutIdOrderChildren} from "../frontend/src/firebase/actions";

//todo make this work with repeating tasks & support tags
let calLink: string = 'http://p49-caldav.icloud.com/published/2/MjU1MjYxMDc0MjQyNTUyNrbuSqmZmLMJBaHe_zS6XS6_mwNxYp-dEIrIBLSXyiw7';

function parseICal(link: string): void {
    fromURL(link, {}, async function (err, data) {
        // console.log(err);
        // console.log(data);
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                var ev = data[k];
                if (data[k].type == 'VEVENT') {
                    const taskName = ev['summary'];
                    const endDate = new Date(ev['end']);
                    const taskID: string = getNewTaskId();
                    const order: number = await getOrder('tasks');
                    const tag: string = "THE_GLORIOUS_NONE_TAG";
                    const children: Set<string> = new Set<string>();
                    const newTask: CommonTask<Date> = {
                        id: taskID,
                        order: order,
                        name: taskName,
                        tag: tag,
                        date: endDate,
                        complete: false,
                        inFocus: false,
                        children: children
                    };
                    const newTaskOneTime:OneTimeTask = newTask & {};
                    const taskWrapper:TaskWithoutIdOrderChildren =
                }
            }
        }
    }
}

)
;
}

parseICal(calLink);