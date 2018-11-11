// @flow strict

import type { Action, EditTaskAction, TagColorConfigAction } from './action-types';
import type {
  State, Task, SubTask, TagColorConfig,
} from './store-types';

/**
 * Initial state of the application.
 * @type {{mainTaskArray: Array, tagColorConfig: *, bearStatus: string}}
 */
const initialState: State = {
  mainTaskArray: [],
  classColorPicker: {
    CS1110: 'red',
  },
  tagColorPicker: {
    Personal: '#7ED4E5',
    'Project Team': '#FF8A8A',
    Courses: '#9D4AA9',
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
    mainTaskArray: state.mainTaskArray.map<Task>(t => (t.id === newTask.id ? newTask : t)),
  };
}

const rootReducer = (state: State = initialState, action: Action) => {
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
    case 'REMOVE_COLOR_CONFIG':
      return {
        ...state,
        tagColorPicker: tagColorConfigReducer(state.tagColorPicker, action, action.c),
      };
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
      return {
        ...state,
        mainTaskArray: removeTask(state.mainTaskArray, action.taskId),
      };
    case 'REMOVE_SUBTASK':
      return {
        ...state,
        mainTaskArray: removeSubtask(state.mainTaskArray, action.taskId, action.subtaskId),
      };
    default:
      return state;
  }
};

export default rootReducer;
