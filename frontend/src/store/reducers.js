// @flow

import type { EditTaskAction, TagColorConfigAction } from './action-types';
import type { State, TagColorConfig, Task } from './store-types';

/**
 * Initial state of the application.
 * @type {{mainTaskArray: Array, tagColorConfig: *, bearStatus: string}}
 */
const initialState: State = {
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

function markSubtask(mainTaskArray: Task[], taskID: number, subtaskID: number): Task[] {
  return mainTaskArray.map((task: Task) => {
    if (task.id !== taskID) {
      return task;
    }
    return {
      ...task,
      subtaskArray: task.subtaskArray.map((subTask) => {
      if (subTask.id !== subtaskID) {
      return subTask;
    }
    return {
      ...subTask,
      complete: !subTask.complete,
    };
  }),
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

const rootReducer = (state: State = initialState, action: any) => {
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
    case 'REMOVE_COLOR_CONFIG':
      return {
        ...state,
        tagColorPicker: tagColorConfigReducer(state.tagColorPicker, action),
      };
    case 'ADD_NEW_TASK':
<<<<<<< HEAD
      return { ...state, mainTaskArray: [...state.mainTaskArray, action.data], backupTaskArray: state.mainTaskArray };
=======
      return {
        ...state,
        mainTaskArray: [...state.mainTaskArray, action.data],
        backupTaskArray: state.mainTaskArray,
      };
>>>>>>> Merged Master
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
