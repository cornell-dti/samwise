import React, { KeyboardEvent, ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import styles from './index.module.css';

type Props = {
  readonly onChange: (change: string) => void;
  readonly needToBeFocused: boolean;
  readonly afterFocusedCallback: () => void;
  readonly onPressEnter: () => void;
  readonly type: 'MASTER_TEMPLATE' | 'ONE_TIME';
};

export default function NewSubTaskEditor(
  {
    onChange, needToBeFocused, afterFocusedCallback, onPressEnter, type,
  }: Props,
): ReactElement {
  const [subTaskValue, setSubTaskValue] = useState<string>('');
  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newSubTaskValue: string = event.currentTarget.value.trim();
    setSubTaskValue(newSubTaskValue);
    if (type !== 'ONE_TIME' && newSubTaskValue.length > 0) {
      onChange(newSubTaskValue);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      setSubTaskValue('');
      onChange(subTaskValue);
      if (type === 'ONE_TIME') {
        onPressEnter();
      }
    }
  };

  const editorRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (needToBeFocused) {
      const currentElement = editorRef.current;
      if (currentElement != null) {
        currentElement.focus();
        afterFocusedCallback();
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
