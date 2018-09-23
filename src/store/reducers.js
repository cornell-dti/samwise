const initialState = {
    mainTaskArray: [],
    tagColorPicker : {
        tagColor1 : '#000000',
        tagColor2 : '#ffffff',
        tagColor3 : '#ff0000',
    },

    bearStatus : 'neutral',
}

function makeFocusTaskArray () {
    /* a function that parses mainTaskArray for tasks that are in focus
     * and returns an array of those focus tasks. Will remove finished 
     * entries only at end of day.*/ 
    //TODO
    let array = initialState.mainTaskArray;
    let focusArray = [];
    //for each element, check if they are in focus. If yes, append to focusArray.
    for(let i=0; i < mainTaskArray.length; i++) {
        for(let j=0; j < mainTaskArray.length; j++) {
            if (mainTaskArray[i][j].isInFocus) {
                focusArray.append(mainTaskArray[i][j]);
            }
        }
    }
    
    return focusArray;
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
