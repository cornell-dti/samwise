import { Map } from 'immutable';
import { SubTask, Task } from '../store/store-types';
import { TaskWithSubTasks } from '../components/Util/TaskEditors/editors-types';

/**
 * This is the utility module for array of tasks and subtasks.
 * This module implements many common functional operations on an array of tasks or subtasks.
 * Other modules should try to call functions in this module instead of implementing their own.
 */

export const getFilteredNotCompletedInFocusTask = (
  task: Task, subTasks: Map<string, SubTask>,
): TaskWithSubTasks | null => {
  const { children, ...rest } = task;
  const childrenArray = children.map(id => subTasks.get(id)).filter(s => s != null);
  const newSubTasks: SubTask[] = [];
  if (task.inFocus) {
    if (!task.complete) {
      childrenArray.forEach((s) => {
        if (s != null) { newSubTasks.push(s); }
      });
    } else {
      return null;
    }
  } else {
    childrenArray.forEach((s) => {
      if (s != null && s.inFocus && !s.complete) { newSubTasks.push(s); }
    });
    if (newSubTasks.length === 0) {
      return null;
    }
  }
  return { ...rest, subTasks: newSubTasks.sort((a, b) => a.order - b.order) };
};

export const getFilteredCompletedInFocusTask = (
  task: Task, subTasks: Map<string, SubTask>,
): TaskWithSubTasks | null => {
  const { children, ...rest } = task;
  const childrenArray = children.map(id => subTasks.get(id)).filter(s => s != null);
  const newSubTasks: SubTask[] = [];
  if (task.inFocus) {
    if (task.complete) {
      childrenArray.forEach((s) => {
        if (s != null) { newSubTasks.push(s); }
      });
    } else {
      return null;
    }
  } else {
    childrenArray.forEach((s) => {
      if (s != null && s.inFocus && s.complete) { newSubTasks.push(s); }
    });
    if (newSubTasks.length === 0) {
      return null;
    }
  }
  return { ...rest, subTasks: newSubTasks.sort((a, b) => a.order - b.order) };
};

export type TasksProgressProps = {
  readonly completedTasksCount: number;
  readonly allTasksCount: number;
};

/**
 * Compute the progress given a list of filtered tasks.
 *
 * @param {Task[]} inFocusTasks in-focus filtered tasks.
 * @param {Map<string, SubTask>} subTasks all subtasks map as a reference.
 * @return {TasksProgressProps} the progress.
 */
export const computeTaskProgress = (
  inFocusTasks: Task[], subTasks: Map<string, SubTask>,
): TasksProgressProps => {
  let completedTasksCount = 0;
  let allTasksCount = 0;
  for (let i = 0; i < inFocusTasks.length; i += 1) {
    const task = inFocusTasks[i];
    if (task.inFocus) {
      allTasksCount += task.children.size + 1;
    } else {
      allTasksCount += task.children.reduce(
        (acc, s) => {
          const subTask = subTasks.get(s);
          if (subTask == null) {
            return acc;
          }
          return acc + (subTask.inFocus ? 1 : 0);
        }, 0,
      );
    }
    if (task.complete) {
      completedTasksCount += task.children.size + 1;
    } else {
      completedTasksCount += task.children.reduce(
        (acc, s) => {
          const subTask = subTasks.get(s);
          if (subTask == null) {
            return acc;
          }
          return acc + ((task.inFocus || subTask.inFocus) && subTask.complete ? 1 : 0);
        }, 0,
      );
    }
  }
  return { completedTasksCount, allTasksCount };
};
