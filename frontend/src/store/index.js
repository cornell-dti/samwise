// @flow strict

import { createStore } from 'redux';
import type { Store } from 'redux';
import rootReducer from './reducers';
import type { State } from './store-types';
import type { Action } from './action-types';

const store: Store<State, $Subtype<Action>> = createStore(rootReducer);
export default store;
