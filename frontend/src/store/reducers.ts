import { Set } from 'immutable';
import {
  Action,
  PatchCourses,
  PatchTags,
  PatchTasks,
  PatchSubTasks,
  PatchSettings,
  PatchBannerMessageStatus,
} from 'common/lib/types/action-types';
import { State, SubTask, Task } from 'common/lib/types/store-types';
import { error } from 'common/lib/util/general-util';
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

  const missingSubTasksMap = new Map<string, string>();
  const orphanSubTasksToClear: string[] = [];
  const newTasks = state.tasks.withMutations((tasks) => {
    const unfoldSubTasks = (
      taskId: string,
      subTaskIds: readonly string[],
      existingSubTasks: readonly SubTask[],
    ): readonly SubTask[] => {
      let newIdSet = Set(subTaskIds);
      const unfolded: SubTask[] = [];
      existingSubTasks.forEach((subTask) => {
        if (newIdSet.has(subTask.id)) {
          newIdSet = newIdSet.remove(subTask.id);
          unfolded.push(subTask);
        }
      });
      // Remaining ids represent subtask that has not appeared yet.
      newIdSet.forEach((id) => {
        const orphanSubTask = state.orphanSubTasks.get(id);
        if (orphanSubTask != null) {
          orphanSubTasksToClear.push(id);
          newIdSet = newIdSet.remove(id);
          unfolded.push(orphanSubTask);
          return;
        }
        missingSubTasksMap.set(id, taskId);
      });
      return unfolded;
    };

    created.forEach((createdMainTask) => {
      const { children, ...mainTaskRest } = createdMainTask;
      const updatedChildren = unfoldSubTasks(createdMainTask.id, children, []);
      const mainTask: Task = { ...mainTaskRest, children: updatedChildren };
      tasks.set(createdMainTask.id, mainTask);
    });

    edited.forEach((editedMainTask) => {
      const { children, ...mainTaskRest } = editedMainTask;
      const existingSubTasks = tasks.get(mainTaskRest.id)?.children ?? [];
      const updatedChildren = unfoldSubTasks(
        editedMainTask.id,
        children,
        existingSubTasks,
      );
      const mainTask: Task = { ...mainTaskRest, children: updatedChildren };
      tasks.set(editedMainTask.id, mainTask);
    });

    deleted.forEach((id) => tasks.delete(id));
  });

  // Final updates
  const updatedMissingSubTasks = state.missingSubTasks.withMutations((map) => {
    missingSubTasksMap.forEach((mainTaskId, subTaskId) => map.set(subTaskId, mainTaskId));
  });
  const updatedOrphanSubTasks = state.orphanSubTasks.deleteAll(orphanSubTasksToClear);

  return {
    ...state,
    tasks: newTasks,
    missingSubTasks: updatedMissingSubTasks,
    orphanSubTasks: updatedOrphanSubTasks,
    dateTaskMap: newDateTaskMap,
    repeatedTaskSet: newRepeatedTaskSet,
  };
}

function patchSubTasks(state: State, { created, edited, deleted }: PatchSubTasks): State {
  const existingSubTaskToTaskMap = new Map<string, string>();
  Array.from(state.tasks.entries()).forEach(([id, task]) => {
    task.children.forEach((subTask) => existingSubTaskToTaskMap.set(subTask.id, id));
  });

  const missingSubTaskToClear: string[] = [];
  const newOrphanSubTasks: SubTask[] = [];
  const updatedTasks = state.tasks.withMutations((mutableTaskMap) => {
    created.forEach((createdSubTask) => {
      // By the time a subtask is created, a main task may or may not exist.
      const mainTaskId = state.missingSubTasks.get(createdSubTask.id);
      if (mainTaskId == null) {
        // For those that does not exist, we must put them into orphan sub-tasks for now.
        // The hope is that they will be stick to correct place in a later task patch.
        newOrphanSubTasks.push(createdSubTask);
      } else {
        // For those that do exist, they must have some missing subtasks.
        // We must stick them into correct places,
        mutableTaskMap.update(
          mainTaskId,
          (mainTask) => ({ ...mainTask, children: [...mainTask.children, createdSubTask] }),
        );
        missingSubTaskToClear.push(createdSubTask.id);
      }
    });

    edited.forEach((editedSubTask) => {
      // By the time a subtask is edited, the subtask, along with its parent, must exist!
      const mainTaskId = existingSubTaskToTaskMap.get(editedSubTask.id) ?? error('Must exist!');
      mutableTaskMap.update(
        mainTaskId,
        (mainTask) => {
          const children = mainTask.children.map(
            (subTask) => (subTask.id === editedSubTask.id ? editedSubTask : subTask),
          );
          return { ...mainTask, children };
        },
      );
    });

    deleted.forEach((deletedSubTaskId) => {
      const mainTaskId = existingSubTaskToTaskMap.get(deletedSubTaskId);
      if (mainTaskId == null) {
        // We might delete main task and subtask together, and main task is deleted before subtask.
        return;
      }
      mutableTaskMap.update(
        mainTaskId,
        (mainTask) => ({
          ...mainTask,
          children: mainTask.children.filter((subTask) => subTask.id !== deletedSubTaskId),
        }),
      );
    });
  });

  // Final batch updates for helper store tables.
  const updatedMissingSubTasks = state.missingSubTasks.deleteAll(missingSubTaskToClear);
  const updatedOrphanSubTasks = state.orphanSubTasks.withMutations((mutableOrphanSubTasks) => {
    newOrphanSubTasks.forEach((subTask) => mutableOrphanSubTasks.set(subTask.id, subTask));
  });

  return {
    ...state,
    tasks: updatedTasks,
    missingSubTasks: updatedMissingSubTasks,
    orphanSubTasks: updatedOrphanSubTasks,
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
