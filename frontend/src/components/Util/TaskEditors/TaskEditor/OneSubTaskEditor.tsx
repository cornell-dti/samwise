import React, { KeyboardEvent, ReactElement, SyntheticEvent, useEffect, useRef } from 'react';
import { SubTask } from 'common/types/store-types';
import CheckBox from '../../../UI/CheckBox';
import SamwiseIcon from '../../../UI/SamwiseIcon';
import styles from './index.module.scss';

type Props = {
  readonly subTask: SubTask; // the subtask to edit
  readonly mainTaskComplete: boolean; // whether the main task is completed
  readonly needToBeFocused: boolean; // whether it needs to be focused.
  readonly onEdit: (update: Partial<SubTask>, subTaskToUpdate: SubTask) => void;
  readonly onRemove: (subTaskToRemove: SubTask) => void;
  readonly onPressEnter: (id: 'main-task' | number) => void;
  readonly memberName?: string; // only supplied if task is a group task
  readonly canMarkCompleteOrFocus: boolean;
};

const className = [styles.TaskEditorFlexibleContainer, styles.TaskEditorSubtaskCheckBox].join(' ');
const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function OneSubTaskEditor({
  subTask,
  mainTaskComplete,
  needToBeFocused,
  onEdit,
  onRemove,
  onPressEnter,
  memberName,
  canMarkCompleteOrFocus,
}: Props): ReactElement {
  const editThisSubTask = (update: Partial<SubTask>): void => {
    onEdit(update, subTask);
  };

  const onCompleteChange = (): void => {
    if (canMarkCompleteOrFocus) {
      const complete = !subTask.complete;
      editThisSubTask({ complete });
    }
  };
  const onInFocusChange = (): void => {
    if (canMarkCompleteOrFocus) {
      const inFocus = !subTask.inFocus;
      editThisSubTask({ inFocus });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter(subTask.order);
  };

  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newValue = event.currentTarget.value;
    editThisSubTask({ name: newValue });
  };
  const onBlur = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
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
    <div className={className}>
      <CheckBox
        className={styles.TaskEditorCheckBox}
        checked={mainTaskComplete || subTask.complete}
        disabled={mainTaskComplete || !canMarkCompleteOrFocus}
        onChange={onCompleteChange}
      />
      <input
        type="text"
        data-lpignore="true"
        className={
          subTask.complete || mainTaskComplete
            ? styles.TaskEditorStrikethrough
            : styles.TaskEditorFlexibleInput
        }
        placeholder="Your Subtask"
        value={subTask.name}
        ref={editorRef}
        onKeyDown={onKeyDown}
        onChange={onInputChange}
        onBlur={onBlur}
        onMouseLeave={onBlur}
        style={{ width: 'calc(100% - 70px)' }}
      />
      {memberName ? null : (
        <SamwiseIcon
          iconName={subTask.inFocus ? 'pin-light-filled' : 'pin-light-outline'}
          className={styles.TaskEditorIcon}
          onClick={onInFocusChange}
        />
      )}
      <SamwiseIcon
        iconName="x-light"
        onClick={() => onRemove(subTask)}
        className={deleteIconClass}
      />
    </div>
  );
}

const Memoized = React.memo(
  OneSubTaskEditor,
  (prev, curr) =>
    prev.subTask === curr.subTask &&
    prev.needToBeFocused === curr.needToBeFocused &&
    prev.mainTaskComplete === curr.mainTaskComplete
);
export default Memoized;
