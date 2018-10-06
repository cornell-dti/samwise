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

//  marks a specific subtask as read based on the task id and the subtask id
function markSubtask(prevMainTaskArray, taskID, subtaskID) {
  const newMainTaskArray = [];
  for (let i = 0; i < prevMainTaskArray.length; i += 1) {
    if (prevMainTaskArray[i] === taskID) {
      const newSubtaskArray = [];
      const newTaskObj = prevMainTaskArray[i];
      const oldSubtaskArray = prevMainTaskArray[i].subtaskArray;
      for (let j = 0; j < oldSubtaskArray.length; j += 1) {
        if (oldSubtaskArray[j].id === subtaskID) {
          const newSubtaskObj = oldSubtaskArray[j];
          newSubtaskObj.complete = true;
          newSubtaskArray.push(newSubtaskObj);
        } else {
          newSubtaskArray.push(oldSubtaskArray[j]);
        }
      }
      newTaskObj.subtaskArray = newSubtaskArray;
      newMainTaskArray.push(newTaskObj);
    } else {
      newMainTaskArray.push(prevMainTaskArray[i]);
    }
    return {
      ...task,
      subtaskArray: task.subtaskArray.map(subTask => ({
        ...subTask, complete: !subTask.complete,
      })),
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
      return { ...state, mainTaskArray: [...state.mainTaskArray, action.data] };
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
    default:
      return state;
  }
};

export default rootReducer;
