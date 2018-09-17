const initialState = {
    mainTaskArray = [],
    tagColorPicker = {
        tagColor1 = '#000000',
        tagColor2 = '#ffffff',
        tagColor3 = '#ff0000',
    },
    bearStatus = 'neutral',
}

const rootReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'MAIN_TASK':
            return {
                mainTaskArray: [...state,action.payload],
                tagColorPicker: state.tagColorPicker,
                bearStatus: state.bearStatus,
            }

        case 'BEAR':
            return {
                bearStatus: action.payload,
                mainTaskArray: state.mainTaskArray,
                tagColorPicker: state.tagColorPicker,
            }
            default:
                return state;
            
    }
}

export default rootReducer;
