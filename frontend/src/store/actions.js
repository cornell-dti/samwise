// @flow strict

import type { Map } from 'immutable';
import type {
  PatchCourses,
  PatchSubTasks,
  PatchTags,
  PatchTasks,
} from './action-types';
import type {
  Course,
  Tag,
  Task,
  SubTask,
} from './store-types';

export const patchTags = (created: Tag[], edited: Tag[], deleted: string[]): PatchTags => ({
  type: 'PATCH_TAGS', created, edited, deleted,
});

export const patchTasks = (created: Task[], edited: Task[], deleted: string[]): PatchTasks => ({
  type: 'PATCH_TASKS', created, edited, deleted,
});

export const patchSubTasks = (
  created: SubTask[], edited: SubTask[], deleted: string[],
): PatchSubTasks => ({
  type: 'PATCH_SUBTASKS', created, edited, deleted,
});

export const patchCourses = (courses: Map<number, Course[]>): PatchCourses => ({
  type: 'PATCH_COURSES', courses,
});
