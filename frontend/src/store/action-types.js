// @flow strict

import type { ActionCreators as ReduxActionCreators, Dispatch as ReduxDispatch } from 'redux';
import type { MainTask, PartialSubTask, Tag, Task } from './store-types';

/*
 * --------------------------------------------------------------------------------
 * Part 1: Task Actions
 * --------------------------------------------------------------------------------
 */

export type AddNewTaskAction = {| +type: 'ADD_NEW_TASK'; +data: Task; |};
export type EditTaskAction = {| +type: 'EDIT_TASK'; +task: Task; |};

export type EditMainTaskAction = {|
  +type: 'EDIT_MAIN_TASK'; +taskId: number; +partialMainTask: $Shape<MainTask>;
|};
export type EditSubTaskAction = {|
  +type: 'EDIT_SUB_TASK'; +taskId: number; +subtaskId: number; +partialSubTask: PartialSubTask;
|};

export type RemoveTaskAction = {| +type: 'REMOVE_TASK'; +taskId: number; +undoable: boolean; |};
export type RemoveSubTaskAction = {|
  +type: 'REMOVE_SUBTASK'; +taskId: number; +subtaskId: number;
|};

type TaskAction =
  | AddNewTaskAction
  | EditTaskAction
  | EditMainTaskAction
  | EditSubTaskAction
  | RemoveTaskAction
  | RemoveSubTaskAction;

/*
 * --------------------------------------------------------------------------------
 * Part 2: Color Config Actions
 * --------------------------------------------------------------------------------
 */

export type AddTagAction = {| +type: 'ADD_TAG'; +tag: Tag; |};
export type EditTagAction = {| +type: 'EDIT_TAG'; +tag: Tag; |};
export type RemoveTagAction = {| +type: 'REMOVE_TAG'; +tagId: number; |};

export type TagAction = AddTagAction | EditTagAction | RemoveTagAction;

/*
 * --------------------------------------------------------------------------------
 * Part 3: Undo Actions
 * --------------------------------------------------------------------------------
 */

export type UndoDeleteTaskAction = {| +type: 'UNDO_DELETE_TASK' |};
export type ClearUndoDeleteTaskAction = {| +type: 'CLEAR_UNDO_DELETE_TASK' |};

export type UndoAction =
  | UndoDeleteTaskAction
  | ClearUndoDeleteTaskAction;

/*
 * --------------------------------------------------------------------------------
 * Part 4: Backend Patch Actions
 * --------------------------------------------------------------------------------
 */

export type BackendPatchNewTagAction = {|
  +type: 'BACKEND_PATCH_NEW_TAG'; +tempNewTagId: number; +tag: Tag;
|};
export type BackendPatchNewTaskAction = {|
  +type: 'BACKEND_PATCH_NEW_TASK'; +tempNewTaskId: number; +task: Task;
|};
export type BackendPatchExistingTaskAction = {|
  +type: 'BACKEND_PATCH_EXISTING_TASK'; +task: Task;
|};
export type BackendPatchLoadedDataAction = {|
  +type: 'BACKEND_PATCH_LOADED_DATA'; +tags: Tag[]; +tasks: Task[];
|};

/**
 * All the tasks that lets the backend patch the store with all the latest values.
 */
export type BackendPatchAction =
  | BackendPatchNewTagAction
  | BackendPatchNewTaskAction
  | BackendPatchExistingTaskAction
  | BackendPatchLoadedDataAction

/*
 * --------------------------------------------------------------------------------
 * Part 5: All Actions
 * --------------------------------------------------------------------------------
 */

export type Action = TagAction | TaskAction | UndoAction | BackendPatchAction;

export type ActionProps = { [actionName: string]: (...args: Array<any>) => Action };
export type Dispatch = ReduxDispatch<Action>;
export type ActionCreators = ReduxActionCreators<string, Action>;
export type MapDispatchToProps<OP> = (d: Dispatch, op: OP) => { ...OP, ...ActionProps };
