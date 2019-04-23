import { Map, Set } from 'immutable';
import { useReducer } from 'react';
import {
  MainTask,
  PartialMainTask,
  PartialSubTask,
  SubTask,
  SubTaskWithoutId,
  SubTaskWithoutIdOrder,
} from '../../../../store/store-types';
import { getNewSubTaskId } from '../../../../firebase/id-provider';

type Action =
  | { readonly type: 'EDIT_MAIN_TASK'; readonly change: PartialMainTask }
  | { readonly type: 'ADD_SUBTASK'; readonly newSubTask: SubTaskWithoutIdOrder }
  | { readonly type: 'EDIT_SUBTASK'; readonly subTaskId: string; readonly change: PartialSubTask }
  | { readonly type: 'DELETE_SUBTASK'; readonly subtaskId: string }
  | { readonly type: 'RESET'; readonly mainTask: MainTask; readonly subTasks: readonly SubTask[] };

export type Diff = {
  readonly mainTaskEdits: PartialMainTask;
  readonly subTaskCreations: Map<string, SubTaskWithoutId>;
  readonly subTaskEdits: Map<string, PartialSubTask>;
  readonly subTaskDeletions: Set<string>;
};

type FullTask = { readonly mainTask: MainTask; readonly subTasks: readonly SubTask[] };

type State = FullTask & { readonly prevFullTask: FullTask; readonly diff: Diff };

type TaskDiffActions = FullTask & {
  readonly diff: Diff;
  readonly dispatchEditMainTask: (change: PartialMainTask) => void;
  readonly dispatchAddSubTask: (newSubTask: SubTaskWithoutIdOrder) => void;
  readonly dispatchEditSubTask: (subTaskId: string, change: PartialSubTask) => void;
  readonly dispatchDeleteSubTask: (subtaskId: string) => void;
};

const emptyDiff: Diff = {
  mainTaskEdits: {}, subTaskCreations: Map(), subTaskEdits: Map(), subTaskDeletions: Set(),
};

function initializer([mainTask, subTasks]: [MainTask, readonly SubTask[]]): State {
  return { mainTask, subTasks, prevFullTask: { mainTask, subTasks }, diff: emptyDiff };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'EDIT_MAIN_TASK': {
      const { mainTask, diff, ...restState } = state;
      const { change } = action;
      return { ...restState, mainTask: { ...mainTask, ...change }, diff: { ...diff, ...change } };
    }
    case 'ADD_SUBTASK': {
      const { subTasks, diff, ...restState } = state;
      const { newSubTask } = action;
      const id = getNewSubTaskId();
      const order = subTasks.reduce((acc, subTask) => Math.max(acc, subTask.order), 0) + 1;
      const newSubTasks = [...subTasks, { id, order, ...newSubTask }];
      const newSubTaskWithoutId = { ...newSubTask, order };
      const newDiff = {
        ...diff, subTaskCreations: diff.subTaskCreations.set(id, newSubTaskWithoutId),
      };
      return { ...restState, subTasks: newSubTasks, diff: newDiff };
    }
    case 'EDIT_SUBTASK': {
      const { subTasks, diff, ...restState } = state;
      const { subTaskId, change } = action;
      const newSubTasks = subTasks.map(s => (s.id === subTaskId ? { ...s, ...change } : s));
      const newDiff = { ...diff, subTaskEdits: diff.subTaskEdits.set(subTaskId, change) };
      return { ...restState, subTasks: newSubTasks, diff: newDiff };
    }
    case 'DELETE_SUBTASK': {
      const { subTasks, diff, ...restState } = state;
      const { subtaskId } = action;
      const newSubTasks = subTasks.filter(({ id }) => id !== subtaskId);
      const newDiff = { ...diff, subTaskDeletions: diff.subTaskDeletions.add(subtaskId) };
      return { ...restState, subTasks: newSubTasks, diff: newDiff };
    }
    case 'RESET': {
      const { mainTask, subTasks } = action;
      return initializer([mainTask, subTasks]);
    }
    default:
      throw new Error('Bad Type!');
  }
}

export default function useTaskDiffReducer(
  initMainTask: MainTask, initSubTasks: readonly SubTask[],
): TaskDiffActions {
  const [state, dispatch] = useReducer(reducer, [initMainTask, initSubTasks], initializer);
  const { mainTask, subTasks, prevFullTask, diff } = state;
  if (prevFullTask.mainTask !== mainTask || prevFullTask.subTasks !== subTasks) {
    dispatch({ type: 'RESET', mainTask, subTasks });
  }
  return {
    mainTask,
    subTasks,
    diff,
    dispatchEditMainTask: (change: PartialMainTask): void => dispatch({
      type: 'EDIT_MAIN_TASK', change,
    }),
    dispatchAddSubTask: (newSubTask: SubTaskWithoutIdOrder): void => dispatch({
      type: 'ADD_SUBTASK', newSubTask,
    }),
    dispatchEditSubTask: (subTaskId: string, change: PartialSubTask): void => dispatch({
      type: 'EDIT_SUBTASK', subTaskId, change,
    }),
    dispatchDeleteSubTask: (subtaskId: string): void => dispatch({
      type: 'DELETE_SUBTASK', subtaskId,
    }),
  };
}
