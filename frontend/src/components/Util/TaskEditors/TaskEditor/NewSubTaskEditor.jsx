// @flow strict

import React from 'react';
import type { Node } from 'react';
import styles from './TaskEditor.css';

type Props = {|
  +onChange: (string) => void;
  +onPressEnter: () => void;
|};

export default function NewSubTaskEditor({ onChange, onPressEnter }: Props): Node {
  const onInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const newSubTaskValue: string = event.currentTarget.value.trim();
    if (newSubTaskValue.length > 0) {
      onChange(newSubTaskValue);
    }
  };
  const onKeyDown = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onPressEnter();
    }
  };
  return (
    <div className={styles.TaskEditorFlexibleContainer}>
      <input
        className={styles.TaskEditorFlexibleInput}
        placeholder="A new subtask"
        value=""
        onChange={onInputChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
