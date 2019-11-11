import React, { KeyboardEvent, ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import styles from './index.module.css';

type Props = {
  readonly onEnter: (change: string) => void;
  readonly needToBeFocused: boolean;
  readonly type: 'MASTER_TEMPLATE' | 'ONE_TIME';
};

export default function NewSubTaskEditor({ onEnter, needToBeFocused }: Props): ReactElement {
  const [subTaskValue, setSubTaskValue] = useState<string>('');
  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newSubTaskValue: string = event.currentTarget.value;
    if (newSubTaskValue.length > 0) {
      onEnter(newSubTaskValue);
    } else {
      setSubTaskValue(newSubTaskValue);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if ((event.key === 'Enter' || event.key === 'Tab') && subTaskValue !== '') {
      onEnter(subTaskValue);
      setSubTaskValue('');
    }
  };

  const editorRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (needToBeFocused) {
      const currentElement = editorRef.current;
      if (currentElement != null) {
        currentElement.focus();
      }
    }
  });

  return (
    <div className={styles.TaskEditorFlexibleContainer}>
      <input
        type="text"
        data-lpignore="true"
        ref={editorRef}
        className={styles.TaskEditorFlexibleInput}
        placeholder="Add a Subtask"
        value={subTaskValue}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
