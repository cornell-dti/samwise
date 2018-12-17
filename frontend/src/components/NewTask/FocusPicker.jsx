// @flow strict

import React from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';

type Props = {|
  +pinned: boolean;
  +onPinChange: (inFocus: boolean) => void;
|};

export default class FocusPicker extends React.Component<Props> {

  handleOpenClose = (e: SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    const { pinned, onPinChange } = this.props;
    onPinChange(!pinned);
  };

  render() {
    const { pinned } = this.props;
    return (
      <div className={styles.Main}>
        <span
          role="button"
          tabIndex={-1}
          onClick={this.handleOpenClose}
          onKeyDown={() => {}}
          style={{ background: 'none' }}
          className={styles.Label}
        >
          <Icon
            name="pin"
            className={styles.CenterIcon}
            style={{ color: pinned ? 'black' : 'gray' }}
          />
        </span>
      </div>
    );
  }
}
