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

function rootReducer(state: State = initialState, action: any): State {
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
    case 'REMOVE_COLOR_CONFIG':
      return {
        ...state,
        tagColorPicker: tagColorConfigReducer(state.tagColorPicker, (action: TagColorConfigAction)),
      };
    case 'ADD_NEW_TASK':
      return { ...state, mainTaskArray: state.mainTaskArray.concat([action.data]) };
    default:
      return state;
  }
}

export default rootReducer;
