import ReactGA from 'react-ga';
import { AppUser } from 'firebase/auth-util';

export const initialize = (): void => {
  ReactGA.initialize('UA-134683024-1', {
    debug: process.env.NODE_ENV !== 'production',
    gaOptions: {
      sampleRate: 100,
    },
  });
  ReactGA.pageview(window.location.pathname + window.location.search);
};

export const setGAUser = ({ uid }: AppUser): void => ReactGA.set({ userId: uid });

const reportEvent = (category: string, action: string): void => ReactGA.event({ category, action });

export const reportAddTagEvent = (): void => reportEvent('Tag', 'add-tag');
export const reportEditTagEvent = (): void => reportEvent('Tag', 'edit-tag');
export const reportDeleteTagEvent = (): void => reportEvent('Tag', 'delete-tag');

export const reportAddTaskEvent = (): void => reportEvent('Task', 'add-task');
export const reportEditTaskEvent = (): void => reportEvent('Task', 'edit-task');
export const reportDeleteTaskEvent = (): void => reportEvent('Task', 'delete-task');

export const reportAddSubTaskEvent = (): void => reportEvent('SubTask', 'add-sub-task');
export const reportEditSubTaskEvent = (): void => reportEvent('SubTask', 'edit-sub-task');
export const reportDeleteSubTaskEvent = (): void => reportEvent('SubTask', 'delete-sub-task');

export const reportCompleteTaskEvent = (): void => reportEvent('Task', 'complete');
export const reportFocusTaskEvent = (): void => reportEvent('Task', 'focus');
