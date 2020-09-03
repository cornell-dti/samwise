import { promptChoice, promptConfirm } from 'components/Util/Modals';
import { Task, OneTimeTaskMetadata, RepeatingTaskMetadata } from 'common/lib/types/store-types';
import { removeTask, removeOneRepeatedTask } from 'firebase/actions';
import { store } from 'store/store';

/**
 * This is the utility module for array of tasks and subtasks.
 * This module implements many common functional operations on an array of tasks or subtasks.
 * Other modules should try to call functions in this module instead of implementing their own.
 */

const repeatedTaskEditChoices = {
  CANCEL_CHANGES: 'Cancel',
  CHANGE_MASTER_TEMPLATE: 'Edit All Occurences',
  FORK: 'Edit This Instance',
};

const repeatedTaskEditMasterConfirm = {
  CANCEL_CHANGES: 'Cancel',
  CHANGE_MASTER_TEMPLATE: 'Edit All Occurences',
};

export function promptRepeatedTaskEditChoice(): Promise<keyof typeof repeatedTaskEditChoices> {
  return promptChoice(
    'Do you want to edit all occurences of this task or this instance?',
    repeatedTaskEditChoices
  );
}

export function confirmRepeatedTaskEditMaster(): Promise<
  keyof typeof repeatedTaskEditMasterConfirm
> {
  return promptChoice(
    'Do you want to edit all occurences of this task?',
    repeatedTaskEditMasterConfirm
  );
}

function removeOneTimeTask(task: Task<OneTimeTaskMetadata>): void {
  const { tasks, repeatedTaskSet } = store.getState();
  const isFork = Array.from(repeatedTaskSet).some((repeatedTaskId): boolean => {
    const repeatedTask = tasks.get(repeatedTaskId) as Task<RepeatingTaskMetadata> | null;
    if (repeatedTask == null) {
      return false;
    }
    const { forks } = repeatedTask.metadata;
    for (let i = 0; i < forks.length; i += 1) {
      const fork = forks[i];
      if (fork.forkId === task.id) {
        return true;
      }
    }
    return false;
  });
  let prompt = '';
  if (!isFork) {
    prompt = 'Do you really want to remove this task? The removed task cannot be recovered.';
  } else {
    prompt = 'Do you really want to remove this forked task? The removed task cannot be recovered.';
  }
  promptConfirm(prompt).then((confirmed) => {
    if (confirmed) {
      removeTask(task);
    }
  });
}

const removeTaskFullChoices = {
  CANCEL_REMOVE: 'Cancel',
  REMOVE_ALL: 'Remove All',
  REMOVE_ONE: 'Remove This Instance',
};

const removeTaskPartialChoices = {
  CANCEL_REMOVE: 'Cancel',
  REMOVE_ALL: 'Remove All',
};

function removeRepeatingTask(task: Task<RepeatingTaskMetadata>, replaceDate: Date | null): void {
  const prompt = 'How do you want to remove this repeated task?';
  if (replaceDate === null) {
    promptChoice(prompt, removeTaskPartialChoices).then((c) => {
      switch (c) {
        case 'CANCEL_REMOVE':
          return;
        case 'REMOVE_ALL':
          removeTask(task);
          return;
        default:
          throw new Error();
      }
    });
  } else {
    promptChoice(prompt, removeTaskFullChoices).then((c) => {
      switch (c) {
        case 'CANCEL_REMOVE':
          return;
        case 'REMOVE_ALL':
          removeTask(task);
          return;
        case 'REMOVE_ONE':
          removeOneRepeatedTask(task.id, replaceDate);
          return;
        default:
          throw new Error();
      }
    });
  }
}

export function removeTaskWithPotentialPrompt(task: Task, replaceDate: Date | null): void {
  // The task is pattern matched on metadata only, so the following type casts are safe.
  if (task.metadata.type === 'ONE_TIME' || task.metadata.type === 'GROUP') {
    removeOneTimeTask(task as Task<OneTimeTaskMetadata>);
  } else {
    removeRepeatingTask(task as Task<RepeatingTaskMetadata>, replaceDate);
  }
}
