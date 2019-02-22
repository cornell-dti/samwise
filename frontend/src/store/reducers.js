// @flow strict

import { Map, Set } from 'immutable';
import type {
  Action,
  PatchCourses,
  PatchTags,
  PatchTasks,
  PatchSubTasks,
  PatchTaskChildrenMap,
} from './action-types';
import type { State } from './store-types';
import { NONE_TAG_ID, NONE_TAG } from '../util/tag-util';

/**
 * The initial state of the app.
 * This state is dummy. It needs to be patched by the data from the backend ASAP.
 * @type {State}
 */
const initialState: State = {
  tags: Map({ [NONE_TAG_ID]: NONE_TAG }),
  tasks: Map(),
  subTasks: Map(),
  taskChildrenMap: Map(),
  courses: Map(),
};

function patchTags(state: State, { created, edited, deleted }: PatchTags): State {
  const newTags = state.tags.withMutations((tags) => {
    created.forEach(t => tags.set(t.id, t));
    edited.forEach(t => tags.set(t.id, t));
    deleted.forEach(id => tags.delete(id));
  });
  return { ...state, tags: newTags };
}

function patchTasks(state: State, { created, edited, deleted }: PatchTasks): State {
  const newTasks = state.tasks.withMutations((tasks) => {
    created.forEach(t => tasks.set(t.id, t));
    edited.forEach(t => tasks.set(t.id, t));
    deleted.forEach(id => tasks.delete(id));
  });
  return { ...state, tasks: newTasks };
}

function patchSubTasks(state: State, { created, edited, deleted }: PatchSubTasks): State {
  const newSubTasks = state.subTasks.withMutations((subTasks) => {
    created.forEach(t => subTasks.set(t.id, t));
    edited.forEach(t => subTasks.set(t.id, t));
    deleted.forEach(id => subTasks.delete(id));
  });
  return { ...state, subTasks: newSubTasks };
}

function patchTaskChildrenMap(
  state: State, { created, edited, deleted }: PatchTaskChildrenMap,
): State {
  const newMap = state.taskChildrenMap.withMutations((m) => {
    created.forEach((values, key) => m.set(key, Set(values)));
    edited.forEach((values, key) => m.set(key, Set(values)));
    deleted.forEach(id => m.delete(id));
  });
  return { ...state, taskChildrenMap: newMap };
}

function patchCourses(state: State, { courses }: PatchCourses): State {
  return { ...state, courses };
}

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'PATCH_TAGS':
      return patchTags(state, action);
    case 'PATCH_TASKS':
      return patchTasks(state, action);
    case 'PATCH_SUBTASKS':
      return patchSubTasks(state, action);
    case 'PATCH_TASK_CHILDREN_MAP':
      return patchTaskChildrenMap(state, action);
    case 'PATCH_COURSES':
      return patchCourses(state, action);
    default:
      return state;
  }
}
