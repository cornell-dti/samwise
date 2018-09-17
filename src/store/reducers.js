const initialState = {
    mainTaskArray = [],
}

const rootReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'MAIN_TASK':
            return {
                mainTaskArray: [...state,action.payload]
            }
            default:
                return state;
    }
}

export default rootReducer;
