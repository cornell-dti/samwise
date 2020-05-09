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

// TODO: refactor ical task to a separate category
export type OneTimeTaskMetadata = {
  readonly type: 'ONE_TIME';
  readonly date: Date;
  icalUID?: string;
};

export type GroupTaskMetadata = {
  readonly type: 'GROUP';
  readonly date: Date;
  group: string; // documentid for associated group
}

export type RepeatingPattern =
  | { readonly type: 'WEEKLY'; readonly bitSet: number /* 7-bit */ }
  | { readonly type: 'BIWEEKLY'; readonly bitSet: number /* 14-bit */ }
  | { readonly type: 'MONTHLY'; readonly bitSet: number /* 31-bit */ };

export type ForkedTaskMetaData = {
  readonly forkId: string | null;
  readonly replaceDate: Date;
};

export type RepeatingDate = {
  readonly startDate: Date;
  readonly endDate: Date | number;
  readonly pattern: RepeatingPattern;
}

export type RepeatingTaskMetadata = {
  readonly type: 'MASTER_TEMPLATE';
  readonly date: RepeatingDate;
  readonly forks: readonly ForkedTaskMetaData[];
};

export type TaskMetadata =
  OneTimeTaskMetadata | RepeatingTaskMetadata | GroupTaskMetadata;

export type Task<M = TaskMetadata> = {
  readonly id: string;
  readonly order: number;
  readonly owner: string;
  readonly name: string; // Example: "Task 1 name"
  readonly tag: string; // ID of the tag
  readonly complete: boolean;
  readonly inFocus: boolean; // Whether the task is in focus
  readonly children: readonly SubTask[];
  readonly metadata: M;
};

export type MainTask = {
  readonly owner: string;
  readonly name: string;
  readonly tag: string;
  readonly date: Date | RepeatingDate;
  readonly complete: boolean;
  readonly inFocus: boolean;
};
/**
 * The task type without id and subtask, and with all properties as optional.
 */
export type PartialMainTask = Partial<MainTask>;

/**
 * The type of user settings.
 */
export type Theme = 'light' | 'dark';
export type Settings = {
  readonly canvasCalendar: string | null | undefined;
  readonly completedOnboarding: boolean;
  readonly theme: Theme;
};

export type BannerMessageIds = '2019-03-10-quota-exceeded-incident';

export type BannerMessageStatus = {
  readonly [I in BannerMessageIds]?: boolean;
};

/**
 * The type of a group entry.
 */

export type Group = {
  readonly id: string;
  readonly name: string;
  readonly members: readonly string[];
  readonly deadline: Date;
  readonly classCode?: string;
}

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
 * The type for a pending group invite
 */
export type PendingGroupInvite = {
  readonly id: string;
  readonly group: string;
  readonly inviterName: string; // Name of person who sent invite
}

/**
 * The type of the entire redux state.
 */
export type State = {
  readonly tags: Map<string, Tag>;
  readonly tasks: Map<string, Task>;
  // Mapping of subtask id to main task id.
  // It contains all subtask ids that the main task knows but the redux store does not have yet.
  readonly missingSubTasks: Map<string, string>;
  // Mapping of subtask id to its object for fast access.
  // It contains all subtasks that the redux store knows but belongs to no known main task yet.
  readonly orphanSubTasks: Map<string, SubTask>;
  // A fast access map to quickly find all main task id within a date.
  readonly dateTaskMap: Map<string, Set<string>>;
  // A set of all ids of repeating tasks.
  readonly repeatedTaskSet: Set<string>;
  readonly settings: Settings;
  readonly bannerMessageStatus: BannerMessageStatus;
  readonly courses: Map<string, Course[]>;
  readonly groups: Map<string, Group>;
  readonly pendingInvites: Map<string, PendingGroupInvite>;
};
