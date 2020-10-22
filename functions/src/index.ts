import * as functions from 'firebase-functions';
import migrateTaskOwners from 'migrate-task-owner';
import getICalLink from './iCalFunctions';
import focusTasksDueToday from './focus-today-task';
import removeOldTasks from './remove-old-tasks';

export const iCalFunction = functions.pubsub.schedule('0 0 * * *').onRun(getICalLink);

export const FocusTasksDueToday = functions.pubsub.schedule('0 0 * * *').onRun(focusTasksDueToday);

export const RemoveOldTasks = functions.pubsub.schedule('0 0 * * *').onRun(removeOldTasks);

export const MigrateTaskOwners = functions.pubsub.schedule('0 0 * * *').onRun(migrateTaskOwners);
