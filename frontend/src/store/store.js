// @flow strict

import { createStore } from 'redux';
import type { Store } from 'redux';
import rootReducer from './reducers';
import type { State } from './store-types';
import type { Action } from './action-types';
import type { AppUser } from '../util/firebase-util';
import { error } from '../util/general-util';

export type GlobalStore = Store<State, Action>;

const store: GlobalStore = createStore(rootReducer);
let appUser: AppUser | null = null;

/**
 * Initialize the app and record a global user and returns the initialized store.
 * This function should be called in the entry point of the app.
 *
 * @param {AppUser} user the user of the app, coming from Firebase.
 * @return {GlobalStore} the newly initialized global store.
 */
export function initializeApp(user: AppUser): GlobalStore {
  appUser = user;
  return store;
}

/**
 * Returns the global app user.
 */
export const getAppUser = (): AppUser => appUser ?? error('App is not initialized.');

/**
 * Dispatch an action and returns the same dispatched action.
 */
export const dispatchAction = (action: Action): Action => store.dispatch(action);
