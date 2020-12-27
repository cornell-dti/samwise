import React, { ReactElement, SyntheticEvent, KeyboardEvent } from 'react';
import clsx from 'clsx';
import styles from './Picker.module.scss';
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
      <button
        type="button"
        onClick={clickPicker}
        onKeyPress={pressedPicker}
        className={clsx(styles.TestBorder, styles.Label)}
      >
        <SamwiseIcon iconName={pinIconName} className={clsx(styles.CenterIcon, styles.ImageSize)} />
      </button>
    </div>
  );
}
