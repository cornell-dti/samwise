/**
 * This module uses firebase's unique client side ID generator technology to ensure that ID
 * do not collide.
 * Read the following article for more details.
 * https://firebase.googleblog.com/2015/02/the-2120-ways-to-ensure-unique_68.html
 */

import { database } from './db';

/**
 * @returns a safe to use id for a new tag.
 */
export const getNewTagId = (): string => database.tagsCollection().doc().id;

/**
 * @returns a safe to use id for a new task.
 */
export const getNewTaskId = (): string => database.tasksCollection().doc().id;
