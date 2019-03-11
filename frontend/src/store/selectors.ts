import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { Map, Set } from 'immutable';
import { State, SubTask, Tag, Task, BannerMessageStatus } from './store-types';
import { computeTaskProgress, TasksProgressProps } from '../util/task-util';
import { NONE_TAG } from '../util/tag-util';
import findMessageToDisplay, { MessageWithId } from '../components/TitleBar/Banner/messages';

/*
 * --------------------------------------------------------------------------------
 * Part 1: Selector Utilities
 * --------------------------------------------------------------------------------
 */

const createSetEqualSelector = createSelectorCreator(
  defaultMemoize,
  // @ts-ignore ts is a little stupid with generics. Probably a ts bug.
  (a: Set<string>, b: Set<string>) => a.equals(b),
);

type SelectorOf<T, Props = void> = (state: State, ownProps: Props) => T;

/*
 * --------------------------------------------------------------------------------
 * Part 2: Simple & Direct Selectors
 * --------------------------------------------------------------------------------
 */

const getTags = ({ tags }: State): Map<string, Tag> => tags;
const getTasks = ({ tasks }: State): Map<string, Task> => tasks;
const getDateTaskMap = ({ dateTaskMap }: State): Map<string, Set<string>> => dateTaskMap;
const getSubTasks = ({ subTasks }: State): Map<string, SubTask> => subTasks;
const getBannerMessageStatus = (
  { bannerMessageStatus }: State,
): BannerMessageStatus => bannerMessageStatus;

const getTasksId = ({ tasks }: State): Set<string> => Set(tasks.keys());

export const getTagById = ({ tags }: State, id: string): Tag => tags.get(id) || NONE_TAG;
export const getTaskById = ({ tasks }: State, id: string): Task | null | undefined => tasks.get(id);
export const getSubTaskById = (
  { subTasks }: State, id: string,
): SubTask | null | undefined => subTasks.get(id);

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
    .filter(t => t.inFocus || t.children.some((id) => {
      const subTask = subTasks.get(id);
      return subTask == null ? false : subTask.inFocus;
    })),
);

export const getTaskIds: SelectorOf<{ readonly ids: string[] }> = createSetEqualSelector(
  getTasksId, (ids: Set<string>) => ({ ids: ids.toArray() }),
);

type IdOrder = { readonly id: string; readonly order: number };
type IdOrderListProps = { readonly idOrderList: IdOrder[] };
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
    const list: IdOrder[] = [];
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

type BannerProps = { readonly message: MessageWithId | null };
export const getBannerMessage: SelectorOf<BannerProps> = createSelector(
  getBannerMessageStatus, status => ({ message: findMessageToDisplay(status) }),
);
