// @flow strict

export type Tag = {|
  +id: string;
  +order: number;
  +name: string;
  +color: string;
  +classId: number | null;
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

/**
 * The task in the store.
 */
export type Task = {|
  +id: string;
  +order: number;
  +name: string; // Example: "Task 1 name"
  +tag: string; // ID of the tag
  +date: Date; // Example: new Date()
  +complete: boolean;
  +inFocus: boolean; // Whether the task is in focus
  +subtasks: SubTask[];
|};

/**
 * The task type without id and subtask.
 */
export type MainTask = $Diff<Task, {| +id: string; +subtasks: SubTask[]; |}>;
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
 * The type of the entire redux state.
 */
export type State = {|
  +tasks: Task[];
  +tags: Tag[];
  +courses: Map<number, Course[]>;
|};
