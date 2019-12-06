import { Set } from 'immutable';
import {
  Action,
  PatchCourses,
  PatchTags,
  PatchTasks,
  PatchSubTasks,
  PatchSettings,
  PatchBannerMessageStatus,
} from './action-types';
import { State } from './store-types';
import { error } from '../util/general-util';
import { initialState } from './state';

function patchTags(state: State, { created, edited, deleted }: PatchTags): State {
  const newTags = state.tags.withMutations((tags) => {
    created.forEach((t) => tags.set(t.id, t));
    edited.forEach((t) => tags.set(t.id, t));
    deleted.forEach((id) => tags.delete(id));
  });
  return { ...state, tags: newTags };
}

function patchTasks(state: State, { created, edited, deleted }: PatchTasks): State {
  const newDateTaskMap = state.dateTaskMap.withMutations((m) => {
    created.forEach((t) => {
      if (t.type === 'MASTER_TEMPLATE') {
        return;
      }
      const key = t.date.toDateString();
      const set = m.get(key);
      if (set == null) {
        m.set(key, Set.of(t.id));
      } else {
        m.set(key, set.add(t.id));
      }
    });
    edited.forEach((t) => {
      if (t.type === 'MASTER_TEMPLATE') {
        return;
      }
      const key = t.date.toDateString();
      const oldTask = state.tasks.get(t.id) ?? error();
      if (oldTask.type === 'ONE_TIME') {
        const oldKey = oldTask.date.toDateString();
        if (oldKey !== key) {
          // remove first
          const oldBucket = m.get(oldKey) ?? error('impossible!');
          m.set(oldKey, oldBucket.remove(t.id));
        }
      }
      const set = m.get(key);
      if (set == null) {
        m.set(key, Set.of(t.id));
      } else {
        m.set(key, set.add(t.id));
      }
    });
    deleted.forEach((id) => {
      const oldTask = state.tasks.get(id);
      if (oldTask == null) {
        return;
      }
      if (oldTask.type === 'ONE_TIME') {
        const key = oldTask.date.toDateString();
        const set = m.get(key);
        if (set != null) {
          m.set(key, set.remove(id));
        }
      }
    });
  });
  const newRepeatedTaskSet = state.repeatedTaskSet.withMutations((s) => {
    created.forEach((t) => {
      if (t.type === 'MASTER_TEMPLATE') {
        s.add(t.id);
      }
    });
    deleted.forEach((id) => s.remove(id));
  });
  const newTasks = state.tasks.withMutations((tasks) => {
    created.forEach((t) => tasks.set(t.id, t));
    edited.forEach((t) => tasks.set(t.id, t));
    deleted.forEach((id) => tasks.delete(id));
  });
  return {
    ...state, tasks: newTasks, dateTaskMap: newDateTaskMap, repeatedTaskSet: newRepeatedTaskSet,
  };
}

function patchSubTasks(state: State, { created, edited, deleted }: PatchSubTasks): State {
  const newSubTasks = state.subTasks.withMutations((subTasks) => {
    created.forEach((t) => subTasks.set(t.id, t));
    edited.forEach((t) => subTasks.set(t.id, t));
    deleted.forEach((id) => subTasks.delete(id));
  });
  return { ...state, subTasks: newSubTasks };
}

function patchSettings(state: State, { settings }: PatchSettings): State {
  return { ...state, settings };
}

function patchBannerMessageStatus(state: State, { change }: PatchBannerMessageStatus): State {
  return { ...state, bannerMessageStatus: { ...state.bannerMessageStatus, ...change } };
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
    case 'PATCH_SETTINGS':
      return patchSettings(state, action);
    case 'PATCH_BANNER_MESSAGES':
      return patchBannerMessageStatus(state, action);
    case 'PATCH_COURSES':
      return patchCourses(state, action);
    default:
      return state;
  }
}
