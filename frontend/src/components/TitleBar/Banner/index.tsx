import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { State } from 'common/lib/types/store-types';
import { getBannerMessage } from '../../../store/selectors';
import styles from './index.module.css';
import { readBannerMessage } from '../../../firebase/actions';
import { MessageWithId } from './messages';

type Props = {
  readonly message: MessageWithId | null;
};

const Banner = ({ message }: Props): ReactElement | null => {
  if (message === null) {
    return null;
  }
  const dismissHandler = (): void => {
    readBannerMessage(message.id, true);
  };
  return (
    <div className={styles.Banner}>
      <span className={styles.Text}>{message.message}</span>
      <button type="button" className={styles.DismissButton} onClick={dismissHandler}>
        Dismiss
      </button>
    </div>
  );
};

const Connected = connect((state: State) => getBannerMessage(state))(Banner);
export default Connected;
