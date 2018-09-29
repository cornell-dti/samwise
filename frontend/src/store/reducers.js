// @flow

import type { TagColorConfigAction } from './action-types';
import type { State, TagColorConfig } from './store-types';

/**
 * Initial state of the application.
 * @type {{mainTaskArray: Array, tagColorConfig: *, bearStatus: string}}
 */
const initialState: State = {
  mainTaskArray: [],
  tagColorPicker: {
    Personal: 'blue',
    'Project Team': 'green',
    Courses: 'purple',
  },
  bearStatus: 'neutral',
};

// function to update the bear's status
function recalculateBearStatus(taskArray) {
  return 'neutral';
}

//marks a main task as read and marks all of its subtasks as read
function markTask(prevMainTaskArray, taskID) {
  let newMainTaskArray = [];
  for (var i = 0; i < prevMainTaskArray.length; i++) {
    if (prevMainTaskArray[i] === taskID) {
      let newTaskObj = prevMainTaskArray[i];
      newTaskObj.complete = true;
      let newSubtaskArray = [];
      for (var j = 0; j < prevMainTaskArray[i].subtaskArray; j++) {
        let newSubtaskObj = prevMainTaskArray[i].subtaskArray[j];
        newSubtaskObj.complete = true;
        newSubtaskArray.push(newSubtaskObj);
      }
      newTaskObj.subtaskArray = newSubtaskArray;
      newMainTaskArray.push(newTaskObj);
    }
    else {
      newMainTaskArray.push(prevMainTaskArray[i]);
    }
  }
  return newMainTaskArray;
}

//marks a specific subtask as read based on the task id and the subtask id
function markSubtask(prevMainTaskArray, taskID, subtaskID) {
  let newMainTaskArray = [];
  for (var i = 0; i < prevMainTaskArray.length; i++) {
    if (prevMainTaskArray[i] === taskID) {
      let newSubtaskArray = [];
      let newTaskObj = prevMainTaskArray[i];
      let oldSubtaskArray = prevMainTaskArray[i].subtaskArray;
      for (var j = 0; j < oldSubtaskArray.length; j++) {
        if (oldSubtaskArray[j].id === subtaskID) {
          let newSubtaskObj = oldSubtaskArray[j];
          newSubtaskObj.complete = true;
          newSubtaskArray.push(newSubtaskObj);
        }
        else {
          newSubtaskArray.push(oldSubtaskArray[j]);
        }
      }
      newTaskObj.subtaskArray = newSubtaskArray;
      newMainTaskArray.push(newTaskObj);
    }
    else {
      newMainTaskArray.push(prevMainTaskArray[i]);
    }
  }
  return newMainTaskArray;
}

/**
 * Reducer from a old tag-color config to a new one.
 *
 * @param config the old tag-color config.
 * @param action the action related to tag-color config to perform.
 * @return {*} the new tag-color config.
 */
function tagColorConfigReducer(
  config: TagColorConfig, action: TagColorConfigAction,
): TagColorConfig {
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
      return { ...config, [action.tag]: action.color };
    case 'REMOVE_COLOR_CONFIG':
      const { [action.tag]: _, ...rest } = config;
      return rest;
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
        tagColorPicker: tagColorConfigReducer(state.tagColorPicker, action)
      };
    case 'ADD_NEW_TASK':
      return { ...state, mainTaskArray: [...state.mainTaskArray, action.data] };
    case 'MARK_TASK':
      return {
        ...state,
        mainTaskArray: markTask(state.mainTaskArray, action.id)
      };
    case 'MARK_SUBTASK':
      return {
        ...state,
        mainTaskArray: markSubtask(state.mainTaskArray, action.id, action.subtask)
      };
    default:
      return state;
  }
};

export default rootReducer;
