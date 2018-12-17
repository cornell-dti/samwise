// @flow strict

import emitToast from '../components/UI/UndoToast';
import { dispatchAction } from '../store/store';
import { clearUndoDeleteTask, undoDeleteTask } from '../store/actions';
import type { Task } from '../store/store-types';
import { date2String } from './datetime-util';

/**
 * Emit a toast for undoing removing task.
 *
 * @param {string} task the removed task.
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
