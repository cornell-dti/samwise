import { Map } from 'immutable';
import { SubTask, Task, RepeatMetaData, ForkedTaskMetaData } from '../types/store-types';
/**
 * This is the utility module for array of tasks and subtasks.
 * This module implements many common functional operations on an array of tasks or subtasks.
 * Other modules should try to call functions in this module instead of implementing their own.
 */
export declare const getFilteredNotCompletedInFocusTask: (task: Task, subTasks: Map<string, SubTask>) => ({
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly tag: string;
    readonly date: Date;
    readonly complete: boolean;
    readonly inFocus: boolean;
    readonly subTasks: SubTask[];
} & {
    readonly type: "ONE_TIME";
}) | ({
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly tag: string;
    readonly date: RepeatMetaData;
    readonly complete: boolean;
    readonly inFocus: boolean;
    readonly subTasks: SubTask[];
} & {
    readonly type: "MASTER_TEMPLATE";
}) | null;
export declare const getFilteredCompletedInFocusTask: (task: Task, subTasks: Map<string, SubTask>) => ({
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly tag: string;
    readonly date: Date;
    readonly complete: boolean;
    readonly inFocus: boolean;
    readonly subTasks: SubTask[];
} & {
    readonly type: "ONE_TIME";
}) | ({
    readonly id: string;
    readonly order: number;
    readonly name: string;
    readonly tag: string;
    readonly date: RepeatMetaData;
    readonly complete: boolean;
    readonly inFocus: boolean;
    readonly subTasks: SubTask[];
} & {
    readonly type: "MASTER_TEMPLATE";
}) | null;
export declare type TasksProgressProps = {
    readonly completedTasksCount: number;
    readonly allTasksCount: number;
};
/**
 * Compute the progress given a list of filtered tasks.
 *
 * @param {Task[]} inFocusTasks in-focus filtered tasks.
 * @param {Map<string, SubTask>} subTasks all subtasks map as a reference.
 * @return {TasksProgressProps} the progress.
 */
export declare const computeTaskProgress: (inFocusTasks: Task[], subTasks: Map<string, SubTask>) => TasksProgressProps;
/**
 * @param date the date to check.
 * @param repeats the repeats metadata to be checked against.
 * @param forks the forks of the repeating task to be checked against.
 * @returns whether the given date can host a repeats given all the repeats info.
 */
export declare function dateMatchRepeats(date: Date, repeats: RepeatMetaData, forks: readonly ForkedTaskMetaData[]): boolean;
