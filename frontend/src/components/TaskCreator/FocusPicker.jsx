// @flow strict

import React from 'react';
import PinOutline from '../../assets/svgs/pin-2-dark-outline.svg';
import Pin from '../../assets/svgs/pin-2-dark-filled.svg';
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
  const pinIconClass = styles.CenterIcon;
  return (
    <div className={styles.Main}>
      <span role="presentation" onClick={clickPicker} className={styles.Label}>
        {pinned ? <Pin className={pinIconClass} /> : <PinOutline className={pinIconClass} />}
      </span>
    </div>
  );
}
