// @flow strict

import { createSelector } from 'reselect';
import type { Map, Set } from 'immutable';
import type {
  State,
  SubTask,
  Tag,
  Task,
} from './store-types';
import { error } from '../util/general-util';
import { computeTaskProgress } from '../util/task-util';
import type { TasksProgressProps } from '../util/task-util';

type SelectorOf<T> = (State) => T;

const getTags = ({ tags }: State): Map<string, Tag> => tags;
const getTasks = ({ tasks }: State): Map<string, Task> => tasks;
const getSubTasks = ({ subTasks }: State): Map<string, SubTask> => subTasks;

const getTasksInFocus: SelectorOf<Task[]> = createSelector(
  [getTasks, getSubTasks],
  (tasks, subTasks) => Array
    .from(tasks.values())
    .filter(t => t.inFocus || t.children.some(id => subTasks.get(id)?.inFocus ?? false)),
);

export const getTaskIds: SelectorOf<{| ids: string[] |}> = createSelector(
  getTasks, tasks => ({ ids: Array.from(tasks.keys()) }),
);

type IdOrder = {| +id: string; +order: number |};
type IdOrderListProps = {| +idOrderList: IdOrder[] |};
export const getTaskIdOrderListForFocusView: SelectorOf<IdOrderListProps> = createSelector(
  getTasksInFocus, tasks => ({ idOrderList: tasks.map(({ id, order }) => ({ id, order })) }),
);

export const getProgress: SelectorOf<TasksProgressProps> = createSelector(
  [getTasksInFocus, getSubTasks], computeTaskProgress,
);
