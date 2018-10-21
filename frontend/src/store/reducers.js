import type { TagColorConfigAction } from './action-types';
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

function recalculateBearStatus(taskArray) {
  if (focusTaskArray.isComplete) {
    return 'happy';
  } else if (focusTaskArray.justFinishedTask) {
    return 'has fish';
  } else if (focusTaskArray.howComplete < .1) {
    return 'hungry';
  } else if (focusTaskArray.hasOverDueTask == 1) {
    return 'hibernating';
  } else if (focusTaskArray.isAllOverDue || focusTaskArray.hasOverDueTask >= 1) {
    return 'leaving';
  } else {
    return 'neutral';
  }
}

// function recalculateBearStatus(taskArray) {
//   return 'neutral';
// }

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
  const arr = mainTaskArray.map((task: Task) => {
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
return arr;
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
  function removeTag(cfg: TagColorConfig): TagColorConfig {
    const { [action.tag]: _, ...rest } = cfg;
    return rest;
  }

  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
      return { ...config, [action.tag]: action.color };
    case 'REMOVE_COLOR_CONFIG':
      return removeTag(config);
    default:
      return config;
  }
}

const rootReducer = (state = initialState, action) => {
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
        backupTaskArray: state.mainTaskArray,
        mainTaskArray: [...state.mainTaskArray, action.data],
      };
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
