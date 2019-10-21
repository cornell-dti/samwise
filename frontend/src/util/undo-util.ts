import { Set } from 'immutable';
import { SubTask, OneTimeTask, RepeatingTask } from '../store/store-types';
import { date2String } from './datetime-util';
import { addTask, removeTask } from '../firebase/actions';

type TaskWithFullChildrenMapper<T> = Pick<T, Exclude<keyof T, 'children'>> & {
  readonly children: SubTask[];
};
type OneTimeTaskWithFullChildren = TaskWithFullChildrenMapper<OneTimeTask>;
type RepeatedTaskWithFullChildren = TaskWithFullChildrenMapper<RepeatingTask>;
type TaskWithFullChildren = OneTimeTaskWithFullChildren | RepeatedTaskWithFullChildren;

let lastAddedTask: TaskWithFullChildren | null = null;
let lastRemovedTask: TaskWithFullChildren | null = null;

export function clearLastAddedTask(performUndo: boolean): void {
  if (lastAddedTask !== null) {
    if (performUndo) {
      const { children, ...rest } = lastAddedTask;
      const task = { ...rest, children: Set(children.map((s) => s.id)) };
      removeTask(task, 'no-undo');
    }
    lastAddedTask = null;
  }
}

export function clearLastRemovedTask(performUndo: boolean): void {
  if (lastRemovedTask !== null) {
    if (performUndo) {
      const { id, order, children, ...rest } = lastRemovedTask;
      /*
       * TODO:
       * Also handle the case where the task is a forked one-time task and we need to add the
       * metadata back to the master template.
       */
      addTask(rest, children.map(({ id: _, ...s }) => s), 'no-undo');
    }
    lastRemovedTask = null;
  }
}