import { createStore, Store } from 'redux';
import rootReducer from './reducers';
import { State } from './store-types';
import { Action } from './action-types';
import { initialStateForTesting } from './state';

export type GlobalStore = Store<State, Action>;

/**
 * The redux store. It should only be given to the react-redux provider.
 */
export const store: GlobalStore = createStore(rootReducer);

/**
 * The redux store for testing.
 */
export const storeForTesting: GlobalStore = createStore(
  (initialState: State = initialStateForTesting, action: Action): State => rootReducer(
    initialState, action,
  ),
);

/**
 * Dispatch an action and returns the same dispatched action.
 */
export const dispatchAction = (action: Action): Action => store.dispatch(action);
