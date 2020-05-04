import React, { ReactElement, SyntheticEvent, KeyboardEvent } from 'react';
import styles from './Picker.module.css';
import SamwiseIcon from '../UI/SamwiseIcon';

type Props = {
  readonly pinned: boolean;
  readonly onPinChange: (inFocus: boolean) => void;
};

export default function FocusPicker({ pinned, onPinChange }: Props): ReactElement {
  const clickPicker = (e: SyntheticEvent<HTMLElement>): void => {
    e.stopPropagation();
    onPinChange(!pinned);
  };
  const pressedPicker = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      onPinChange(!pinned);
    }
  };
  const pinIconName = pinned ? 'pin-dark-filled' : 'pin-dark-outline';
  return (
    <div className={styles.Main}>
      <span
        role="presentation"
        onClick={clickPicker}
        onKeyPress={pressedPicker}
        className={styles.Label}
      >
        <SamwiseIcon iconName={pinIconName} className={styles.CenterIcon} tabIndex={-1} />
      </span>
    </div>
  );
}
