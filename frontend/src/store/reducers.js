// @flow

import type { TagColorConfigAction } from './actions';

/**
 * The tag color picker maps a tag to a color.
 */
export type TagColorConfig = {
  [tag: string]: string
};

/**
 * The type of the entire redux state.
 */
type State = {
  mainTaskArray: any,
  tagColorPicker: TagColorConfig,
  bearStatus: string
};

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
 * @param config the old tag-color config.
 * @param action the action related to tag-color config to perform.
 * @return {*} the new tag-color config.
 */
const tagColorConfigReducer = (
  config: TagColorConfig, action: TagColorConfigAction,
): TagColorConfig => {
  const newConfig: TagColorConfig = { ...config };
  switch (action.type) {
    case 'EDIT_COLOR_CONFIG':
      newConfig[action.tag] = action.color || 'red'; // default color
      return newConfig;
    case 'REMOVE_COLOR_CONFIG':
      delete newConfig[action.tag];
      return newConfig;
    default:
      return newConfig;
  }
};

const rootReducer = (state: State = initialState, action: any) => {
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
};

export default rootReducer;
