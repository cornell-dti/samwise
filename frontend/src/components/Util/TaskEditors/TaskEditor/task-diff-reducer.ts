import { Map, Set } from 'immutable';
import { useReducer } from 'react';
import { shallowEqual, shallowArrayEqual } from 'util/general-util';
import {
  MainTask,
  PartialMainTask,
  PartialSubTask,
  SubTask,
  SubTaskWithoutId,
} from '../../../../store/store-types';
import { getNewSubTaskId } from '../../../../firebase/id-provider';

type Action =
  | { readonly type: 'EDIT_MAIN_TASK'; readonly change: PartialMainTask }
  | { readonly type: 'ADD_SUBTASK'; readonly newSubTask: SubTaskWithoutId }
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
  readonly dispatchAddSubTask: (newSubTask: SubTaskWithoutId) => void;
  readonly dispatchEditSubTask: (subTaskId: string, change: PartialSubTask) => void;
  readonly dispatchDeleteSubTask: (subtaskId: string) => void;
  readonly reset: () => void;
};

const emptyDiff: Diff = {
  mainTaskEdits: {}, subTaskCreations: Map(), subTaskEdits: Map(), subTaskDeletions: Set(),
};

/**
 * @param diff diff to check.
 * @returns whether the given diff is empty.
 */
export function diffIsEmpty(diff: Diff): boolean {
  // since things are immutable, we can use referential equality!
  return diff === emptyDiff;
}

/**
 * Lazy initializer for the initial state of task editor.
 *
 * @param mainTask the main task for initial state.
 * @param subTasks an array of subtask for initial state.
 * @returns the initial state.
 */
function initializer([mainTask, subTasks]: [MainTask, readonly SubTask[]]): State {
  return { mainTask, subTasks, prevFullTask: { mainTask, subTasks }, diff: emptyDiff };
}

/**
 * The reducer that applies the editing changes specified in action.
 *
 * @param state the previous state.
 * @param action the edit action.
 * @returns the new state after editing.
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'EDIT_MAIN_TASK': {
      const { mainTask, diff, ...restState } = state;
      const { change } = action;
      const newDiff = { ...diff, mainTaskEdits: { ...diff.mainTaskEdits, ...change } };
      return { ...restState, mainTask: { ...mainTask, ...change }, diff: newDiff };
    }
    case 'ADD_SUBTASK': {
      const { subTasks, diff, ...restState } = state;
      const { newSubTask } = action;
      const id = getNewSubTaskId();
      const newSubTasks = [...subTasks, { id, ...newSubTask }];
      const newDiff = {
        ...diff, subTaskCreations: diff.subTaskCreations.set(id, newSubTask),
      };
      return { ...restState, subTasks: newSubTasks, diff: newDiff };
    }
    case 'EDIT_SUBTASK': {
      const { subTasks, diff, ...restState } = state;
      const { subTaskId, change } = action;
      const newSubTasks = subTasks.map(s => (s.id === subTaskId ? { ...s, ...change } : s));
      let newDiff: Diff;
      const createdSubTask = diff.subTaskCreations.get(subTaskId);
      if (createdSubTask != null) {
        newDiff = {
          ...diff,
          subTaskCreations: diff.subTaskCreations.set(subTaskId, { ...createdSubTask, ...change }),
        };
      } else {
        const subTaskEdits = diff.subTaskEdits.update(
          subTaskId, change, prevChange => ({ ...prevChange, ...change }),
        );
        newDiff = { ...diff, subTaskEdits };
      }
      return { ...restState, subTasks: newSubTasks, diff: newDiff };
    }
    case 'DELETE_SUBTASK': {
      const { subTasks, diff, ...restState } = state;
      const { subtaskId } = action;
      const newSubTasks = subTasks.filter(({ id }) => id !== subtaskId);
      let newDiff: Diff;
      if (diff.subTaskCreations.has(subtaskId)) {
        newDiff = { ...diff, subTaskCreations: diff.subTaskCreations.remove(subtaskId) };
      } else {
        newDiff = { ...diff, subTaskDeletions: diff.subTaskDeletions.add(subtaskId) };
      }
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
  if (!shallowEqual(prevFullTask.mainTask, initMainTask)
    || !shallowArrayEqual(prevFullTask.subTasks, initSubTasks)) {
    dispatch({ type: 'RESET', mainTask: initMainTask, subTasks: initSubTasks });
  }
  return {
    mainTask,
    subTasks,
    diff,
    dispatchEditMainTask: (change: PartialMainTask): void => dispatch({
      type: 'EDIT_MAIN_TASK', change,
    }),
    dispatchAddSubTask: (newSubTask: SubTaskWithoutId): void => dispatch({
      type: 'ADD_SUBTASK', newSubTask,
    }),
    dispatchEditSubTask: (subTaskId: string, change: PartialSubTask): void => dispatch({
      type: 'EDIT_SUBTASK', subTaskId, change,
    }),
    dispatchDeleteSubTask: (subtaskId: string): void => dispatch({
      type: 'DELETE_SUBTASK', subtaskId,
    }),
    reset: (): void => dispatch({ type: 'RESET', mainTask: initMainTask, subTasks: initSubTasks }),
  };
}
