import * as functions from 'firebase-functions';
import sgMail from '@sendgrid/mail';
import { FirestoreGroup, FirestoreUserData } from 'common/types/firestore-types';
import db from 'db';
import sendgridKey from './sendgrid-key.json';

sgMail.setApiKey(sendgridKey.SENDGRID_API_KEY);

type Data = {
  data: {
    variant: string;
    recipientEmail: string;
    groupId: string;
  };
};

const sendEmail = async (data: Data, context: functions.https.CallableContext): Promise<string> => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
  const { email } = context.auth.token;
  const { recipientEmail, groupId } = data.data;
  let { variant } = data.data;

  // default variant
  if (!['hug', 'bell'].includes(variant)) {
    variant = 'hug';
  }
  const recipient: FirestoreUserData = (
    await db.usersCollection().doc(recipientEmail)?.get()
  ).data() as FirestoreUserData;
  const sender: FirestoreUserData = (
    await db.usersCollection().doc(email)?.get()
  ).data() as FirestoreUserData;
  const group: FirestoreGroup = (
    await db.groupsCollection().doc(groupId)?.get()
  ).data() as FirestoreGroup;

  const recipientName = recipient.name.split(' ')[0];
  const senderName = sender.name.split(' ')[0];
  const msg = {
    to: recipientEmail,
    from: 'jt568@cornell.edu',
    subject: `You got a ${variant}!`,
    text: `${senderName} from ${group.name} is sending you a ${variant}!`,
    html: `${senderName} from ${group.name} is sending you a ${variant}!`,
  };

  if (group && group.members.includes(email as string) && group.members.includes(recipientEmail)) {
    return sgMail
      .send(msg)
      .then(() => {
        return 'sent';
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        return `${error} error in sending ${variant} from ${senderName} to ${recipientName}`;
      });
  }

  return 'the members are not all in the correct group';
};

export default sendEmail;
