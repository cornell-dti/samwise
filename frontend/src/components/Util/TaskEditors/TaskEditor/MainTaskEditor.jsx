// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { Icon } from 'semantic-ui-react';
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

function MainTaskEditor(
  {
    name, complete, inFocus, onChange, onRemove, onPressEnter,
  }: Props,
): Node {
  const [nameCache, setNameCache] = React.useState<string>(name);

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
    setNameCache(event.currentTarget.value);
  };
  const onBlur = (event: SyntheticEvent<>): void => {
    event.stopPropagation();
    if (name !== nameCache) {
      onChange({ name: nameCache });
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
        value={nameCache}
        onKeyDown={onKeyDown}
        onChange={onInputChange}
        onBlur={onBlur}
      />
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.TaskEditorIcon}
        onClick={editInFocus}
      />
      <Icon className={styles.TaskEditorIcon} name="delete" onClick={onRemove} />
    </div>
  );
}

const Memoized: ComponentType<Props> = React.memo(MainTaskEditor);
export default Memoized;
