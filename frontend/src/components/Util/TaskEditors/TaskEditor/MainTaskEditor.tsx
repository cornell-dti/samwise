import React, { KeyboardEvent, ReactElement, SyntheticEvent, useState } from 'react';
import styles from './index.module.css';
import CheckBox from '../../../UI/CheckBox';
import SamwiseIcon from '../../../UI/SamwiseIcon';

type NameCompleteInFocus = {
  readonly name: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
};
type Props = NameCompleteInFocus & {
  readonly onChange: (change: Partial<NameCompleteInFocus>) => void;
  readonly onRemove: () => void;
  readonly onPressEnter: (id: 'main-task' | number) => void;
};

const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function MainTaskEditor(
  {
    name, complete, inFocus, onChange, onRemove, onPressEnter,
  }: Props,
): ReactElement {
  const editName = (event: SyntheticEvent<HTMLInputElement>): void => onChange({
    name: event.currentTarget.value,
  });
  const editComplete = (): void => onChange({ complete: !complete });
  const editInFocus = (): void => onChange({ inFocus: !inFocus });

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter('main-task');
  };

  return (
    <div className={styles.TaskEditorFlexibleContainer}>
      <CheckBox
        className={styles.TaskEditorCheckBox}
        checked={complete}
        onChange={editComplete}
      />
      <input
        className={styles.TaskEditorFlexibleInput}
        placeholder="Main Task"
        value={name}
        onKeyDown={onKeyDown}
        onChange={editName}
      />
      <SamwiseIcon
        iconName={inFocus ? 'pin-light-filled' : 'pin-light-outline'}
        className={styles.TaskEditorIcon}
        onClick={editInFocus}
      />
      <SamwiseIcon iconName="x-light" className={deleteIconClass} onClick={onRemove} />
    </div>
  );
}

const Memoized = React.memo(MainTaskEditor);
export default Memoized;
