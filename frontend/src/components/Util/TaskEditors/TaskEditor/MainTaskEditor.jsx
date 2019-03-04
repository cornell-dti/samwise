// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import Delete from '../../../../assets/svgs/XLight.svg';
import PinOutline from '../../../../assets/svgs/pin-2-light-outline.svg';
import Pin from '../../../../assets/svgs/pin-2-light-filled.svg';
import styles from './TaskEditor.css';
import CheckBox from '../../../UI/CheckBox';

type NameCompleteInFocus = {|
  +name: string;
  +complete: boolean;
  +inFocus: boolean;
|};
type Props = {|
  ...NameCompleteInFocus;
  +onChange: ($Shape<NameCompleteInFocus>) => void;
  +onRemove: () => void;
  +onPressEnter: ('main-task' | number) => void;
|};

type NameCache = {| +cached: string; +originalPropsName: string; |};

const deleteIconClass = [styles.TaskEditorIcon, styles.TaskEditorIconLeftPad].join(' ');

function MainTaskEditor(
  {
    name, complete, inFocus, onChange, onRemove, onPressEnter,
  }: Props,
): Node {
  const [nameCache, setNameCache] = React.useState<NameCache>({
    cached: name,
    originalPropsName: name,
  });
  if (name !== nameCache.originalPropsName) {
    setNameCache({ cached: name, originalPropsName: name });
  }

  const editComplete = () => onChange({ complete: !complete });
  const editInFocus = () => onChange({ inFocus: !inFocus });

  const onKeyDown = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
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
  const onBlur = (event: SyntheticEvent<>): void => {
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
      />
      {inFocus
        ? <Pin className={styles.TaskEditorIcon} onClick={editInFocus} />
        : <PinOutline className={styles.TaskEditorIcon} onClick={editInFocus} />
      }
      <Delete className={deleteIconClass} onClick={onRemove} />
    </div>
  );
}

const Memoized: ComponentType<Props> = React.memo(MainTaskEditor);
export default Memoized;
