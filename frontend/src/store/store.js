// @flow strict

import { createStore } from 'redux';
import type { Store } from 'redux';
import rootReducer from './reducers';
import type { State } from './store-types';
import type { Action } from './action-types';

export type GlobalStore = Store<State, Action>;

/**
 * The redux store. It should only be given to the react-redux provider.
 */
export const store: GlobalStore = createStore(rootReducer);

/**
 * Dispatch an action and returns the same dispatched action.
 */
export const dispatchAction = (action: Action): Action => store.dispatch(action);
