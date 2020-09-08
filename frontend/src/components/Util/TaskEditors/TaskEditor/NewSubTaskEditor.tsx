import React, { KeyboardEvent, ReactElement, SyntheticEvent, useEffect, useRef } from 'react';
import styles from './index.module.scss';

type Props = {
  readonly onFirstType: (change: string) => void;
  readonly onPressEnter: () => void;
  readonly needToBeFocused: boolean;
};

export default function NewSubTaskEditor({
  onFirstType,
  onPressEnter,
  needToBeFocused,
}: Props): ReactElement {
  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newSubTaskValue: string = event.currentTarget.value.trim();
    if (newSubTaskValue.length > 0) {
      onFirstType(newSubTaskValue);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      onPressEnter();
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
        value=""
        onChange={onInputChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
