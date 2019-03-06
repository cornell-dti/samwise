/**
 * The different container types.
 */
export type FutureViewContainerType = 'N_DAYS' | 'BIWEEKLY' | 'MONTHLY';
/**
 * All the display options of future view.
 */
export type FutureViewDisplayOption = {
  readonly containerType: FutureViewContainerType;
  readonly doesShowCompletedTasks: boolean;
};

export type SimpleDate = {
  readonly year: number;
  readonly month: number;
  readonly date: number;
  readonly day: number;
  readonly text: string;
};
