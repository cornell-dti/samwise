import React, { ReactElement } from 'react';
import { useTodayLastSecondTime } from 'hooks/time-hook';
import FutureViewControl from './FutureViewControl';
import FutureViewNDays from './FutureViewNDays';
import FutureViewSevenColumns from './FutureViewSevenColumns';
import {
  FutureViewContainerType,
  FutureViewDisplayOption,
  SimpleDate,
} from './future-view-types';
import { useMappedWindowSize } from '../../../hooks/window-size-hook';

export type FutureViewConfig = {
  readonly displayOption: FutureViewDisplayOption;
  readonly offset: number;
};

export type FutureViewConfigProvider = {
  readonly initialValue: FutureViewConfig;
  readonly isInNDaysView: (config: FutureViewConfig) => boolean;
};
export const futureViewConfigProvider: FutureViewConfigProvider = {
  initialValue: {
    displayOption: {
      containerType: 'N_DAYS',
      doesShowCompletedTasks: true,
    },
    offset: 0,
  },
  isInNDaysView: (config: FutureViewConfig) => config.displayOption.containerType === 'N_DAYS',
};

/**
 * Compute the start date and end date.
 *
 * @param {Date} today today object from React hooks.
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewContainerType} containerType the container type.
 * @param {number} offset offset of displaying days.
 * @return {{startDate: Date, endDate: Date}} the start date and end date.
 */
function computeStartAndEndDay(
  today: Date, nDays: number, containerType: FutureViewContainerType, offset: number,
): { readonly startDate: Date; readonly endDate: Date } {
  // Compute start date (the first date to display)
  const startDate = new Date(today);
  let hasAdditionalDays = false;
  switch (containerType) {
    case 'N_DAYS':
      startDate.setDate(startDate.getDate() + offset * nDays);
      break;
    case 'BIWEEKLY':
      startDate.setDate(startDate.getDate() - startDate.getDay() + offset * 14);
      break;
    case 'MONTHLY':
      startDate.setMonth(startDate.getMonth() + offset, 1);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      hasAdditionalDays = startDate.getDate() !== 1;
      break;
    default:
  }
  // Compute end date (the first date not to display)
  let endDate = new Date(startDate); // the first day not to display.
  switch (containerType) {
    case 'N_DAYS':
      endDate.setDate(endDate.getDate() + nDays);
      break;
    case 'BIWEEKLY':
      endDate.setDate(endDate.getDate() + 14);
      break;
    case 'MONTHLY':
      if (hasAdditionalDays) {
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 2, 1);
      } else {
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
      }
      break;
    default:
      throw new Error('Impossible Case');
  }
  return { startDate, endDate };
}

/**
 * Returns an array of future view days given the current props and the display option.
 *
 * @param {Date} today today object from React hooks.
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewConfig} config the display config.
 * @return {Date[]} an array of backlog days information.
 */
function buildDaysInFutureView(
  today: Date, nDays: number, config: FutureViewConfig,
): readonly SimpleDate[] {
  const { displayOption: { containerType }, offset } = config;
  const { startDate, endDate } = computeStartAndEndDay(today, nDays, containerType, offset);
  // Adding the days to array
  const days: SimpleDate[] = [];
  for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
    const simpleDate: SimpleDate = {
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.getDate(),
      day: d.getDay(),
      text: d.toDateString(),
    };
    days.push(simpleDate);
  }
  return days;
}

type Props = {
  readonly config: FutureViewConfig;
  readonly onConfigChange: (config: FutureViewConfig) => void;
};

export default function FutureView(
  { config, onConfigChange }: Props,
): ReactElement {
  const today = useTodayLastSecondTime();

  // the number of days in n-days mode.
  const nDays = useMappedWindowSize(({ width }) => {
    if (width > 1280) { return 5; }
    if (width > 960) { return 4; }
    if (width > 840) { return 3; }
    return 1;
  });
  const controlOnChange = (change: Partial<FutureViewConfig>): void => {
    onConfigChange({ ...config, ...change });
  };

  const days = buildDaysInFutureView(today, nDays, config);
  const { displayOption, offset } = config;
  const { containerType, doesShowCompletedTasks } = displayOption;
  const daysContainer = containerType === 'N_DAYS'
    ? <FutureViewNDays days={days} doesShowCompletedTasks={doesShowCompletedTasks} />
    : <FutureViewSevenColumns days={days} doesShowCompletedTasks={doesShowCompletedTasks} />;
  return (
    <div>
      <FutureViewControl
        nDays={nDays}
        displayOption={displayOption}
        offset={offset}
        onChange={controlOnChange}
      />
      {daysContainer}
    </div>
  );
}
