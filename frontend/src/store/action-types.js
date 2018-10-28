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

export type Action = { +type: string; };
