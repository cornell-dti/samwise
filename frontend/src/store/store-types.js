// @flow strict

export type TagType = 'class' | 'other';

export type Tag = {|
  +id: number;
  +type: TagType;
  +name: string;
  +color: string;
|};

export type SubTask = {|
  +id: number; // Example: 32432
  +name: string; // Example: "SubTask 1 Name"
  +complete: boolean;
  +inFocus: boolean; // Whether the subtask is in focus
|};

/**
 * The subtask type without id and with every field as optional.
 */
export type PartialSubTask = $Shape<$Diff<SubTask, {| +id: number; |}>>

/**
 * The task in the store.
 */
export type Task = {|
  +id: number; // Example: 3213
  +name: string; // Example: "Task 1 name"
  +tag: number; // ID of the tag
  +date: Date; // Example: new Date()
  +complete: boolean;
  +inFocus: boolean; // Whether the task is in focus
  +subtasks: SubTask[];
|};

/**
 * The task type without id and subtask.
 */
export type MainTask = $Diff<Task, {| +id: number; +subtasks: SubTask[]; |}>;
/**
 * The task type without id and subtask, and with all properties as optional.
 */
export type PartialMainTask = $Shape<MainTask>;

/**
 * The type of a course info entry.
 */
export type Course = {|
  +courseId: number;
  +subject: string;
  +courseNumber: string;
  +title: string;
  +examTimes: string[];
|};

/**
 * The cache that is designed to store the stuff that can be undo.
 */
export type UndoCache = {|
  +lastAddedTaskId: number | null;
  +lastDeletedTask: Task | null;
|};

/**
 * The type of the entire redux state.
 */
export type State = {|
  +tasks: Task[];
  +tags: Tag[];
  +courses: Course[];
  +undoCache: UndoCache;
|};
