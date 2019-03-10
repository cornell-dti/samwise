// @flow strict

import type { Map, Set } from 'immutable';

export type Tag = {|
  +id: string;
  +order: number;
  +name: string;
  +color: string;
  +classId: string | null;
|};

export type SubTask = {|
  +id: string;
  +order: number;
  +name: string; // Example: "SubTask 1 Name"
  +complete: boolean;
  +inFocus: boolean; // Whether the subtask is in focus
|};

/**
 * The subtask type without id and with every field as optional.
 */
export type PartialSubTask = $Shape<$Diff<SubTask, {| +id: string; |}>>

export type Task = {|
  +id: string;
  +order: number;
  +name: string; // Example: "Task 1 name"
  +tag: string; // ID of the tag
  +date: Date; // Example: new Date()
  +complete: boolean;
  +inFocus: boolean; // Whether the task is in focus
  +children: Set<string>;
|};

/**
 * The task type without id and subtask.
 */
export type MainTask = $ReadOnly<$Diff<Task, {| +id: string; +children: Set<string>; |}>>;
/**
 * The task type without id and subtask, and with all properties as optional.
 */
export type PartialMainTask = $Shape<MainTask>;

/**
 * The type of user settings.
 */
export type Settings = {|
  +completedOnboarding: boolean;
  +theme: 'light' | 'dark';
|};

/**
 * The type of a course info entry.
 */
export type Course = {|
  +courseId: number;
  +subject: string;
  +courseNumber: string;
  +title: string;
  +examTimes: {| +type: 'final' | 'prelim', +time: number |}[];
|};

/**
 * The type of the entire redux state.
 */
export type State = {|
  +tags: Map<string, Tag>;
  +tasks: Map<string, Task>;
  +dateTaskMap: Map<string, Set<string>>;
  +subTasks: Map<string, SubTask>;
  +taskChildrenMap: Map<string, Set<string>>;
  +settings: Settings;
  +courses: Map<string, Course[]>;
|};