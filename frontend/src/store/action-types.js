// @flow

import type { Task } from './store-types';

export type TagColorConfigEditAction = {|
  +type: 'EDIT_COLOR_CONFIG'; +tag: string; +color: string;
|};
export type TagColorConfigRemoveAction = {|
  +type: 'REMOVE_COLOR_CONFIG'; +tag: string;
|};

export type TagColorConfigAction = TagColorConfigEditAction | TagColorConfigRemoveAction;

export type AddNewTaskAction = {| +type: 'ADD_NEW_TASK'; data: Task; |};
export type EditTaskAction = {| +type: 'EDIT_TASK'; task: Task; |};

export type MarkTaskAction = {| +type: 'MARK_TASK'; id: number; |};
export type MarkSubTaskAction = {| +type: 'MARK_SUBTASK'; id: number; subtask: number |};

export type ToggleTaskPinAction = {| +type: 'TOGGLE_TASK_PIN'; taskId: number; |};
export type ToggleSubTaskPinAction = {|
  +type: 'TOGGLE_SUBTASK_PIN'; taskId: number; subtaskId: number;
|};

export type RemoveTaskAction = {| +type: 'REMOVE_TASK'; taskId: number; |};
export type RemoveSubTaskAction = {| +type: 'REMOVE_SUBTASK'; taskId: number; subtaskId: number; |};

export type Action = { +type: string; };
