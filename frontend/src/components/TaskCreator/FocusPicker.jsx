// @flow strict

import React from 'react';
import Pin from '../../assets/svgs/pin-2-dark-outline.svg';
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
  const iconStyle = { /* color: pinned ? 'black' : 'gray' */
    backgroundImage: `url(${pinned ? Pin : Pin})`,
  };
  return (
    <div className={styles.Main}>
      <span role="presentation" onClick={clickPicker} className={styles.Label}>
        <Pin className={styles.CenterIcon} />
      </span>
    </div>
  );
}
