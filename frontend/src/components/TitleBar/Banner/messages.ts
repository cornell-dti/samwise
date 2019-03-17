import { BannerMessageIds, BannerMessageStatus } from '../../../store/store-types';

/**
 * This file contains a list of all banner messages we may send.
 * It is a centralized place to compute what exact message we need to display.
 */

type MessagesType = { readonly [I in BannerMessageIds]: string };

const messages: MessagesType = {
  '2019-03-10-quota-exceeded-incident': 'Oopsies! Due to unexpectedly high traffic, Samwise was briefly down on the night of March 9 for an upgrade. Sorry for any inconvenience this may have caused you!',
};

// sorted in decreasing order of date
const messageIdCollection: BannerMessageIds[] = [
  // comment out the messages that no longer need to be displayed.
  // '2019-03-10-quota-exceeded-incident',
];

export type MessageWithId = { readonly id: BannerMessageIds; readonly message: string };

/**
 * @param status the current banner message status.
 * @returns [message id, the message to display], or null if we don't need to display any of them.
 */
export default function findMessageToDisplay(status: BannerMessageStatus): MessageWithId | null {
  // current stategy: only display the latest one
  for (let i = 0; i < messageIdCollection.length; i += 1) {
    const messageId = messageIdCollection[i];
    const messageStatus = status[messageId];
    const shouldBeDisplayed = messageStatus !== true;
    if (shouldBeDisplayed) {
      return { id: messageId, message: messages[messageId] };
    }
  }
  return null;
}
