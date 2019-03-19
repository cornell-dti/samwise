/**
 * This type species where the editor flows.
 * - 'left': to the left the element.
 * - 'right': to the right the element.
 * - null: defaults to 'center'.
 */
import { SubTask } from '../../../store/store-types';

export type FloatingPosition = 'left' | 'right';
export type CalendarPosition = "top" | "bottom";

export type TaskWithSubTasks = {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly tag: string;
  readonly date: Date;
  readonly complete: boolean;
  readonly inFocus: boolean;
  readonly subTasks: SubTask[];
};
