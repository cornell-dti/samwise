// @flow strict

import type { PatchStoreAction } from './action-types';
import type { Course, Tag, Task } from './store-types';

/**
 * @see PatchStoreAction
 */
export const patchStoreAction = (
  tags: Tag[] | null, tasks: Task[] | null, courses: Map<number, Course[]> | null,
): PatchStoreAction => ({
  type: 'PATCH_STORE', tags, tasks, courses,
});
