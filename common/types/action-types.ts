import { Map } from 'immutable';
import { Course, Settings, Task, Tag, BannerMessageStatus, Group } from './store-types';

export type PatchTags = {
  readonly type: 'PATCH_TAGS';
  readonly created: Tag[];
  readonly edited: Tag[];
  readonly deleted: string[];
};

export type PatchTasks = {
  readonly type: 'PATCH_TASKS';
  readonly created: Task[];
  readonly edited: Task[];
  readonly deleted: string[];
};

export type PatchSettings = {
  readonly type: 'PATCH_SETTINGS';
  readonly settings: Settings;
};

export type PatchBannerMessageStatus = {
  readonly type: 'PATCH_BANNER_MESSAGES';
  readonly change: BannerMessageStatus;
};

export type PatchCourses = {
  readonly type: 'PATCH_COURSES';
  readonly courses: Map<string, Course[]>;
};

export type PatchGroups = {
  readonly type: 'PATCH_GROUPS';
  readonly created: Group[];
  readonly edited: Group[];
  readonly deleted: string[];
};

export type PatchGroupInvites = {
  readonly type: 'PATCH_GROUP_INVITES';
  readonly created: Group[];
  readonly edited: Group[];
  readonly deleted: string[];
};

export type Action =
  | PatchTags
  | PatchTasks
  | PatchSettings
  | PatchBannerMessageStatus
  | PatchCourses
  | PatchGroups
  | PatchGroupInvites;
