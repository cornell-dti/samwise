import { Map, Set } from 'immutable';

export type Tag = {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly color: string;
  readonly classId: string | null;
};

export type SubTask = {
  readonly id: string;
  readonly order: number;
  readonly name: string; // Example: "SubTask 1 Name"
  readonly complete: boolean;
  readonly inFocus: boolean; // Whether the subtask is in focus
};

export type SubTaskWithoutId = Pick<SubTask, 'order' | 'name' | 'complete' | 'inFocus'>;
export type SubTaskWithoutIdOrder = Pick<SubTask, 'name' | 'complete' | 'inFocus'>;
/**
 * The subtask type without id order and with every field as optional.
 */
export type PartialSubTask = Partial<SubTaskWithoutIdOrder>;

export type CommonTask<D> = {
  readonly id: string;
  readonly order: number;
  readonly name: string; // Example: "Task 1 name"
  readonly tag: string; // ID of the tag
  readonly date: D;
  readonly complete: boolean;
  readonly inFocus: boolean; // Whether the task is in focus
  readonly children: Set<string>;
};

type FlexibleCommonTask = CommonTask<Date | RepeatMetaData>;

export type OneTimeTask = CommonTask<Date> & {
  readonly type: 'ONE_TIME';
  readonly icalUID?: string;
};

/**
 * The task type without id and every field optional.
 * Fields that are filled represent differences from master template
 */

export type PartialTask = Partial<Pick<FlexibleCommonTask, MainTaskProperties | 'children'>>;

export type RepeatingPattern =
  | { readonly type: 'WEEKLY'; readonly bitSet: number /* 7-bit */ }
  | { readonly type: 'BIWEEKLY'; readonly bitSet: number /* 14-bit */ }
  | { readonly type: 'MONTHLY'; readonly bitSet: number /* 31-bit */ };

export type RepeatMetaData = {
  readonly startDate: Date;
  readonly endDate: Date | number;
  readonly pattern: RepeatingPattern;
};

export type ForkedTaskMetaData = {
  readonly forkId: string | null;
  readonly replaceDate: Date;
};

export type RepeatingTask = CommonTask<RepeatMetaData> & {
  readonly type: 'MASTER_TEMPLATE';
  readonly forks: readonly ForkedTaskMetaData[];
};

export type Task = OneTimeTask | RepeatingTask;

type MainTaskProperties = 'name' | 'tag' | 'date' | 'complete' | 'inFocus';
/**
 * The task type without id and subtask.
 */
export type MainTask = Readonly<Pick<FlexibleCommonTask, MainTaskProperties>>;
/**
 * The task type without id and subtask, and with all properties as optional.
 */
export type PartialMainTask = Partial<MainTask>;

type CommonTaskWithSubTasks<D> = {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly tag: string;
  readonly date: D;
  readonly complete: boolean;
  readonly inFocus: boolean;
  readonly subTasks: SubTask[];
};

export type TaskWithSubTasks =
  | (CommonTaskWithSubTasks<Date> & { readonly type: 'ONE_TIME' })
  | (CommonTaskWithSubTasks<RepeatMetaData> & { readonly type: 'MASTER_TEMPLATE' });

/**
 * The type of user settings.
 */
export type Settings = {
  readonly canvasCalendar: string | null | undefined;
  readonly completedOnboarding: boolean;
  readonly theme: 'light' | 'dark';
};

export type BannerMessageIds =
  | '2019-03-10-quota-exceeded-incident';

export type BannerMessageStatus = {
  readonly [I in BannerMessageIds]?: boolean;
};

/**
 * The type of a course info entry.
 */
export type Course = {
  readonly courseId: number;
  readonly subject: string;
  readonly courseNumber: string;
  readonly title: string;
  readonly examTimes: { readonly type: 'final' | 'prelim'; readonly time: number }[];
};

/**
 * The type of the entire redux state.
 */
export type State = {
  readonly tags: Map<string, Tag>;
  readonly tasks: Map<string, Task>;
  readonly subTasks: Map<string, SubTask>;
  readonly dateTaskMap: Map<string, Set<string>>;
  readonly repeatedTaskSet: Set<string>;
  readonly taskChildrenMap: Map<string, Set<string>>;
  readonly settings: Settings;
  readonly bannerMessageStatus: BannerMessageStatus;
  readonly courses: Map<string, Course[]>;
};
