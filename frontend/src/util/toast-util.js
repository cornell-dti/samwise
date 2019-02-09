// @flow strict

import emitToast from '../components/UI/UndoToast';
import { dispatchAction } from '../store/store';
import {
  undoAddTask,
  undoDeleteTask,
  clearUndoAddTask,
  clearUndoDeleteTask,
} from '../store/actions';
import type { Task } from '../store/store-types';
import { date2String } from './datetime-util';

/**
 * Emit a toast for undoing removing task.
 */
export function emitUndoAddTaskToast(task: Task): void {
  const message = `Added Task "${task.name}" on ${date2String(task.date)}.`;
  emitToast({
    toastId: 'add-task',
    message,
    onUndo: () => { dispatchAction(undoAddTask()); },
    onDismiss: () => { dispatchAction(clearUndoAddTask()); },
  });
}

/**
 * Emit a toast for undoing removing task.
 */
export function emitUndoRemoveTaskToast(task: Task): void {
  const message = `Removed Task "${task.name}" on ${date2String(task.date)}.`;
  emitToast({
    toastId: 'remove-task',
    message,
    onUndo: () => { dispatchAction(undoDeleteTask()); },
    onDismiss: () => { dispatchAction(clearUndoDeleteTask()); },
  });
}
