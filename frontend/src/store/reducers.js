// @flow strict

import { Map } from 'immutable';
import type {
  Action, PatchStoreCourses, PatchStoreTags, PatchStoreTasks,
} from './action-types';
import type { State, Tag, Task } from './store-types';
import { NONE_TAG_ID, NONE_TAG } from '../util/tag-util';

/**
 * The initial state of the app.
 * This state is dummy. It needs to be patched by the data from the backend ASAP.
 * @type {State}
 */
const initialState: State = {
  tags: Map(),
  tasks: Map(),
  subTasks: Map(),
  courses: Map(),
};

function patchStoreTags(state: State, { created, edited, deleted }: PatchStoreTags): State {
  const newTags = state.tags.withMutations((tags) => {
    created.forEach(t => tags.set(t.id, t));
    edited.forEach(t => tags.set(t.id, t));
    deleted.forEach(id => tags.delete(id));
  });
  return { ...state, tags: newTags };
}

function patchStoreTasks(
  state: State,
  {
    createdTasks, createdSubTasks, editedTasks, editedSubTasks, deletedTasks, deletedSubTasks,
  }: PatchStoreTasks,
): State {
  const newTasksWithSubTasksPatched = state.tasks.withMutations((tasks) => {
    createdSubTasks.forEach(t => tasks.set(t.id, t));
    editedSubTasks.forEach(t => tasks.set(t.id, t));
    deletedSubTasks.forEach(id => tasks.delete(id));
    const parentsForNewSubTasks = createdSubTasks.map(t => t.p)
  });

}

/**
 * Patch the entire redux store with the loaded data from the backend.
 *
 * @see PatchStoreAction
 */
function patchStore(state: State, { tags, tasks, courses }: PatchStoreAction): State {
  const newState = { ...state };
  if (tags !== null) {
    // $FlowFixMe must use any
    const tagsObj: any = { [NONE_TAG_ID]: NONE_TAG };
    tags.forEach((t) => {
      tagsObj[t.id] = t;
    });
    newState.tags = (tagsObj: {| +[id: string]: Tag |});
  }
  if (tasks !== null) {
    // $FlowFixMe must use any
    const tasksObj: any = {};
    tasks.forEach((t) => {
      tasksObj[t.id] = t;
    });
    newState.tasks = (tasksObj: {| +[id: string]: Task |});
  }
  if (courses !== null) {
    newState.courses = courses;
  }
  return newState;
}

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'PATCH_TAGS':
      return patchStoreTags(state, action);
    default:
      return state;
  }
}
