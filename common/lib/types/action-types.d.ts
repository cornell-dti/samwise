import { Map } from 'immutable';
import { Course, Settings, SubTask, Tag, Task, BannerMessageStatus } from './store-types';
export declare type PatchTags = {
    readonly type: 'PATCH_TAGS';
    readonly created: Tag[];
    readonly edited: Tag[];
    readonly deleted: string[];
};
export declare type PatchTasks = {
    readonly type: 'PATCH_TASKS';
    readonly created: Task[];
    readonly edited: Task[];
    readonly deleted: string[];
};
export declare type PatchSubTasks = {
    readonly type: 'PATCH_SUBTASKS';
    readonly created: SubTask[];
    readonly edited: SubTask[];
    readonly deleted: string[];
};
export declare type PatchSettings = {
    readonly type: 'PATCH_SETTINGS';
    readonly settings: Settings;
};
export declare type PatchBannerMessageStatus = {
    readonly type: 'PATCH_BANNER_MESSAGES';
    readonly change: BannerMessageStatus;
};
export declare type PatchCourses = {
    readonly type: 'PATCH_COURSES';
    readonly courses: Map<string, Course[]>;
};
export declare type Action = PatchTags | PatchTasks | PatchSubTasks | PatchSettings | PatchBannerMessageStatus | PatchCourses;
