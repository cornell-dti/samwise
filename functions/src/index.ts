import * as functions from 'firebase-functions';
import getICalLink from "./iCalFunctions";

export default function autoGrabICal() {
    functions.pubsub.schedule('0 0 * * *').onRun((context:functions.EventContext) => {
        getICalLink().catch(err => console.log(err)).then(r => {
            console.log("finished getICalLink()")
        }) .catch(err => console.log(err));
    });
}
