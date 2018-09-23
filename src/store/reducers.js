const initialState = {
  count: 0,
	mainTaskArray: []
};

const rootReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'INCREASE_COUNT':
			return { count: state.count + 1 };
		case 'ADD_NEW_TASK':
			return {mainTaskArray: state.mainTaskArray.concat([action.data])};
		default:
			return state;
	}
};
export default rootReducer;
