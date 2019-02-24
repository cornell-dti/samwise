// @flow strict

/**
 * This type species where the editor flows.
 * - 'left': to the left the element.
 * - 'right': to the right the element.
 * - null: defaults to 'center'.
 */
import type { SubTask } from '../../../store/store-types';

export type FloatingPosition = 'left' | 'right';

export type TaskWithSubTasks = {|
  +id: string;
  +order: number;
  +name: string;
  +tag: string;
  +date: Date;
  +complete: boolean;
  +inFocus: boolean;
  +subTasks: SubTask[];
|};
