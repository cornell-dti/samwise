// @flow strict

import React, { KeyboardEvent, ReactElement, SyntheticEvent } from 'react';
import Delete from '../../../../assets/svgs/XLight.svg';
import PinOutline from '../../../../assets/svgs/pin-2-light-outline.svg';
import Pin from '../../../../assets/svgs/pin-2-light-filled.svg';
import styles from './TaskEditor.css';
import CheckBox from '../../../UI/CheckBox';
import { PartialSubTask, SubTask } from '../../../../store/store-types';

type Props = {
  readonly subTask: SubTask; // the subtask to edit
  readonly mainTaskComplete: boolean; // whether the main task is completed
  readonly needToBeFocused: boolean; // whether it needs to be focused.
  readonly afterFocusedCallback: () => void; // need to be called once we focused the subtask
  readonly editSubTask: (subtaskId: string, partialSubTask: PartialSubTask) => void;
  readonly removeSubTask: (subtaskId: string) => void;
  readonly onPressEnter: (id: 'main-task' | number) => void;
};

type NameCache = { readonly cached: string; readonly originalPropsName: string; };

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
  const [nameCache, setNameCache] = React.useState<NameCache>({
    cached: subTask.name,
    originalPropsName: subTask.name,
  });
  if (subTask.name !== nameCache.originalPropsName) {
    setNameCache({ cached: subTask.name, originalPropsName: subTask.name });
  }

  const onCompleteChange = () => editSubTask(subTask.id, { complete: !subTask.complete });
  const onInFocusChange = () => editSubTask(subTask.id, { inFocus: !subTask.inFocus });
  const onRemove = () => removeSubTask(subTask.id);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    onPressEnter(subTask.order);
  };
  const onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newValue = event.currentTarget.value;
    setNameCache(prev => ({ ...prev, cached: newValue }));
  };
  const onBlur = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    if (subTask.name !== nameCache.cached) {
      editSubTask(subTask.id, { name: nameCache.cached });
    }
  };

  const editorRef = React.useRef<HTMLInputElement | null>(null);

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
        value={nameCache.cached}
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

const Memoized = React.memo(
  OneSubTaskEditor,
  (prev, curr) => prev.subTask === curr.subTask
    && prev.mainTaskComplete === curr.mainTaskComplete,
);
export default Memoized;
