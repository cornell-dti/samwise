import { Map } from 'immutable';
import {
  SubTask,
  Task,
  RepeatingPattern,
  RepeatMetaData,
  ForkedTaskMetaData,
  TaskWithSubTasks,
} from '../types/store-types';
import { isBitSet } from './bitwise-util';

/**
 * This is the utility module for array of tasks and subtasks.
 * This module implements many common functional operations on an array of tasks or subtasks.
 * Other modules should try to call functions in this module instead of implementing their own.
 */

export const getFilteredNotCompletedInFocusTask = (
  task: Task,
  subTasks: Map<string, SubTask>,
): TaskWithSubTasks | null => {
  const { children, ...rest } = task;
  const childrenArray = children.map((id) => subTasks.get(id)).filter((s) => s != null);
  const newSubTasks: SubTask[] = [];
  if (task.inFocus) {
    if (!task.complete) {
      childrenArray.forEach((s) => {
        if (s != null && !s.complete) {
          newSubTasks.push(s);
        }
      });
    } else {
      return null;
    }
  } else {
    childrenArray.forEach((s) => {
      if (s != null && s.inFocus && !task.complete && !s.complete) {
        newSubTasks.push(s);
      }
    });
    if (newSubTasks.length === 0) {
      return null;
    }
  }
  return { ...rest, subTasks: newSubTasks.sort((a, b) => a.order - b.order) };
};

export const getFilteredCompletedInFocusTask = (
  task: Task,
  subTasks: Map<string, SubTask>,
): TaskWithSubTasks | null => {
  const { children, ...rest } = task;
  const childrenArray = children.map((id) => subTasks.get(id)).filter((s) => s != null);
  const newSubTasks: SubTask[] = [];
  if (task.inFocus) {
    if (task.complete) {
      childrenArray.forEach((s) => {
        if (s != null) {
          newSubTasks.push(s);
        }
      });
    } else {
      childrenArray.forEach((s) => {
        if (s != null && s.complete) {
          newSubTasks.push(s);
        }
      });
      if (newSubTasks.length === 0) {
        return null;
      }
    }
  } else {
    childrenArray.forEach((s) => {
      if (s != null && s.inFocus && (task.complete || s.complete)) {
        newSubTasks.push(s);
      }
    });
    if (newSubTasks.length === 0) {
      return null;
    }
  }
  return { ...rest, subTasks: newSubTasks.sort((a, b): number => a.order - b.order) };
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
  inFocusTasks: Task[],
  subTasks: Map<string, SubTask>,
): TasksProgressProps => {
  let completedTasksCount = 0;
  let allTasksCount = 0;
  for (let i = 0; i < inFocusTasks.length; i += 1) {
    const task = inFocusTasks[i];
    if (task.inFocus) {
      allTasksCount += task.children.size + 1;
    } else {
      allTasksCount += task.children.reduce((acc, s) => {
        const subTask = subTasks.get(s);
        if (subTask == null) {
          return acc;
        }
        return acc + (subTask.inFocus ? 1 : 0);
      }, 0);
    }
    if (task.complete) {
      completedTasksCount += task.children.reduce(
        (acc, s) => {
          const subTask = subTasks.get(s);
          if (subTask == null) {
            return acc;
          }
          return acc + (task.inFocus || subTask.inFocus ? 1 : 0);
        },
        task.inFocus ? 1 : 0,
      );
    } else {
      completedTasksCount += task.children.reduce((acc, s) => {
        const subTask = subTasks.get(s);
        if (subTask == null) {
          return acc;
        }
        return acc + ((task.inFocus || subTask.inFocus) && subTask.complete ? 1 : 0);
      }, 0);
    }
  }
  return { completedTasksCount, allTasksCount };
};

/**
 * @param date the date to check.
 * @param pattern the repeats pattern to be checked against.
 * @returns whether the repeating pattern matches the given date.
 */
function dateMatchRepeatPattern(date: Date, pattern: RepeatingPattern): boolean {
  switch (pattern.type) {
    case 'WEEKLY':
      return isBitSet(pattern.bitSet, date.getDay(), 7);
    case 'BIWEEKLY':
      throw new Error('NOT_SUPPORTED_YET');
    case 'MONTHLY':
      return isBitSet(pattern.bitSet, date.getDate(), 31);
    default:
      throw new Error();
  }
}

/**
 * @param date the date to check.
 * @param repeats the repeats metadata to be checked against.
 * @param forks the forks of the repeating task to be checked against.
 * @returns whether the given date can host a repeats given all the repeats info.
 */
export function dateMatchRepeats(
  date: Date,
  repeats: RepeatMetaData,
  forks: readonly ForkedTaskMetaData[],
): boolean {
  const dateString = date.toDateString();
  if (forks.some(({ replaceDate }) => replaceDate.toDateString() === dateString)) {
    // it's a one time task or a fork, not a repeat
    return false;
  }
  const { startDate, endDate, pattern } = repeats;
  if (date < startDate) {
    // before the start
    return false;
  }
  if (endDate instanceof Date) {
    if (date > endDate) {
      // after the end
      return false;
    }
    return dateMatchRepeatPattern(date, pattern);
  }
  const repeatCount: number = endDate;
  let passedRepeats = 0;
  const currentDate = new Date(startDate);
  while (currentDate < date) {
    if (dateMatchRepeatPattern(currentDate, pattern)) {
      passedRepeats += 1;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (passedRepeats >= repeatCount) {
      // after n occurences
      return false;
    }
  }
  return dateMatchRepeatPattern(date, pattern);
}
