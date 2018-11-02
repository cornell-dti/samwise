// @flow

export type SubTask = {|
  +name: string; // Example: "SubTask 1 Name"
  +id: number; // Example: 32432
  +complete: boolean;
  +inFocus: boolean; // Whether the subtask is in focus
|};

/**
 * The task in the store.
 */
export type Task = {|
  +name: string; // Example: "Task 1 name"
  +id: number; // Example: 3213
  +tag: string; // Example: "CS 2112"
  +date: Date; // Example: new Date()
  +complete: boolean;
  +inFocus: boolean; // Whether the task is in focus
  +subtaskArray: SubTask[];
|};

/**
 * The tag color picker maps a tag to a color.
 */
export type TagColorConfig = {
  [tag: string]: string
};

/**
 * The type of the entire redux state.
 */
export type State = {|
  +mainTaskArray: Task[];
  +backupTaskArray: Task[];
  +tagColorPicker: TagColorConfig;
  +bearStatus: string
|};
