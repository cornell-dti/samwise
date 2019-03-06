// @flow strict

import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { Set } from 'immutable';
import type { Map } from 'immutable';
import type {
  State,
  SubTask,
  Tag,
  Task,
} from './store-types';
import { computeTaskProgress } from '../util/task-util';
import type { TasksProgressProps } from '../util/task-util';
import { NONE_TAG } from '../util/tag-util';

/*
 * --------------------------------------------------------------------------------
 * Part 1: Selector Utilities
 * --------------------------------------------------------------------------------
 */

const createSetEqualSelector = createSelectorCreator(
  defaultMemoize,
  (a: Set<string>, b: Set<string>) => a.equals(b),
);

type SelectorOf<T, Props = void> = (State, Props) => T;

/*
 * --------------------------------------------------------------------------------
 * Part 2: Simple & Direct Selectors
 * --------------------------------------------------------------------------------
 */

const getTags = ({ tags }: State): Map<string, Tag> => tags;
const getTasks = ({ tasks }: State): Map<string, Task> => tasks;
const getDateTaskMap = ({ dateTaskMap }: State): Map<string, Set<string>> => dateTaskMap;
const getSubTasks = ({ subTasks }: State): Map<string, SubTask> => subTasks;

const getTasksId = ({ tasks }: State): Set<string> => Set(tasks.keys());

export const getTagById = ({ tags }: State, id: string): Tag => tags.get(id) ?? NONE_TAG;
export const getTaskById = ({ tasks }: State, id: string): ?Task => tasks.get(id);
export const getSubTaskById = ({ subTasks }: State, id: string): ?SubTask => subTasks.get(id);

/*
 * --------------------------------------------------------------------------------
 * Part 3: Compound Selectors
 * --------------------------------------------------------------------------------
 */

export const getOrderedTags: SelectorOf<Tag[]> = createSelector(
  getTags, tags => Array.from(tags.values()).sort((a, b) => a.order - b.order),
);

const getTasksInFocus: SelectorOf<Task[]> = createSelector(
  [getTasks, getSubTasks],
  (tasks, subTasks) => Array
    .from(tasks.values())
    .filter(t => t.inFocus || t.children.some(id => subTasks.get(id)?.inFocus ?? false)),
);

export const getTaskIds: SelectorOf<{| ids: string[] |}> = createSetEqualSelector(
  getTasksId, ids => ({ ids: ids.toArray() }),
);

type IdOrder = {| +id: string; +order: number |};
type IdOrderListProps = {| +idOrderList: IdOrder[] |};
export const getTaskIdOrderList: SelectorOf<IdOrderListProps> = createSelector(
  getTasks, tasks => ({
    idOrderList: Array.from(tasks.values())
      .map(({ id, order }) => ({ id, order }))
      .sort((a, b) => a.order - b.order),
  }),
);
export const createGetIdOrderListByDate = (
  date: string,
): SelectorOf<IdOrderListProps> => createSelector(
  [getTasks, getDateTaskMap], (tasks, dateTaskMap) => {
    const set = dateTaskMap.get(date);
    if (set == null) {
      return { idOrderList: [] };
    }
    const list = [];
    set.forEach((id) => {
      const task = tasks.get(id);
      if (task != null) {
        const { order } = task;
        list.push({ id, order });
      }
    });
    return { idOrderList: list.sort((a, b) => a.order - b.order) };
  },
);

export const getProgress: SelectorOf<TasksProgressProps> = createSelector(
  [getTasksInFocus, getSubTasks], computeTaskProgress,
);
