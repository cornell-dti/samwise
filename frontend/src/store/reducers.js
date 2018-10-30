// @flow

import type { Action, EditTaskAction, TagColorConfigAction } from './action-types';
import type {
  State, Task, SubTask, TagColorConfig,
} from './store-types';

/**
 * Initial state of the application.
 * @type {{mainTaskArray: Array, tagColorConfig: *, bearStatus: string}}
 */
const initialState: State = {
  backupTaskArray: [],
  mainTaskArray: [],
  tagColorPicker: {
    Personal: '#c4def6',
    'Project Team': 'green',
    Courses: 'purple',
    None: 'gray',
  },
  bearStatus: 'neutral',
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
    .map((task: Task) => (task.id === taskID ? { ...task, inFocus: !task.inFocus } : task));
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
 * Remove a main task.
 *
 * @param mainTaskArray the main task array to modify.
 * @param taskID id of the task to remove.
 * @return {Task[]} the new task array with the specified task remove.
 */
function removeTask(mainTaskArray: Task[], taskID: number): Task[] {
  return mainTaskArray.filter((task: Task) => task.id !== taskID);
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

function addSubtask(mainTaskArray: Task[], taskID: number, subtask): Task[] {
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
 * @param {TagColorConfig} config the old tag-color config.
 * @param {TagColorConfigAction} action the action related to tag-color config to perform.
 * @return {TagColorConfig} the new tag-color config.
 */
function tagColorConfigReducer(
  config: TagColorConfig, action: TagColorConfigAction,
): TagColorConfig {
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
      return { ...config, [action.tag]: action.color };
    case 'REMOVE_COLOR_CONFIG':
      return ((c): TagColorConfig => {
        const { [action.tag]: _, ...rest } = c;
        return rest;
      })(config);
    default:
      return config;
  }
}

/**
 * Reducer from an old state with old task to a new state with one task edited.
 *
 * @param state the old state.
 * @param action the reduce action to edit a task.
 * @return {State} the new state.
 */
function editTask(state: State, action: EditTaskAction) {
  const newTask = action.task;
  return {
    ...state,
    backupTaskArray: state.mainTaskArray,
    mainTaskArray: state.mainTaskArray
      .map((task: Task) => (task.id === newTask.id ? newTask : task)),
  };
}

const rootReducer = (state: State = initialState, action: $Subtype<Action>) => {
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
    case 'REMOVE_COLOR_CONFIG':
      return {
        ...state,
        tagColorPicker: tagColorConfigReducer(state.tagColorPicker, action),
      };
    case 'ADD_NEW_TASK':
      return {
        ...state,
        mainTaskArray: [...state.mainTaskArray, action.data],
        backupTaskArray: state.mainTaskArray,
      };
    case 'EDIT_TASK':
      return editTask(state, action);
    case 'MARK_TASK':
      return {
        ...state,
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: markTask(state.mainTaskArray, action.id),
      };
    case 'MARK_SUBTASK':
      return {
        ...state,
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: markSubtask(state.mainTaskArray, action.id, action.subtask),
      };
    case 'TOGGLE_TASK_PIN':
      return {
        ...state,
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: toggleTaskPin(state.mainTaskArray, action.taskId),
      };
    case 'TOGGLE_SUBTASK_PIN':
      return {
        ...state,
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: toggleSubtaskPin(state.mainTaskArray, action.taskId, action.subtaskId),
      };
    case 'REMOVE_TASK':
      return {
        ...state,
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: removeTask(state.mainTaskArray, action.taskId),
      };
    case 'REMOVE_SUBTASK':
      return {
        ...state,
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: removeSubtask(state.mainTaskArray, action.taskId, action.subtaskId),
      };
    case 'ADD_SUBTASK':
      return {
        ...state,
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: addSubtask(state.mainTaskArray, action.id, action.data),
      };
    case 'UNDO_ACTION':
      return {
        ...state,
        mainTaskArray: state.backupTaskArray,
        backupTaskArray: null,
      };
    default:
      return state;
  }
};

export default rootReducer;
