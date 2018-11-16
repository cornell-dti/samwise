// @flow strict

import type { Action, EditTaskAction, ColorConfigAction } from './action-types';
import type {
  State, Task, SubTask, ColorConfig,
} from './store-types';

/**
 * Initial state of the application.
 * @type {State}
 */
const initialState: State = {
  mainTaskArray: [],
  classColorConfig: {
    CS1110: 'red',
  },
  tagColorConfig: {
    Personal: '#7ED4E5',
    'Project Team': '#FF8A8A',
    Courses: '#9D4AA9',
    None: 'gray',
  },
  bearStatus: 'neutral',
  undoCache: { lastDeletedTask: null },
};

// function to update the bear's status
// eslint-disable-next-line no-unused-vars
function recalculateBearStatus(focusTaskArray) {
  if (focusTaskArray.isComplete) {
    return 'happy';
  }
  if (focusTaskArray.justFinishedTask) {
    return 'has fish';
  }
  if (focusTaskArray.howComplete < 0.1) {
    return 'hungry';
  }
  if (focusTaskArray.hasOverDueTask === 1) {
    return 'hibernating';
  }
  if (focusTaskArray.isAllOverDue || focusTaskArray.hasOverDueTask >= 1) {
    return 'leaving';
  }
  return 'neutral';
}

/**
 * Change the completion status of a main task.
 *
 * @param mainTaskArray the main task array to modify.
 * @param taskID id of the task to change completion status.
 * @return {Task[]} the new task array with task's completion status inverted.
 */
function markTask(mainTaskArray: Task[], taskID: number): Task[] {
  return mainTaskArray.map((task: Task) => {
    if (task.id !== taskID) {
      return task;
    }
    return {
      ...task,
      complete: !task.complete,
      subtaskArray: task.subtaskArray.map(subTask => ({
        ...subTask, complete: !task.complete,
      })),
    };
  });
}

/**
 * Change the completion status of a subtask.
 *
 * @param mainTaskArray the main task array to modify.
 * @param taskID id of the parent task of the subtask.
 * @param subtaskID the id of the subtask.
 * @return {Task[]} the new task array with subtask's completion status inverted.
 */
function markSubtask(mainTaskArray: Task[], taskID: number, subtaskID: number): Task[] {
  return mainTaskArray.map((task: Task) => {
    if (task.id !== taskID) {
      return task;
    }
    return {
      ...task,
      subtaskArray: task.subtaskArray.map((subTask: SubTask) => (
        subTask.id === subtaskID ? { ...subTask, complete: !subTask.complete } : subTask
      )),
    };
  });
}

/**
 * Change the in-focus status of a main task.
 *
 * @param mainTaskArray the main task array to modify.
 * @param taskID id of the task to change completion status.
 * @return {Task[]} the new task array with task's in-focus status inverted.
 */
function toggleTaskPin(mainTaskArray: Task[], taskID: number): Task[] {
  return mainTaskArray
    .map((task: Task) => (
      task.id === taskID ? {
        ...task,
        inFocus: !task.inFocus,
        subtaskArray: task.subtaskArray.map(subTask => ({
          ...subTask, inFocus: false,
        })),
      } : task
    ));
}

/**
 * Change the in-focus status of a subtask.
 *
 * @param mainTaskArray the main task array to modify.
 * @param taskID id of the parent task of the subtask.
 * @param subtaskID the id of the subtask.
 * @return {Task[]} the new task array with subtask's in-focus inverted.
 */
function toggleSubtaskPin(mainTaskArray: Task[], taskID: number, subtaskID: number): Task[] {
  return mainTaskArray.map((task: Task) => {
    if (task.id !== taskID) {
      return task;
    }
    return {
      ...task,
      subtaskArray: task.subtaskArray.map((subTask: SubTask) => (
        subTask.id === subtaskID ? { ...subTask, inFocus: !subTask.inFocus } : subTask
      )),
    };
  });
}

/**
 * The reducer for remove a main task.
 *
 * @param {State} prevState the previous state.
 * @param {number} taskID id of the task to remove.
 * @return {[Task[], Task | null]} the new task array with the specified task remove.
 */
function removeTaskReducer(prevState: State, taskID: number): State {
  let lastDeletedTask: Task | null = null;
  const mainTaskArray = prevState.mainTaskArray.filter((task: Task) => {
    if (task.id !== taskID) {
      return true;
    }
    lastDeletedTask = task;
    return false;
  });
  const undoCache = { ...prevState.undoCache, lastDeletedTask };
  return { ...prevState, mainTaskArray, undoCache };
}

