const initialState = {
  count: 0,
	arrayStuff: []
};

const rootReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'INCREASE_COUNT':
			return { count: state.count + 1 };
		case 'ADD_TO_ARR':
			return { arrayStuff: state.arrayStuff.concat(['junk']) };
		default:
			return state;
	}
};
export default rootReducer;
