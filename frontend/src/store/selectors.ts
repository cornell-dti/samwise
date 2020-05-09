import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { Map, Set } from 'immutable';
import { State, Tag, Task, BannerMessageStatus, RepeatingTaskMetadata } from 'common/lib/types/store-types';
import { NONE_TAG } from 'common/lib/util/tag-util';
import {
  computeTaskProgress,
  TasksProgressProps,
  getFilteredCompletedInFocusTask,
  getFilteredNotCompletedInFocusTask,
  dateMatchRepeats,
} from 'common/lib/util/task-util';
import findMessageToDisplay, { MessageWithId } from '../components/TitleBar/Banner/messages';

/*
 * --------------------------------------------------------------------------------
 * Part 1: Selector Utilities
 * --------------------------------------------------------------------------------
 */

const createSetEqualSelector = createSelectorCreator(
  defaultMemoize,
  // Bug in reselect type definition: https://github.com/reduxjs/reselect/issues/384
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
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
const getGroupTaskMap = ({ groupTaskMap }: State): Map<string, Set<string>> => groupTaskMap;
const getRepeatedTaskSet = ({ repeatedTaskSet }: State): Set<string> => repeatedTaskSet;
const getBannerMessageStatus = (
  { bannerMessageStatus }: State,
): BannerMessageStatus => bannerMessageStatus;

const getTasksId = ({ tasks }: State): Set<string> => Set(tasks.keys());

export const getTagById = ({ tags }: State, id: string): Tag => tags.get(id) ?? NONE_TAG;
export const getTaskById = ({ tasks }: State, id: string): Task | null | undefined => tasks.get(id);

/*
 * --------------------------------------------------------------------------------
 * Part 3: Compound Selectors
 * --------------------------------------------------------------------------------
 */

export const getOrderedTags: SelectorOf<Tag[]> = createSelector(
  getTags, (tags) => Array.from(tags.values()).sort((a, b) => a.order - b.order),
);

const getTasksInFocus: SelectorOf<Task[]> = createSelector(
  [getTasks],
  (tasks) => Array
    .from(tasks.values())
    .filter((t) => t.inFocus || t.children.some((subTask) => subTask.inFocus)),
);

export const getTaskIds: SelectorOf<{ readonly ids: string[] }> = createSetEqualSelector(
  getTasksId, (ids: Set<string>) => ({ ids: ids.toArray() }),
);

type IdOrder = { readonly id: string; readonly order: number };
type IdOrderListProps = { readonly idOrderList: IdOrder[] };

let createGetIdOrderListByDateSelectors = Map<string, SelectorOf<IdOrderListProps>>();

export const createGetIdOrderListByDate = (
  date: string,
): SelectorOf<IdOrderListProps> => {
  const existingSelector = createGetIdOrderListByDateSelectors.get(date);
  if (existingSelector != null) {
    return existingSelector;
  }
  const selector: SelectorOf<IdOrderListProps> = createSelector(
    [getTasks, getDateTaskMap, getRepeatedTaskSet], (tasks, dateTaskMap, repeatedTaskSet) => {
      const set = dateTaskMap.get(date);
      const list: IdOrder[] = [];
      if (set != null) {
        // date matches
        set.forEach((id) => {
          const task = tasks.get(id);
          if (task != null) {
            const { order } = task;
            list.push({ id, order });
          }
        });
      }
      // repeat matches
      const dateObj = new Date(date);
      repeatedTaskSet.forEach((id) => {
        const task = tasks.get(id);
        if (task == null) {
          return;
        }
        const repeatedTask = task as Task<RepeatingTaskMetadata>;
        if (dateMatchRepeats(dateObj, repeatedTask.metadata)) {
          const { order } = repeatedTask;
          list.push({ id, order });
        }
      });
      return { idOrderList: list.sort((a, b) => a.order - b.order) };
    },
  );
  createGetIdOrderListByDateSelectors = createGetIdOrderListByDateSelectors.set(date, selector);
  return selector;
};

let createGetIdOrderListByGroupSelectors = Map<string, SelectorOf<IdOrderListProps>>();

export const createGetIdOrderListByGroup = (
  groupId: string,
): SelectorOf<IdOrderListProps> => {
  const existingSelector = createGetIdOrderListByGroupSelectors.get(groupId);
  if (existingSelector != null) {
    return existingSelector;
  }
  const selector: SelectorOf<IdOrderListProps> = createSelector(
    [getTasks, getGroupTaskMap], (tasks, groupTaskMap) => {
      const set = groupTaskMap.get(groupId);
      const list: IdOrder[] = [];
      if (set != null) {
        set.forEach((id) => {
          const task = tasks.get(groupId);
          if (task != null) {
            const { order } = task;
            list.push({ id, order });
          }
        });
      }
      return { idOrderList: list.sort((a, b) => a.order - b.order) };
    },
  );
  createGetIdOrderListByGroupSelectors = createGetIdOrderListByGroupSelectors.set(
    groupId,
    selector,
  );
  return selector;
};


export const getProgress: SelectorOf<TasksProgressProps> = createSelector(
  [getTasksInFocus], computeTaskProgress,
);

export type FocusViewTaskMetaData = IdOrder & {
  readonly inFocusView: boolean; // whether the task is in the focus view
  readonly inCompleteFocusView: boolean; // whether the task in in the complete focus view
};
export type FocusViewProps = {
  readonly tasks: FocusViewTaskMetaData[];
  readonly progress: TasksProgressProps;
};

export const getFocusViewProps: SelectorOf<FocusViewProps> = createSelector(
  [getTasks, getProgress], (tasks, progress) => {
    const taskMetaDataList: FocusViewTaskMetaData[] = [];
    Array.from(tasks.values()).sort((a, b) => a.order - b.order).forEach((task) => {
      const filteredUncompletedTask = getFilteredNotCompletedInFocusTask(task);
      const filteredCompletedTask = getFilteredCompletedInFocusTask(task);
      const { id, order } = task;
      if (filteredCompletedTask != null && filteredUncompletedTask != null) {
        taskMetaDataList.push({ id, order, inFocusView: true, inCompleteFocusView: true });
        taskMetaDataList.push({ id, order, inFocusView: true, inCompleteFocusView: false });
      } else if (filteredCompletedTask != null) {
        taskMetaDataList.push({ id, order, inFocusView: true, inCompleteFocusView: true });
      } else if (filteredUncompletedTask != null) {
        taskMetaDataList.push({ id, order, inFocusView: true, inCompleteFocusView: false });
      } else {
        taskMetaDataList.push({ id, order, inFocusView: false, inCompleteFocusView: false });
      }
    });
    return { tasks: taskMetaDataList, progress };
  },
);

type BannerProps = { readonly message: MessageWithId | null };
export const getBannerMessage: SelectorOf<BannerProps> = createSelector(
  getBannerMessageStatus, (status) => ({ message: findMessageToDisplay(status) }),
);
