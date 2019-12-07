import * as functions from 'firebase-functions';
import getICalLink from './iCalFunctions';
import focusTasksDueToday from './focus-today-task';

export const iCalFunction = functions.pubsub.schedule('0 0 * * *').onRun(() => {
  getICalLink()
    .catch((err) => console.log(err))
    .then(() => {
      console.log('finished getICalLink()');
    })
    .catch((err) => console.log(err));
});

export const FocusTasksDueToday = functions.pubsub.schedule('0 0 * * *').onRun(focusTasksDueToday);