/**
 * Remove a subtask.
 *
 * @param mainTaskArray the main task array to modify.
 * @param taskID id of the parent task of the subtask.
 * @param subtaskID the id of the subtask.
 * @return {Task[]} the new task array with the specified subtask removed.
 */
function removeSubtask(mainTaskArray: Task[], taskID: number, subtaskID: number): Task[] {
  return mainTaskArray.map((task: Task) => {
    if (task.id !== taskID) {
      return task;
    }
    return {
      ...task,
      subtaskArray: task.subtaskArray.filter((subTask: SubTask) => subTask.id !== subtaskID),
    };
  });
}

function addSubtask(mainTaskArray: Task[], taskID: number, subtask: SubTask): Task[] {
  return mainTaskArray.map((task: Task) => {
    if (task.id !== taskID) {
      return task;
    }
    return {
      ...task,
      subtaskArray: [...task.subtaskArray, subtask],
    };
  });
}

/**
 * Reducer from a old tag-color config to a new one.
 *
 * @param {State} prevState the previous state.
 * @param {ColorConfigAction} action the action related to tag-color config to perform.
 * @return {State} the new state.
 */
function colorConfigReducer(
  prevState: State,
  action: ColorConfigAction,
): State {
  const oldConfig = action.classOrTag === 'class'
    ? prevState.classColorConfig : prevState.tagColorConfig;
  let newConfig: ColorConfig;
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
      newConfig = { ...oldConfig, [action.tag]: action.color };
      break;
    case 'REMOVE_COLOR_CONFIG':
      newConfig = ((c: ColorConfig): ColorConfig => {
        const { [action.tag]: _, ...rest } = c;
        return rest;
      })(oldConfig);
      break;
    default:
      throw new Error('Bad action type!');
  }
  return action.classOrTag === 'class'
    ? { ...prevState, classColorConfig: newConfig }
    : { ...prevState, tagColorConfig: newConfig };
}

/**
 * Reducer from an old state with old task to a new state with one task edited.
 *
 * @param state the old state.
 * @param action the reduce action to edit a task.
 * @return {State} the new state.
 */
function editTask(state: State, action: EditTaskAction) {
  const t = action.task;
  const newTask = {
    ...t,
    subtaskArray: t.subtaskArray.map((subTask: SubTask) => ({
      ...subTask,
      complete: t.complete || subTask.complete,
      inFocus: !t.inFocus && subTask.inFocus,
    })),
  };
  return {
    ...state,
    mainTaskArray: state.mainTaskArray.map<Task>((task: Task) => (
      task.id === newTask.id ? newTask : task
    )),
  };
}

const rootReducer = (state: State = initialState, action: Action) => {
  switch (action.type) {
    case 'ADD_NEW_TASK':
      return {
        ...state,
        mainTaskArray: [...state.mainTaskArray, action.data],
      };
    case 'ADD_SUBTASK':
      return {
        ...state,
        mainTaskArray: addSubtask(state.mainTaskArray, action.id, action.data),
      };
    case 'EDIT_TASK':
      return editTask(state, action);
    case 'MARK_TASK':
      return {
        ...state,
        mainTaskArray: markTask(state.mainTaskArray, action.id),
      };
    case 'MARK_SUBTASK':
      return {
        ...state,
        mainTaskArray: markSubtask(state.mainTaskArray, action.id, action.subtask),
      };
    case 'TOGGLE_TASK_PIN':
      return {
        ...state,
        mainTaskArray: toggleTaskPin(state.mainTaskArray, action.taskId),
      };
    case 'TOGGLE_SUBTASK_PIN':
      return {
        ...state,
        mainTaskArray: toggleSubtaskPin(state.mainTaskArray, action.taskId, action.subtaskId),
      };
    case 'REMOVE_TASK':
      return removeTaskReducer(state, action.taskId);
    case 'REMOVE_SUBTASK':
      return {
        ...state,
        mainTaskArray: removeSubtask(state.mainTaskArray, action.taskId, action.subtaskId),
      };
    case 'EDIT_COLOR_CONFIG':
    case 'REMOVE_COLOR_CONFIG':
      return colorConfigReducer(state, action);
    case 'UNDO_DELETE_TASK':
      if (state.undoCache.lastDeletedTask === null) {
        return state;
      }
      return {
        ...state,
        mainTaskArray: [...state.mainTaskArray, state.undoCache.lastDeletedTask],
        undoCache: { ...state.undoCache, lastDeletedTask: null },
      };
    default:
      return state;
  }
};

export default rootReducer;
