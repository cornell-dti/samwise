import * as functions from 'firebase-functions';
import db from 'db';
import { FirestoreGroup } from 'common/types/firestore-types';
import getICalLink from './iCalFunctions';
import focusTasksDueToday from './focus-today-task';
import removeOldTasks from './remove-old-tasks';
// import sendEmail from './send-email';

export const iCalFunction = functions.pubsub.schedule('0 0 * * *').onRun(getICalLink);

export const FocusTasksDueToday = functions.pubsub.schedule('0 0 * * *').onRun(focusTasksDueToday);

export const RemoveOldTasks = functions.pubsub.schedule('0 0 * * *').onRun(removeOldTasks);

export const sendNotificationEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
  // const { name, email } = context.auth.token;
  const { email } = context.auth.token;
  const { recipientEmail, groupId } = data;
  console.log(recipientEmail);
  // const recipientName = (await db.usersCollection().doc(recipientEmail).get()).data();
  const group: FirestoreGroup = (
    await db.groupsCollection().doc(groupId)?.get()
  ).data() as FirestoreGroup;
  if (group && group.members.includes(email as string) && group.members.includes(recipientEmail)) {
    return 'we can send the email';
  }

  return [group, group.members, email, recipientEmail, 'we have a problem'];
});
