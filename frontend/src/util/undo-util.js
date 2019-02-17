// @flow strict

import type { Task } from '../store/store-types';
import emitToast from '../components/UI/UndoToast';
import { date2String } from './datetime-util';
import { addTask, removeTask } from '../firebase/actions';

let lastAddedTask: Task | null = null;
let lastRemovedTask: Task | null = null;

export function clearLastAddedTask(performUndo: boolean): void {
  if (lastAddedTask !== null) {
    if (performUndo) {
      removeTask(lastAddedTask, 'no-undo');
    }
    lastAddedTask = null;
  }
}

export function clearLastRemovedTask(performUndo: boolean): void {
  if (lastRemovedTask !== null) {
    if (performUndo) {
      const { id, order, ...rest } = lastRemovedTask;
      addTask(rest, 'no-undo');
    }
    lastRemovedTask = null;
  }
}


/**
 * Emit a toast for undoing removing task.
 */
export function emitUndoAddTaskToast(task: Task): void {
  lastAddedTask = task;
  const message = `Added Task "${task.name}" on ${date2String(task.date)}.`;
  emitToast({
    toastId: 'task-management',
    message,
    onUndo: () => clearLastAddedTask(true),
    onDismiss: () => clearLastAddedTask(false),
  });
}

/**
 * Emit a toast for undoing removing task.
 */
export function emitUndoRemoveTaskToast(task: Task): void {
  lastRemovedTask = task;
  const message = `Removed Task "${task.name}" on ${date2String(task.date)}.`;
  emitToast({
    toastId: 'task-management',
    message,
    onUndo: () => clearLastRemovedTask(true),
    onDismiss: () => clearLastRemovedTask(false),
  });
}
