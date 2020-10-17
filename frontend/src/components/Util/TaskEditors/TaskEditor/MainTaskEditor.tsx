import React, { KeyboardEvent, ReactElement, SyntheticEvent } from 'react';
import { getDateWithDateString } from 'common/util/datetime-util';
import styles from './index.module.scss';
import CheckBox from '../../../UI/CheckBox';
import SamwiseIcon from '../../../UI/SamwiseIcon';
import { editMainTask } from '../../../../firebase/actions';

type NameCompleteInFocus = {
  readonly name: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
};
type Props = NameCompleteInFocus & {
  readonly id: string;
  readonly icalUID?: string;
  readonly taskDate: Date | null;
  readonly dateAppeared: string;
  readonly onChange: (change: Partial<NameCompleteInFocus>) => void;
  readonly onRemove: () => void;
  readonly onPressEnter: (id: 'main-task' | number) => void;
  readonly memberName?: string; // only supplied if task is a group task
};

const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function MainTaskEditor({
  id,
  icalUID,
  taskDate,
  dateAppeared,
  name,
  complete,
  inFocus,
  onChange,
  onRemove,
  onPressEnter,
  memberName,
}: Props): ReactElement {
  const replaceDateForFork =
    taskDate == null ? getDateWithDateString(taskDate, dateAppeared) : null;
  const editComplete = (): void => editMainTask(id, replaceDateForFork, { complete: !complete });
  const editInFocus = (): void => editMainTask(id, replaceDateForFork, { inFocus: !inFocus });

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter('main-task');
  };

  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newValue = event.currentTarget.value;
    onChange({ name: newValue });
  };

  const isCanvasTask = typeof icalUID === 'string' ? icalUID !== '' : false;

  return (
    <div className={styles.TaskEditorFlexibleContainer}>
      <CheckBox className={styles.TaskEditorCheckBox} checked={complete} onChange={editComplete} />
      <input
        type="text"
        disabled={isCanvasTask}
        data-lpignore="true"
        className={complete ? styles.TaskEditorStrikethrough : styles.TaskEditorFlexibleInput}
        placeholder="Main Task"
        value={name}
        onKeyDown={onKeyDown}
        onChange={onInputChange}
      />
      {memberName ? (
        <SamwiseIcon iconName="bell-light" className={styles.TaskEditorIcon} onClick={() => {}} />
      ) : (
        <SamwiseIcon
          iconName={inFocus ? 'pin-light-filled' : 'pin-light-outline'}
          className={styles.TaskEditorIcon}
          onClick={editInFocus}
        />
      )}
      {isCanvasTask ? null : (
        <SamwiseIcon iconName="x-light" className={deleteIconClass} onClick={onRemove} />
      )}
    </div>
  );
}

const Memoized = React.memo(MainTaskEditor);
export default Memoized;
