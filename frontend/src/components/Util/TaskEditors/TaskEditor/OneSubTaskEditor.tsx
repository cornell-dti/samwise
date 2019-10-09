import React, {
  KeyboardEvent,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useRef,
} from 'react';
import styles from './index.module.css';
import CheckBox from '../../../UI/CheckBox';
import { PartialSubTask, SubTask } from '../../../../store/store-types';
import SamwiseIcon from '../../../UI/SamwiseIcon';

type Props = {
  readonly subTask: SubTask; // the subtask to edit
  readonly mainTaskComplete: boolean; // whether the main task is completed
  readonly needToBeFocused: boolean; // whether it needs to be focused.
  readonly afterFocusedCallback: () => void; // need to be called once we focused the subtask
  readonly editSubTask: (subtaskId: string, partialSubTask: PartialSubTask) => void;
  readonly removeSubTask: (subtaskId: string) => void;
  readonly onPressEnter: (id: 'main-task' | number) => void;
};

const className = [styles.TaskEditorFlexibleContainer, styles.TaskEditorSubtaskCheckBox].join(' ');
const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function OneSubTaskEditor(
  {
    subTask,
    mainTaskComplete,
    needToBeFocused,
    afterFocusedCallback,
    editSubTask,
    removeSubTask,
    onPressEnter,
  }: Props,
): ReactElement {
  const onNameChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    editSubTask(subTask.id, { name: event.currentTarget.value });
  };
  const onCompleteChange = (): void => editSubTask(subTask.id, { complete: !subTask.complete });
  const onInFocusChange = (): void => editSubTask(subTask.id, { inFocus: !subTask.inFocus });
  const onRemove = (): void => removeSubTask(subTask.id);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter(subTask.order);
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
    <div className={className}>
      <CheckBox
        className={styles.TaskEditorCheckBox}
        checked={mainTaskComplete || subTask.complete}
        disabled={mainTaskComplete}
        onChange={onCompleteChange}
      />
      <input
        className={subTask.complete || mainTaskComplete
          ? styles.TaskEditorStrikethrough : styles.TaskEditorFlexibleInput}
        placeholder="Your Subtask"
        value={subTask.name}
        ref={editorRef}
        onKeyDown={onKeyDown}
        onChange={onNameChange}
        style={{ width: 'calc(100% - 70px)' }}
      />
      <SamwiseIcon
        iconName={subTask.inFocus ? 'pin-light-filled' : 'pin-light-outline'}
        className={styles.TaskEditorIcon}
        onClick={onInFocusChange}
      />
      <SamwiseIcon iconName="x-light" onClick={onRemove} className={deleteIconClass} />
    </div>
  );
}

const Memoized = React.memo(
  OneSubTaskEditor,
  (prev, curr) => prev.subTask === curr.subTask
    && prev.needToBeFocused === curr.needToBeFocused
    && prev.mainTaskComplete === curr.mainTaskComplete,
);
export default Memoized;
