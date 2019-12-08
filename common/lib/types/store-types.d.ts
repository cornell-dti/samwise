import { Map, Set } from 'immutable';
export declare type Tag = {
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly color: string;
    readonly classId: string | null;
};
export declare type SubTask = {
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly complete: boolean;
    readonly inFocus: boolean;
};
export declare type SubTaskWithoutId = Pick<SubTask, 'order' | 'name' | 'complete' | 'inFocus'>;
export declare type SubTaskWithoutIdOrder = Pick<SubTask, 'name' | 'complete' | 'inFocus'>;
/**
 * The subtask type without id order and with every field as optional.
 */
export declare type PartialSubTask = Partial<SubTaskWithoutIdOrder>;
export declare type CommonTask<D> = {
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly tag: string;
    readonly date: D;
    readonly complete: boolean;
    readonly inFocus: boolean;
    readonly children: Set<string>;
};
declare type FlexibleCommonTask = CommonTask<Date | RepeatMetaData>;
export declare type OneTimeTask = CommonTask<Date> & {
    readonly type: 'ONE_TIME';
};
/**
 * The task type without id and every field optional.
 * Fields that are filled represent differences from master template
 */
export declare type PartialTask = Partial<Pick<FlexibleCommonTask, MainTaskProperties | 'children'>>;
export declare type RepeatingPattern = {
    readonly type: 'WEEKLY';
    readonly bitSet: number;
} | {
    readonly type: 'BIWEEKLY';
    readonly bitSet: number;
} | {
    readonly type: 'MONTHLY';
    readonly bitSet: number;
};
export declare type RepeatMetaData = {
    readonly startDate: Date;
    readonly endDate: Date | number;
    readonly pattern: RepeatingPattern;
};
export declare type ForkedTaskMetaData = {
    readonly forkId: string | null;
    readonly replaceDate: Date;
};
export declare type RepeatingTask = CommonTask<RepeatMetaData> & {
    readonly type: 'MASTER_TEMPLATE';
    readonly forks: readonly ForkedTaskMetaData[];
};
export declare type Task = OneTimeTask | RepeatingTask;
declare type MainTaskProperties = 'name' | 'tag' | 'date' | 'complete' | 'inFocus';
/**
 * The task type without id and subtask.
 */
export declare type MainTask = Readonly<Pick<FlexibleCommonTask, MainTaskProperties>>;
/**
 * The task type without id and subtask, and with all properties as optional.
 */
export declare type PartialMainTask = Partial<MainTask>;
declare type CommonTaskWithSubTasks<D> = {
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly tag: string;
    readonly date: D;
    readonly complete: boolean;
    readonly inFocus: boolean;
    readonly subTasks: SubTask[];
};
export declare type TaskWithSubTasks = (CommonTaskWithSubTasks<Date> & {
    readonly type: 'ONE_TIME';
}) | (CommonTaskWithSubTasks<RepeatMetaData> & {
    readonly type: 'MASTER_TEMPLATE';
});
/**
 * The type of user settings.
 */
export declare type Settings = {
    readonly canvasCalendar: string | null | undefined;
    readonly completedOnboarding: boolean;
    readonly theme: 'light' | 'dark';
};
export declare type BannerMessageIds = '2019-03-10-quota-exceeded-incident';
export declare type BannerMessageStatus = {
    readonly [I in BannerMessageIds]?: boolean;
};
/**
 * The type of a course info entry.
 */
export declare type Course = {
    readonly courseId: number;
    readonly subject: string;
    readonly courseNumber: string;
    readonly title: string;
    readonly examTimes: {
        readonly type: 'final' | 'prelim';
        readonly time: number;
    }[];
};
/**
 * The type of the entire redux state.
 */
export declare type State = {
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
export {};
