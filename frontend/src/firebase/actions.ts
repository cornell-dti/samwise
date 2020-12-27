import { Map } from 'immutable';
import {
  SubTask,
  Tag,
  Task,
  BannerMessageIds,
  PartialTaskMainData,
  TaskMetadata,
  Group,
  RepeatingTaskMetadata,
} from 'common/types/store-types';
import { error, ignore } from 'common/util/general-util';
import Actions from 'common/firebase/common-actions';
import {
  reportAddTagEvent,
  reportEditTagEvent,
  reportDeleteTagEvent,
  reportAddTaskEvent,
  reportEditTaskEvent,
  reportDeleteTaskEvent,
  reportCompleteTaskEvent,
  reportFocusTaskEvent,
} from '../util/ga-util';
import { getAppUser } from './auth-util';
import { database } from './db';
import { store } from '../store/store';
import { Diff } from '../components/Util/TaskEditors/TaskEditor/task-diff-reducer';

const actions = new Actions(
  () => getAppUser().email,
  () => getAppUser().displayName,
  database
);

type WithoutIdOrder<Props> = Pick<Props, Exclude<keyof Props, 'id' | 'order'>>;
type WithoutId<Props> = Pick<Props, Exclude<keyof Props, 'id'>>;
export type TaskWithoutIdOrderChildren<M = TaskMetadata> = Omit<
  Task<M>,
  'id' | 'order' | 'children'
>;

export type TaskWithoutIdOrder<M = TaskMetadata> = Omit<Task<M>, 'id' | 'order'>;

/*
 * --------------------------------------------------------------------------------
 * Section 1: Tags Actions
 * --------------------------------------------------------------------------------
 */

export const addTag = (tag: WithoutIdOrder<Tag>): void => {
  const { tags } = store.getState();
  const { classId } = tag;
  if (classId != null && Array.from(tags.values()).some((t: Tag) => t.classId === classId)) {
    return;
  }
  actions.addTag(tag).then(reportAddTagEvent);
};

export const editTag = (tag: Tag): void => {
  actions.editTag(tag).then(reportEditTagEvent);
};

export const removeTag = (id: string): void => {
  actions.removeTag(id).then(reportDeleteTagEvent);
};

/*
 * --------------------------------------------------------------------------------
 * Section 2: Tasks Actions
 * --------------------------------------------------------------------------------
 */

export const addTask = (
  owner: readonly string[],
  task: TaskWithoutIdOrderChildren,
  subTasks: WithoutId<SubTask>[]
): void => {
  actions.addTask(owner, task, subTasks).then(() => reportAddTaskEvent());
};

export const removeAllForks = (taskId: string): void => {
  actions
    .removeAllForks(store.getState().tasks.get(taskId) as Task<RepeatingTaskMetadata>)
    .then(ignore);
};

export const handleTaskDiffs = (taskId: string, { mainTaskEdits }: Diff): void => {
  actions.handleTaskDiffs(taskId, { mainTaskEdits }).then(() => {
    if (
      mainTaskEdits.name ||
      mainTaskEdits.complete ||
      mainTaskEdits.date ||
      mainTaskEdits.inFocus ||
      mainTaskEdits.tag ||
      mainTaskEdits.children
    ) {
      reportEditTaskEvent();
    }
    if (mainTaskEdits.complete) {
      reportCompleteTaskEvent();
    }
    if (mainTaskEdits.inFocus) {
      reportFocusTaskEvent();
    }
  });
};

export type EditType = 'EDITING_MASTER_TEMPLATE' | 'EDITING_ONE_TIME_TASK';

export const editTaskWithDiff = (taskId: string, editType: EditType, diff: Diff): void => {
  actions.editTaskWithDiff(
    store.getState().tasks.get(taskId) ?? error(`Task with ${taskId} is not found!`),
    editType,
    diff
  );
};

export const forkTaskWithDiff = (taskId: string, replaceDate: Date, diff: Diff): void =>
  actions.forkTaskWithDiff(
    store.getState().tasks.get(taskId) as Task<RepeatingTaskMetadata>,
    replaceDate,
    diff
  );

export const removeTask = (task: Task): void => {
  actions.removeTask(store.getState(), task).then(() => reportDeleteTaskEvent());
};

export const removeOneRepeatedTask = (taskId: string, replaceDate: Date): void => {
  actions.removeOneRepeatedTask(store.getState(), taskId, replaceDate);
};

export const editMainTask = (
  taskId: string,
  replaceDate: Date | null,
  mainTaskEdits: PartialTaskMainData
): void =>
  actions.editMainTask(
    store.getState().tasks.get(taskId) ?? error(`Task with ${taskId} is not found!`),
    replaceDate,
    mainTaskEdits
  );

/*
 * --------------------------------------------------------------------------------
 * Section 3: Groups Actions
 * --------------------------------------------------------------------------------
 */

export const rejectInvite = async (groupID: string): Promise<void> =>
  actions.rejectInvite(store.getState(), groupID);

export const getInviterName = (groupID: string): string =>
  actions.getInviterName(store.getState(), groupID);

export const joinGroup = async (groupID: string): Promise<void> =>
  actions.joinGroup(store.getState(), groupID);

export const createGroup = (name: string, deadline: Date, classCode: string): void =>
  actions.createGroup(name, deadline, classCode);

export const leaveGroup = async (groupID: string): Promise<void> =>
  actions.leaveGroup(store.getState(), groupID);

export const updateGroup = async (group: Group): Promise<void> => actions.updateGroup(group);

export const sendInvite = async (groupID: string, inviteeEmail: string): Promise<void> =>
  actions.sendInvite(groupID, inviteeEmail);

export const addUserInfo = async (
  email: string,
  fullName: string,
  photoURL: string | null
): Promise<void> => actions.addUserInfo(email, fullName, photoURL);

/*
 * --------------------------------------------------------------------------------
 * Section 4: Other Compound Actions
 * --------------------------------------------------------------------------------
 */

export const clearFocus = (
  taskIds: readonly string[],
  subTasksWithParentTaskId: Map<string, SubTask[]>
): Promise<void> => actions.clearFocus(taskIds, subTasksWithParentTaskId);

export function completeTaskInFocus<T extends { readonly id: string; readonly order: number }>(
  completedTaskIdOrder: T
): void {
  store.dispatch(actions.completeTaskInFocus(store.getState(), completedTaskIdOrder));
}

export function applyReorder(orderFor: 'tags' | 'tasks', reorderMap: Map<string, number>): void {
  store.dispatch(actions.applyReorder(store.getState(), orderFor, reorderMap));
}

export const completeOnboarding = (completedOnboarding: boolean): void =>
  actions.completeOnboarding(completedOnboarding);

export const setCanvasCalendar = (canvasCalendar: string | null | undefined): void =>
  actions.setCanvasCalendar(canvasCalendar);

export const readBannerMessage = (bannerMessageId: BannerMessageIds, isRead: boolean): void =>
  actions.readBannerMessage(bannerMessageId, isRead);

export const importCourseExams = (): void => actions.importCourseExams(store.getState());
