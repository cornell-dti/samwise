// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import Delete from '../../../../assets/svgs/XLight.svg';
import PinOutline from '../../../../assets/svgs/pin-2-light-outline.svg';
import Pin from '../../../../assets/svgs/pin-2-light-filled.svg';
import styles from './TaskEditor.css';
import CheckBox from '../../../UI/CheckBox';
import type { PartialSubTask, SubTask } from '../../../../store/store-types';

type Props = {|
  +subTask: SubTask;
  +mainTaskComplete: boolean;
  +needToBeFocused: boolean;
  +afterFocusedCallback: () => void;
  +editSubTask: (subtaskId: string, partialSubTask: PartialSubTask, doSave: boolean) => void;
  +removeSubTask: (subtaskId: string) => void;
  +onPressEnter: ('main-task' | number) => void;
|};

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
): Node {
  const [nameCache, setNameCache] = React.useState<string>(subTask.name);

  const onCompleteChange = () => editSubTask(subTask.id, { complete: !subTask.complete }, false);
  const onInFocusChange = () => editSubTask(subTask.id, { inFocus: !subTask.inFocus }, false);
  const onRemove = () => removeSubTask(subTask.id);

  const onKeyDown = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter(subTask.order);
  };
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

  const editorRef = React.useRef(null);

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
        ref={editorRef}
        onKeyDown={onKeyDown}
        onChange={onInputChange}
        onBlur={onBlur}
        style={{ width: 'calc(100% - 70px)' }}
      />
      {subTask.inFocus
        ? <Pin className={styles.TaskEditorIcon} onClick={onInFocusChange} />
        : <PinOutline className={styles.TaskEditorIcon} onClick={onInFocusChange} />
      }
      <Delete onClick={onRemove} className={deleteIconClass} />
    </div>
  );
}

const Memoized: ComponentType<Props> = React.memo(OneSubTaskEditor);
export default Memoized;
