// @flow strict

import type { Map } from 'immutable';
import type {
  Course, SubTask, Tag, Task,
} from './store-types';

export type PatchStoreTags = {|
  type: 'PATCH_TAGS';
  +created: Tag[];
  +edited: Tag[];
  +deleted: string[];
|};

export type PatchStoreTasks = {|
  type: 'PATCH_TASKS';
  +createdTasks: Task[];
  +createdSubTasks: SubTask[];
  +editedTasks: Task[];
  +editedSubTasks: SubTask[];
  +deletedTasks: string[];
  +deletedSubTasks: string[];
|};

export type PatchStoreCourses = {|
  type: 'PATCH_COURSES';
  +courses: Map<number, Course[]>;
|};

export type Action = PatchStoreTags | PatchStoreTasks | PatchStoreCourses;
