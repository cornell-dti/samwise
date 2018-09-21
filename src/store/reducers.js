/**
 * Initial state of the application.
 * @type {{tasks: Array, tagColorConfig: *}}
 */
const initialState = {
    mainTaskArray: [],
    tagColorPicker: {
        'Personal': 'blue',
        'Project Team': 'green',
        'Courses': 'purple'
    },
    bearStatus: 'neutral',
};

//function to update the bear's status
function recalculateBearStatus(taskArray) {
    return 'neutral';
}

/**
 * Reducer from a old tag-color config to a new one.
 *
 * @param oldTagColorConfig the old tag-color config.
 * @param action the action related to tag-color config to perform.
 * @return {*} the new tag-color config.
 */
const tagColorConfigReducer = (oldTagColorConfig, action) => {
    switch (action.type) {
        case 'EDIT_COLOR_CONFIG':
            let newConfig = {...oldTagColorConfig};
            newConfig[action.tag] = action.color;
            return newConfig;
        case 'REMOVE_COLOR_CONFIG':
            newConfig = {...oldTagColorConfig};
            delete newConfig[action.tag];
            return newConfig;
        default:
            return oldTagColorConfig;
    }
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'EDIT_COLOR_CONFIG':
        case 'REMOVE_COLOR_CONFIG':
            return {
                ...state,
                tagColorPicker: tagColorConfigReducer(state.tagColorPicker, action)
            };
        default:
            return state;
    }
};

export default rootReducer;
