// @flow strict

import { Set } from 'immutable';
import type { SubTask, Task } from '../store/store-types';
import emitToast from '../components/UI/UndoToast';
import { date2String } from './datetime-util';
import { addTask, removeTask } from '../firebase/actions';

type TaskWithFullChildren = {|
  ...$ReadOnly<$Diff<Task, { +children: Set<string> }>>;
  +children: SubTask[];
|};

let lastAddedTask: TaskWithFullChildren | null = null;
let lastRemovedTask: TaskWithFullChildren | null = null;

export function clearLastAddedTask(performUndo: boolean): void {
  if (lastAddedTask !== null) {
    if (performUndo) {
      const { children, ...rest } = lastAddedTask;
      const task = { ...rest, children: Set(children.map(s => s.id)) };
      removeTask(task, 'no-undo');
    }
    lastAddedTask = null;
  }
}

export function clearLastRemovedTask(performUndo: boolean): void {
  if (lastRemovedTask !== null) {
    if (performUndo) {
      const {
        id, order, children, ...rest
      } = lastRemovedTask;
      addTask(rest, children.map(({ id: _, ...s }) => s), 'no-undo');
    }
    lastRemovedTask = null;
  }
}

/**
 * Emit a toast for undoing removing task.
 */
export function emitUndoAddTaskToast(task: TaskWithFullChildren): void {
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
export function emitUndoRemoveTaskToast(task: TaskWithFullChildren): void {
  lastRemovedTask = task;
  const message = `Removed Task "${task.name}" on ${date2String(task.date)}.`;
  emitToast({
    toastId: 'task-management',
    message,
    onUndo: () => clearLastRemovedTask(true),
    onDismiss: () => clearLastRemovedTask(false),
  });
}
