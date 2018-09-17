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
	return 'neutral';
}

const rootReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'MAIN_TASK':
						newTaskArray = [...state, action.payload];
            return {
                mainTaskArray: newTaskArray,
                tagColorPicker: state.tagColorPicker,
                bearStatus: recalculateBearStatus(newTaskArray),
            }

        default:
            return state;

    }
}

export default rootReducer;
