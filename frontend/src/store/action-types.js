// @flow strict

import type { Map } from 'immutable';
import type {
  Course, SubTask, Tag, Task,
} from './store-types';

export type PatchTags = {|
  type: 'PATCH_TAGS';
  +created: Tag[];
  +edited: Tag[];
  +deleted: string[];
|};

export type PatchTasks = {|
  type: 'PATCH_TASKS';
  +created: Task[];
  +edited: Task[];
  +deleted: string[];
|};

export type PatchSubTasks = {|
  type: 'PATCH_SUBTASKS';
  +created: SubTask[];
  +edited: SubTask[];
  +deleted: string[];
|};

export type PatchCourses = {|
  type: 'PATCH_COURSES';
  +courses: Map<number, Course[]>;
|};

export type Action =
  | PatchTags
  | PatchTasks
  | PatchSubTasks
  | PatchCourses;
