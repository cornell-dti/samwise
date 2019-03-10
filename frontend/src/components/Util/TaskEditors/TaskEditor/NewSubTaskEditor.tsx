import React, { KeyboardEvent, ReactElement, SyntheticEvent } from 'react';
import styles from './TaskEditor.css';

type Props = {
  readonly onChange: (change: string) => void;
  readonly needToBeFocused: boolean;
  readonly afterFocusedCallback: () => void;
  readonly onPressEnter: () => void;
};

export default function NewSubTaskEditor(
  {
    onChange, needToBeFocused, afterFocusedCallback, onPressEnter,
  }: Props,
): ReactElement {
  const onInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const newSubTaskValue: string = event.currentTarget.value.trim();
    if (newSubTaskValue.length > 0) {
      onChange(newSubTaskValue);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onPressEnter();
    }
  };

  const editorRef = React.useRef<HTMLInputElement | null>(null);

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
        placeholder="Add a Subtask"
        value=""
        onChange={onInputChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
