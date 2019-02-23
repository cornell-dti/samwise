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
import { identity } from '../util/general-util';
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
const getSubTasks = ({ subTasks }: State): Map<string, SubTask> => subTasks;

const getTagsId = ({ tags }: State): Set<string> => Set(tags.keys());
const getTasksId = ({ tasks }: State): Set<string> => Set(tasks.keys());
const getSubTasksId = ({ subTasks }: State): Set<string> => Set(subTasks.keys());

export const getTagById = ({ tags }: State, id: string): Tag => tags.get(id) ?? NONE_TAG;
export const getTaskById = ({ tasks }: State, id: string): ?Task => tasks.get(id);
export const getSubTaskById = ({ subTasks }: State, id: string): ?SubTask => subTasks.get(id);

// type TagProps = {| +tag: Tag |};

/*
 * --------------------------------------------------------------------------------
 * Part 3: Compound Selectors
 * --------------------------------------------------------------------------------
 */

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
export const getTaskIdOrderListForFocusView: SelectorOf<IdOrderListProps> = createSelector(
  getTasksInFocus, tasks => ({ idOrderList: tasks.map(({ id, order }) => ({ id, order })) }),
);


// TODO

export const getProgress: SelectorOf<TasksProgressProps> = createSelector(
  [getTasksInFocus, getSubTasks], computeTaskProgress,
);
