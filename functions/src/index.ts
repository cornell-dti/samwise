import * as functions from 'firebase-functions';
import getICalLink from './iCalFunctions';

functions.pubsub.schedule('0 0 * * *').onRun(() => {
  getICalLink()
    .catch((err) => console.log(err))
    .then(() => {
      console.log('finished getICalLink()');
    })
    .catch((err) => console.log(err));
});
