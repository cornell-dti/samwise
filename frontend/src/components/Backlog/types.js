// @flow

/**
 * The type for a simplified task with just enough information needed to render the backlog
 * day component.
 */
export type SimpleTask = {| name: string; color: string, completed: boolean |};
/**
 * All the tasks for one day.
 */
export type OneDayTask = {| date: Date; tasks: SimpleTask[] |};
