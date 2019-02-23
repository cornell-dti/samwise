// @flow strict

/**
 * The different container types.
 */
export type FutureViewContainerType = 'N_DAYS' | 'BIWEEKLY' | 'MONTHLY';
/**
 * All the display options of future view.
 */
export type FutureViewDisplayOption = {|
  +containerType: FutureViewContainerType;
  +doesShowCompletedTasks: boolean;
|};

export type SimpleDate = {|
  +year: number;
  +month: number;
  +date: number;
  +day: number;
  +text: string;
|};
