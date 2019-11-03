import { useState, useEffect } from 'react';

const INTERVAL = 1000;

let currentTime: number = new Date().getTime();

let testTime: number | null = null;

type Handler = (time: number) => void;

const handlers: Set<Handler> = new Set();

setInterval(() => {
  if (testTime === null) {
    currentTime = new Date().getTime();
    handlers.forEach((handler) => handler(currentTime));
  }
}, INTERVAL);

/**
 * Enable test mode for components that uses or indirectly uses the time hooks.
 * The test mode disables:
 * - Current time real time update.
 * - Reporting updated time to components.
 *
 * @param timeForTesting the value of current time used for deterministic time.
 */
export const enableTestMode = (timeForTesting: number): void => {
  testTime = timeForTesting;
  currentTime = testTime;
};

/**
 * Restart realtime time update when the test ends.
 */
export const disableTestMode = (): void => {
  testTime = null;
};

/**
 * A react state hooks that returns the current time every 1 second.
 * It will cause a re-render when a new value is returned.
 *
 * @returns the current time.
 */
export const useTime = (): number => {
  const [time, setTime] = useState(currentTime);

  useEffect(() => {
    const handler = (newTime: number): void => setTime(newTime);
    handlers.add(handler);
    return (): void => {
      handlers.delete(handler);
    };
  }, []);

  return time;
};

/**
 * A react state hooks that returns the current date every one day.
 * It will cause a re-render when a new value is returned.
 *
 * @returns a date object that falls within today's range.
 */
const useDate = (): Date => {
  const [currentDateString, setCurrentDateString] = useState(new Date(currentTime).toDateString());

  useEffect(() => {
    const handler = (newTime: number): void => {
      const newTimeDateString = new Date(newTime).toDateString();
      if (newTimeDateString !== currentDateString) {
        setCurrentDateString(newTimeDateString);
      }
    };
    handlers.add(handler);
    return (): void => {
      handlers.delete(handler);
    };
  }, [currentDateString]);

  return new Date(currentDateString);
};

/**
 * A react state hooks that returns the current date every one day.
 * It will cause a re-render when a new value is returned.
 *
 * @returns today at 23:59:59 (in user's browser's reported timezone) as a date object.
 */
export const useTodayLastSecondTime = (): Date => {
  const date = new Date(useDate());
  date.setHours(23, 59, 59);
  return date;
};

/**
 * A react state hooks that returns the current date every one day.
 * It will cause a re-render when a new value is returned.
 *
 * @returns today at 00:00:00 (in user's browser's reported timezone) as a date object.
 */
export const useTodayFirstSecondTime = (): Date => {
  const date = new Date(useDate());
  date.setHours(0, 0, 0);
  return date;
};
