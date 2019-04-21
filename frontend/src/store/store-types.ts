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
  readonly lastEdited: Date;
};

/**
 * The subtask type without id and with every field as optional.
 */
export type PartialSubTask = Partial<Pick<SubTask, 'order' | 'name' | 'complete' | 'inFocus' | 'lastEdited'>>;

export type Task = {
  readonly id: string;
  readonly order: number;
  readonly name: string; // Example: "Task 1 name"
  readonly tag: string; // ID of the tag
  readonly date: Date; // Example: new Date()
  readonly complete: boolean;
  readonly inFocus: boolean; // Whether the task is in focus
  readonly children: Set<string>;
  readonly lastEdited: Date;
};

type MainTaskProperties = 'order' | 'name' | 'tag' | 'date' | 'complete' | 'inFocus' | 'lastEdited';
/**
 * The task type without id and subtask.
 */
export type MainTask = Readonly<Pick<Task, MainTaskProperties>>;
/**
 * The task type without id and subtask, and with all properties as optional.
 */
export type PartialMainTask = Partial<MainTask>;

/**
 * The type of user settings.
 */
export type Settings = {
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
  readonly dateTaskMap: Map<string, Set<string>>;
  readonly subTasks: Map<string, SubTask>;
  readonly taskChildrenMap: Map<string, Set<string>>;
  readonly settings: Settings;
  readonly bannerMessageStatus: BannerMessageStatus;
  readonly courses: Map<string, Course[]>;
};
