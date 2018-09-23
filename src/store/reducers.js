const initialState = {
    mainTaskArray: [],
    tagColorPicker : {
        tagColor1 : '#000000',
        tagColor2 : '#ffffff',
        tagColor3 : '#ff0000',
    },

    bearStatus : 'neutral',
}

//function to recalculate Bear Status
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
const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_INFOCUS:
            return { ...state, inFocusArray: makeFocusArray };
            
        default:
            return state;
    }
}

export default rootReducer;
