// @flow strict

import type { Course, Tag, Task } from './store-types';

/**
 * Used to patch the redux store with data from firebase.
 */
export type PatchStoreAction = {|
  type: 'PATCH_STORE';
  +tags: Tag[] | null; // all the tags from backend
  +tasks: Task[] | null; // all the tasks from backend
  +courses: Map<number, Course[]> | null; // all the courses from backend
|};

export type Action = PatchStoreAction;
