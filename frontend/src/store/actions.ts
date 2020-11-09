import { Map } from 'immutable';
import {
  PatchCourses,
  PatchTags,
  PatchTasks,
  PatchSettings,
  PatchBannerMessageStatus,
  PatchGroups,
  PatchGroupInvites,
} from 'common/types/action-types';
import { Course, Tag, Settings, BannerMessageStatus, Group, Task } from 'common/types/store-types';

export const patchTags = (created: Tag[], edited: Tag[], deleted: string[]): PatchTags => ({
  type: 'PATCH_TAGS',
  created,
  edited,
  deleted,
});

export const patchTasks = (created: Task[], edited: Task[], deleted: string[]): PatchTasks => ({
  type: 'PATCH_TASKS',
  created,
  edited,
  deleted,
});

export const patchSettings = (settings: Settings): PatchSettings => ({
  type: 'PATCH_SETTINGS',
  settings,
});

export const patchBannerMessageStatus = (
  change: BannerMessageStatus
): PatchBannerMessageStatus => ({
  type: 'PATCH_BANNER_MESSAGES',
  change,
});

export const patchCourses = (courses: Map<string, Course[]>): PatchCourses => ({
  type: 'PATCH_COURSES',
  courses,
});

export const patchGroups = (created: Group[], edited: Group[], deleted: string[]): PatchGroups => ({
  type: 'PATCH_GROUPS',
  created,
  edited,
  deleted,
});

export const patchGroupInvites = (
  created: Group[],
  edited: Group[],
  deleted: string[]
): PatchGroupInvites => ({
  type: 'PATCH_GROUP_INVITES',
  created,
  edited,
  deleted,
});
