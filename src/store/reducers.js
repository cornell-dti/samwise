const initialState = {
    mainTaskArray : [],
    tagColorPicker : {
        tagColor1 : '#000000',
        tagColor2 : '#ffffff',
        tagColor3 : '#ff0000',
    },

    bearStatus : 'neutral',
}

//function to update the bear's status
function recalculateBearStatus(taskArray) {
    const focusTaskArray = function makeFocusTaskArray = () => {
        /* a function that parses mainTaskArray for tasks that are in focus
         * and returns an array of those focus tasks. Will remove finished 
         * entries only at end of day. */
        //TODO
    }
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
    switch(action.type) {
        default:
            return state;
    }
}

export default rootReducer;
