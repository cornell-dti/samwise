// @flow strict

import { createStore } from 'redux';
import type { Store } from 'redux';
import rootReducer from './reducers';
import type { State } from './store-types';
import type { Action } from './action-types';
import type { AppUser } from '../util/firebase-util';

export type GlobalStore = Store<State, $Subtype<Action>>;

let store: GlobalStore | null = null;

/**
 * Initialize and record a global store and returns the newly initialized store.
 *
 * @param {AppUser} appUser the user of the app.
 * @return {GlobalStore} the newly initialized store.
 */
export function initializeStore(appUser: AppUser): GlobalStore {
  const newStore = createStore(rootReducer(appUser));
  store = newStore;
  return newStore;
}

/**
 * Returns the global store.
 *
 * @return {GlobalStore} the global store.
 * @throws Error if the store is not initialized.
 */
const getStore = (): GlobalStore => {
  if (store != null) {
    return store;
  }
  throw new Error('Store is not initialized.');
};

/**
 * Returns the app user in the global store.
 *
 * @return {AppUser} the app user in the global store.
 */
export const getAppUser = (): AppUser => getStore().getState().appUser;

/**
 * Dispatch an action and returns the dispatched action.
 *
 * @param {Action} action the action to dispatch.
 * @return {Action} the action to dispatch.
 */
export const dispatchAction = (action: Action): Action => getStore().dispatch(action);
