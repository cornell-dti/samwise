// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { Icon } from 'semantic-ui-react';
import styles from '../TaskEditor.css';
import CheckBox from '../../../UI/CheckBox';
import type { PartialSubTask, SubTask } from '../../../../store/store-types';

type Props = {|
  +subTask: SubTask;
  +mainTaskComplete: boolean;
  +editSubTask: (subtaskId: string, partialSubTask: PartialSubTask, doSave: boolean) => void;
  +removeSubTask: (subtaskId: string) => void;
  +refHandler: (?HTMLInputElement) => void;
  +onPressEnter: (event: SyntheticKeyboardEvent<HTMLInputElement>) => void;
|};

const className = [styles.TaskEditorFlexibleContainer, styles.TaskEditorSubtaskCheckBox].join(' ');

function OneSubTaskEditor(
  {
    subTask, mainTaskComplete, editSubTask, removeSubTask, refHandler, onPressEnter,
  }: Props,
): Node {
  const [nameCache, setNameCache] = React.useState<string>(subTask.name);

  const onCompleteChange = () => editSubTask(subTask.id, { complete: !subTask.complete }, false);
  const onInFocusChange = () => editSubTask(subTask.id, { inFocus: !subTask.inFocus }, false);
  const onRemove = () => removeSubTask(subTask.id);

  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    setNameCache(event.currentTarget.value);
  };
  const onBlur = (event: SyntheticEvent<>): void => {
    event.stopPropagation();
    if (subTask.name !== nameCache) {
      editSubTask(subTask.id, { name: nameCache }, false);
    }
  };

  return (
    <div className={className}>
      <CheckBox
        className={styles.TaskEditorCheckBox}
        checked={mainTaskComplete || subTask.complete}
        disabled={mainTaskComplete}
        onChange={onCompleteChange}
      />
      <input
        className={styles.TaskEditorFlexibleInput}
        placeholder="Your Subtask"
        value={nameCache}
        ref={refHandler}
        onKeyDown={onPressEnter}
        onChange={onInputChange}
        onBlur={onBlur}
        style={{ width: 'calc(100% - 70px)' }}
      />
      <Icon
        name={subTask.inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.TaskEditorIcon}
        onClick={onInFocusChange}
      />
      <Icon name="delete" className={styles.TaskEditorIcon} onClick={onRemove} />
    </div>
  );
}

const Memoized: ComponentType<Props> = React.memo(OneSubTaskEditor);
export default Memoized;
