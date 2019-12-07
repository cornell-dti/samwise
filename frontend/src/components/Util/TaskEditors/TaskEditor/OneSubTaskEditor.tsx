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
import { getDateWithDateString } from '../../../../util/datetime-util';
import { editSubTask } from '../../../../firebase/actions';

type Props = {
  readonly subTask: SubTask; // the subtask to edit
  readonly mainTaskComplete: boolean; // whether the main task is completed
  readonly mainTaskId: string;
  readonly taskDate: Date | null;
  readonly dateAppeared: string;
  readonly needToBeFocused: boolean; // whether it needs to be focused.
  readonly editThisSubTask: (subtaskId: string, partialSubTask: PartialSubTask) => void;
  readonly removeSubTask: (subtaskId: string) => void;
  readonly onPressEnter: (id: 'main-task' | number) => void;
};

const className = [styles.TaskEditorFlexibleContainer, styles.TaskEditorSubtaskCheckBox].join(' ');
const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function OneSubTaskEditor(
  {
    subTask,
    mainTaskComplete,
    mainTaskId,
    taskDate,
    dateAppeared,
    needToBeFocused,
    editThisSubTask,
    removeSubTask,
    onPressEnter,
  }: Props,
): ReactElement {
  const replaceDateForFork = taskDate == null
    ? getDateWithDateString(taskDate, dateAppeared)
    : null;
  const onCompleteChange = (): void => {
    const complete = !subTask.complete;
    editThisSubTask(subTask.id, { complete });
    editSubTask(mainTaskId, subTask.id, replaceDateForFork, { complete });
  };
  const onInFocusChange = (): void => {
    const inFocus = !subTask.inFocus;
    editThisSubTask(subTask.id, { inFocus });
    editSubTask(mainTaskId, subTask.id, replaceDateForFork, { inFocus });
  };
  const onRemove = (): void => removeSubTask(subTask.id);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter(subTask.order);
  };

  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newValue = event.currentTarget.value;
    editThisSubTask(subTask.id, { name: newValue });
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
        disabled={mainTaskComplete}
        onChange={onCompleteChange}
      />
      <input
        type="text"
        data-lpignore="true"
        className={subTask.complete || mainTaskComplete
          ? styles.TaskEditorStrikethrough : styles.TaskEditorFlexibleInput}
        placeholder="Your Subtask"
        value={subTask.name}
        ref={editorRef}
        onKeyDown={onKeyDown}
        onChange={onInputChange}
        onBlur={onBlur}
        onMouseLeave={onBlur}
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
