// @flow strict

import React from 'react';
import type { Node } from 'react';
import styles from './TaskEditor.css';

type Props = {|
  +onChange: (string) => void;
  +needToBeFocused: boolean;
  +afterFocusedCallback: () => void;
  +onPressEnter: () => void;
|};

export default function NewSubTaskEditor(
  {
    onChange, needToBeFocused, afterFocusedCallback, onPressEnter,
  }: Props,
): Node {
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

  const editorRef = React.useRef(null);

  React.useEffect(() => {
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
        ref={editorRef}
        className={styles.TaskEditorFlexibleInput}
        placeholder="A new subtask"
        value=""
        onChange={onInputChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
