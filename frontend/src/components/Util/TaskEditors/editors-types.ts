/**
 * This type species where the editor flows.
 * - 'left': to the left the element.
 * - 'right': to the right the element.
 * - null: defaults to 'center'.
 */
import { SubTask, RepeatMetaData } from '../../../store/store-types';

export type FloatingPosition = 'left' | 'right';
export type CalendarPosition = 'top' | 'bottom';

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
