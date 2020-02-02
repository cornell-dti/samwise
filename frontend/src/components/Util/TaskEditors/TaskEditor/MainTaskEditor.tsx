import React, { KeyboardEvent, ReactElement, SyntheticEvent } from 'react';
import { getDateWithDateString } from 'common/lib/util/datetime-util';
import styles from './index.module.css';
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
};

const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function MainTaskEditor(
  {
    id, icalUID, taskDate, dateAppeared, name, complete, inFocus, onChange, onRemove, onPressEnter,
  }: Props,
): ReactElement {
  const replaceDateForFork = taskDate == null
    ? getDateWithDateString(taskDate, dateAppeared)
    : null;
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

  return (
    <div className={styles.TaskEditorFlexibleContainer}>
      <CheckBox
        className={styles.TaskEditorCheckBox}
        checked={complete}
        onChange={editComplete}
      />
      <input
        type="text"
        disabled={typeof icalUID === 'string' ? icalUID !== '' : false}
        data-lpignore="true"
        className={complete
          ? styles.TaskEditorStrikethrough : styles.TaskEditorFlexibleInput}
        placeholder="Main Task"
        value={name}
        onKeyDown={onKeyDown}
        onChange={onInputChange}
      />
      <SamwiseIcon
        iconName={inFocus ? 'pin-light-filled' : 'pin-light-outline'}
        className={styles.TaskEditorIcon}
        onClick={editInFocus}
      />
      <SamwiseIcon iconName="x-light" className={deleteIconClass} onClick={onRemove} />
    </div>
  );
}

const Memoized = React.memo(MainTaskEditor);
export default Memoized;
