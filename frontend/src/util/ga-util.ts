import firebase from 'firebase/app';
import 'firebase/analytics';
import { AppUser } from '../firebase/auth-util';

export const initialize = (): void => {
  firebase.analytics().logEvent('screen-view', { screenName: 'Homepage' });
};

type EventType =
  | 'add-tag'
  | 'edit-tag'
  | 'delete-tag'
  | 'add-task'
  | 'edit-task'
  | 'delete-task'
  | 'add-sub-task'
  | 'edit-sub-task'
  | 'delete-sub-task'
  | 'complete'
  | 'focus';

export const setGAUser = ({ uid }: AppUser): void => {
  firebase.analytics().setUserId(uid);
  firebase.analytics().logEvent('login', {});
};

const reportEvent = (eventType: EventType): void => {
  firebase.analytics().logEvent<EventType>(eventType, {});
};

export const reportAddTagEvent = (): void => reportEvent('add-tag');
export const reportEditTagEvent = (): void => reportEvent('edit-tag');
export const reportDeleteTagEvent = (): void => reportEvent('delete-tag');

export const reportAddTaskEvent = (): void => reportEvent('add-task');
export const reportEditTaskEvent = (): void => reportEvent('edit-task');
export const reportDeleteTaskEvent = (): void => reportEvent('delete-task');

export const reportAddSubTaskEvent = (): void => reportEvent('add-sub-task');
export const reportEditSubTaskEvent = (): void => reportEvent('edit-sub-task');
export const reportDeleteSubTaskEvent = (): void => reportEvent('delete-sub-task');

export const reportCompleteTaskEvent = (): void => reportEvent('complete');
export const reportFocusTaskEvent = (): void => reportEvent('focus');
