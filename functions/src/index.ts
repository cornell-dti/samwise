import * as functions from 'firebase-functions';
import sgMail from '@sendgrid/mail';
import getICalLink from './iCalFunctions';
import focusTasksDueToday from './focus-today-task';
import removeOldTasks from './remove-old-tasks';
import sendgridKey from './sendgrid-key.json';
import sendEmail from './send-email';

sgMail.setApiKey(sendgridKey.SENDGRID_API_KEY);

export const iCalFunction = functions.pubsub.schedule('0 0 * * *').onRun(getICalLink);

export const FocusTasksDueToday = functions.pubsub.schedule('0 0 * * *').onRun(focusTasksDueToday);

export const RemoveOldTasks = functions.pubsub.schedule('0 0 * * *').onRun(removeOldTasks);

export const sendNotificationEmail = functions.https.onCall(sendEmail);
