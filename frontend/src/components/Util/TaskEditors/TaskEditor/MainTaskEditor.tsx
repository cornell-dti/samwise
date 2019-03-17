import React, { KeyboardEvent, ReactElement, SyntheticEvent } from 'react';
import Delete from '../../../../assets/svgs/XLight.svg';
import PinOutline from '../../../../assets/svgs/pin-2-light-outline.svg';
import Pin from '../../../../assets/svgs/pin-2-light-filled.svg';
import styles from './TaskEditor.css';
import CheckBox from '../../../UI/CheckBox';

type NameCompleteInFocus = {
  readonly name: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
};
type Props = NameCompleteInFocus & {
  readonly onChange: (change: Partial<NameCompleteInFocus>) => void;
  readonly onRemove: () => void;
  readonly onPressEnter: (id: 'main-task' | number) => void;
};

type NameCache = {
  readonly cached: string;
  readonly originalPropsName: string;
};

const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function MainTaskEditor(
  {
    name, complete, inFocus, onChange, onRemove, onPressEnter,
  }: Props,
): ReactElement {
  const [nameCache, setNameCache] = React.useState<NameCache>({
    cached: name,
    originalPropsName: name,
  });
  if (name !== nameCache.originalPropsName) {
    setNameCache({ cached: name, originalPropsName: name });
  }

  const editComplete = (): void => onChange({ complete: !complete });
  const editInFocus = (): void => onChange({ inFocus: !inFocus });

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter('main-task');
  };
  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newValue = event.currentTarget.value;
    setNameCache(prev => ({ ...prev, cached: newValue }));
  };
  const onBlur = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    if (name !== nameCache.cached) {
      onChange({ name: nameCache.cached });
    }
  };

  return (
    <div className={styles.TaskEditorFlexibleContainer}>
      <CheckBox
        className={styles.TaskEditorCheckBox}
        checked={complete}
        onChange={editComplete}
      />
      <input
        className={styles.TaskEditorFlexibleInput}
        placeholder="Main Task"
        value={nameCache.cached}
        onKeyDown={onKeyDown}
        onChange={onInputChange}
        onBlur={onBlur}
        onMouseLeave={onBlur}
      />
      {inFocus
        ? <Pin className={styles.TaskEditorIcon} onClick={editInFocus} />
        : <PinOutline className={styles.TaskEditorIcon} onClick={editInFocus} />
      }
      <Delete className={deleteIconClass} onClick={onRemove} />
    </div>
  );
}

const Memoized = React.memo(MainTaskEditor);
export default Memoized;
