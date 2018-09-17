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
        default:
            return state;
    }
}

export default rootReducer;
