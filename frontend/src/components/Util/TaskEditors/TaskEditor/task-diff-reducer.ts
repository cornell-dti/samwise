import { useReducer } from 'react';
import { shallowArrayEqual, shallowEqual } from 'common/util/general-util';
import {
  TaskMainData,
  PartialTaskMainData,
  SubTaskEditData,
  SubTask,
} from 'common/types/store-types';

type Action =
  | { readonly type: 'EDIT_TASK'; readonly change: PartialTaskMainData }
  | { readonly type: 'EDIT_SUBTASK'; readonly change: SubTaskEditData }
  | { readonly type: 'RESET'; readonly taskData: TaskMainData };

export type Diff = {
  readonly mainTaskEdits: PartialTaskMainData;
};

type FullTask = { readonly taskData: TaskMainData };

type State = FullTask & { readonly prevFullTask: FullTask; readonly diff: Diff };

type TaskDiffActions = FullTask & {
  readonly diff: Diff;
  readonly dispatchEditTask: (change: PartialTaskMainData) => void;
  readonly dispatchEditSubTask: (change: SubTaskEditData) => void;
  readonly reset: () => void;
};

const emptyDiff: Diff = {
  mainTaskEdits: {},
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
 * @param taskData the main task for initial state.
 * @param subTasks an array of subtask for initial state.
 * @returns the initial state.
 */
function initializer(taskData: TaskMainData): State {
  return { taskData, prevFullTask: { taskData }, diff: emptyDiff };
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
    case 'EDIT_TASK': {
      const { taskData, diff, ...restState } = state;
      const { change } = action;
      const newDiff = { ...diff, mainTaskEdits: { ...diff.mainTaskEdits, ...change } };
      return { ...restState, taskData: { ...taskData, ...change }, diff: newDiff };
    }
    case 'EDIT_SUBTASK': {
      const { taskData, diff, ...restState } = state;
      const { change } = action;
      const { update, order, isDelete } = change;
      let children: SubTask[];
      if (isDelete) {
        children = taskData.children.filter((curr) => curr.order === order);
      } else {
        children = taskData.children.map((curr) => {
          return curr.order === order ? { ...curr, ...update } : curr;
        });
      }
      const newDiff = { ...diff, mainTaskEdits: { ...diff.mainTaskEdits, ...children } };
      return { ...restState, taskData: { ...taskData, ...children }, diff: newDiff };
    }
    case 'RESET': {
      const { taskData } = action;
      return initializer(taskData);
    }
    default:
      throw new Error('Bad Type!');
  }
}

export default function useTaskDiffReducer(
  initTaskData: TaskMainData,
  active: boolean,
  onChange: () => void
): TaskDiffActions {
  const [state, dispatch] = useReducer(reducer, initTaskData, initializer);
  const { taskData, prevFullTask, diff } = state;
  const { children: childrenFilteredPrev, ...prevFullTaskNoChildren } = prevFullTask.taskData;
  const { children: childrenFilteredInit, ...initMainTaskNoChildren } = initTaskData;
  if (
    !active &&
    (!shallowEqual(prevFullTaskNoChildren, initMainTaskNoChildren) ||
      !shallowArrayEqual(prevFullTask.taskData.children, initTaskData.children))
  ) {
    dispatch({ type: 'RESET', taskData: initTaskData });
  }
  return {
    taskData,
    diff,
    dispatchEditTask: (change: PartialTaskMainData): void => {
      dispatch({ type: 'EDIT_TASK', change });
      onChange();
    },
    dispatchEditSubTask: (change: SubTaskEditData): void => {
      dispatch({ type: 'EDIT_SUBTASK', change });
      onChange();
    },
    reset: (): void => {
      dispatch({ type: 'RESET', taskData: initTaskData });
      onChange();
    },
  };
}
