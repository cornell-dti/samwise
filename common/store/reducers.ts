import { Set } from 'immutable';
import {
  Action,
  PatchCourses,
  PatchTags,
  PatchTasks,
  PatchSettings,
  PatchBannerMessageStatus,
  PatchGroups,
  PatchGroupInvites,
} from '../types/action-types';
import { State, Task } from '../types/store-types';
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

function normalizeTaskChildrenOrder(task: Task): Task {
  const children = [...task.children].sort((a, b) => a.order - b.order);
  return { ...task, children };
}

function patchTasks(state: State, { created, edited, deleted }: PatchTasks): State {
  const newDateTaskMap = state.dateTaskMap.withMutations((m) => {
    created.forEach((t) => {
      if (t.metadata.type === 'MASTER_TEMPLATE') {
        return;
      }
      const key = t.metadata.date.toDateString();
      const set = m.get(key);
      if (set == null) {
        m.set(key, Set.of(t.id));
      } else {
        m.set(key, set.add(t.id));
      }
    });

    edited.forEach((t) => {
      if (t.metadata.type === 'MASTER_TEMPLATE') {
        return;
      }
      const key = t.metadata.date.toDateString();
      const oldTask = state.tasks.get(t.id) ?? error();
      if (oldTask.metadata.type === 'ONE_TIME') {
        const oldKey = oldTask.metadata.date.toDateString();
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
      if (oldTask.metadata.type === 'ONE_TIME') {
        const key = oldTask.metadata.date.toDateString();
        const set = m.get(key);
        if (set != null) {
          m.set(key, set.remove(id));
        }
      }
    });
  });
  const newGroupTaskMap = state.groupTaskMap.withMutations((m) => {
    created.forEach((t) => {
      if (t.metadata.type !== 'GROUP') {
        return;
      }
      const key = t.metadata.group;
      const set = m.get(key);
      if (set == null) {
        m.set(key, Set.of(t.id));
      } else {
        m.set(key, set.add(t.id));
      }
    });

    edited.forEach((t) => {
      if (t.metadata.type !== 'GROUP') {
        return;
      }
      const key = t.metadata.group;
      const oldTask = state.tasks.get(t.id) ?? error();
      if (oldTask.metadata.type === 'GROUP') {
        const oldKey = oldTask.metadata.group;
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
      if (oldTask.metadata.type === 'GROUP') {
        const key = oldTask.metadata.group;
        const set = m.get(key);
        if (set != null) {
          m.set(key, set.remove(id));
        }
      }
    });
  });

  const newRepeatedTaskSet = state.repeatedTaskSet.withMutations((s) => {
    created.forEach((t) => {
      if (t.metadata.type === 'MASTER_TEMPLATE') {
        s.add(t.id);
      }
    });
    deleted.forEach((id) => s.remove(id));
  });

  const newGroupTaskSet = state.groupTaskSet.withMutations((s) => {
    created.forEach((t) => {
      if (t.metadata.type === 'GROUP') {
        s.add(t.id);
      }
    });
    deleted.forEach((id) => s.remove(id));
  });

  const newTasks = state.tasks.withMutations((tasks) => {
    let dirtyMainTaskIds = Set<string>();

    created.forEach((createdMainTask) => {
      const { children, ...mainTaskRest } = createdMainTask;
      const taskData: Task = { ...mainTaskRest, children };
      dirtyMainTaskIds = dirtyMainTaskIds.add(createdMainTask.id);
      tasks.set(createdMainTask.id, taskData);
    });

    edited.forEach((editedMainTask) => {
      const { children, ...mainTaskRest } = editedMainTask;
      const taskData: Task = { ...mainTaskRest, children };
      dirtyMainTaskIds = dirtyMainTaskIds.add(editedMainTask.id);
      tasks.set(editedMainTask.id, taskData);
    });

    deleted.forEach((id) => tasks.delete(id));

    dirtyMainTaskIds.forEach((mainTaskId) => {
      tasks.update(mainTaskId, (task) => normalizeTaskChildrenOrder(task));
    });
  });

  return {
    ...state,
    tasks: newTasks,
    dateTaskMap: newDateTaskMap,
    groupTaskMap: newGroupTaskMap,
    repeatedTaskSet: newRepeatedTaskSet,
    groupTaskSet: newGroupTaskSet,
  };
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

function patchGroups(state: State, { created, edited, deleted }: PatchGroups): State {
  const newGroups = state.groups.withMutations((groups) => {
    created.forEach((g) => groups.set(g.id, g));
    edited.forEach((g) => groups.set(g.id, g));
    deleted.forEach((id) => groups.delete(id));
  });
  return { ...state, groups: newGroups };
}

function patchGroupInvites(state: State, { created, edited, deleted }: PatchGroupInvites): State {
  const newGroups = state.groupInvites.withMutations((groups) => {
    created.forEach((g) => groups.set(g.id, g));
    edited.forEach((g) => groups.set(g.id, g));
    deleted.forEach((id) => groups.delete(id));
  });
  return { ...state, groupInvites: newGroups };
}

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'PATCH_TAGS':
      return patchTags(state, action);
    case 'PATCH_TASKS':
      return patchTasks(state, action);
    case 'PATCH_SETTINGS':
      return patchSettings(state, action);
    case 'PATCH_BANNER_MESSAGES':
      return patchBannerMessageStatus(state, action);
    case 'PATCH_COURSES':
      return patchCourses(state, action);
    case 'PATCH_GROUPS':
      return patchGroups(state, action);
    case 'PATCH_GROUP_INVITES':
      return patchGroupInvites(state, action);
    default:
      return state;
  }
}
