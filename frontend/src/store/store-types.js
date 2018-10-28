// @flow

export type SubTask = {|
  +name: string; // Example: "SubTask 1 Name"
  +id: number; // Example: 32432
  +complete: boolean;
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
  +subtaskArray: SubTask[];
|};

/**
 * The tag color picker maps a tag to a color.
 */
export type TagColorConfig = {
  +[tag: string]: string
};

/**
 * The type of the entire redux state.
 */
export type State = {
  +mainTaskArray: Task[],
  +tagColorPicker: TagColorConfig,
  +bearStatus: string
};
