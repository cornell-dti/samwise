// @flow strict

import { createStore } from 'redux';
import type { Store } from 'redux';
import rootReducer from './reducers';
import type { State } from './store-types';
import type { Action } from './action-types';
import type { AppUser } from '../util/firebase-util';
import { error } from '../util/general-util';

export type GlobalStore = Store<State, $Subtype<Action>>;

const store: GlobalStore = createStore(rootReducer);
let appUser: AppUser | null = null;

/**
 * Initialize the app and record a global user and returns the initialized store.
 *
 * @param {AppUser} user the user of the app.
 * @return {GlobalStore} the newly initialized store.
 */
export function initializeApp(user: AppUser): GlobalStore {
  appUser = user;
  return store;
}

/**
 * Returns the global app user.
 *
 * @return {AppUser} the global app user.
 */
export const getAppUser = (): AppUser => appUser ?? error('App is not initialized.');

/**
 * Dispatch an action and returns the dispatched action.
 *
 * @param {Action} action the action to dispatch.
 * @return {Action} the action to dispatch.
 */
export const dispatchAction = (action: Action): Action => store.dispatch(action);
