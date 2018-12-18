// @flow strict

import React from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';

type Props = {|
  +pinned: boolean;
  +onPinChange: (inFocus: boolean) => void;
|};

export default function FocusPicker({ pinned, onPinChange }: Props) {
  const clickPicker = (e: SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    onPinChange(!pinned);
  };
  const iconStyle = { color: pinned ? 'black' : 'gray' };
  return (
    <div className={styles.Main}>
      <span role="presentation" onClick={clickPicker} className={styles.Label}>
        <Icon name="pin" className={styles.CenterIcon} style={iconStyle} />
      </span>
    </div>
  );
}
