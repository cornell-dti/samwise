// @flow strict

import type { Action, PatchStoreAction } from './action-types';
import type { State } from './store-types';
import { NONE_TAG } from '../util/tag-util';

/**
 * The initial state of the app.
 * This state is dummy. It needs to be patched by the data from the backend ASAP.
 * @type {State}
 */
const initialState: State = {
  tasks: [],
  tags: [],
  courses: new Map(),
};

/**
 * Patch the entire redux store with the loaded data from the backend.
 *
 * @see PatchStoreAction
 */
function patchStore(state: State, { tags, tasks, courses }: PatchStoreAction): State {
  const newState = { ...state };
  if (tags !== null) {
    newState.tags = [NONE_TAG, ...tags];
  }
  if (tasks !== null) {
    newState.tasks = tasks;
  }
  if (courses !== null) {
    newState.courses = courses;
  }
  return newState;
}

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'PATCH_STORE':
      return patchStore(state, action);
    default:
      return state;
  }
}
