// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type {
  PartialMainTask, PartialSubTask, State, SubTask, Task, TaskWithSubTasks,
} from '../../../store/store-types';
import type { FloatingPosition } from './task-editors-types';
import TaskEditor from './TaskEditor';
import styles from './FloatingTaskEditor.css';
import { TaskEditorFlexiblePadding as flexiblePaddingClass } from './TaskEditor/TaskEditor.css';
import { replaceSubTask, EMPTY_TASK_DIFF, taskDiffIsEmpty } from '../../../util/task-util';
import type { TaskDiff } from '../../../util/task-util';
import { editTask, removeTask as removeTaskAction } from '../../../firebase/actions';
import { useWindowSize } from '../../../hooks/window-size-hook';
import type { WindowSize } from '../../../hooks/window-size-hook';

const updateFloatingEditorPosition = (
  editorElement: ?HTMLFormElement,
  windowSize: WindowSize,
  position: FloatingPosition,
) => {
  const editorPosDiv = editorElement;
  if (editorPosDiv == null) {
    return;
  }
  const taskElement = editorPosDiv.previousElementSibling?.previousElementSibling;
  if (taskElement === null || !(taskElement instanceof HTMLDivElement)) {
    throw new Error('Task element must be a div!');
  }
  editorPosDiv.style.position = 'fixed';
  const taskElementBoundingRect = taskElement.getBoundingClientRect();
  if (!(taskElementBoundingRect instanceof DOMRect)) {
    throw new Error('Bad taskElementBoundingRect!');
  }
  const myWidth = editorPosDiv.offsetWidth;
  const myHeight = editorPosDiv.offsetHeight;
  const windowWidth = windowSize.width;
  const windowHeight = windowSize.height;
  if (windowWidth <= 768) {
    editorPosDiv.style.top = `${(windowHeight - myHeight) / 2}px`;
    editorPosDiv.style.left = `${(windowWidth - myWidth) / 2}px`;
    return;
  }
  const { y, left, right } = taskElementBoundingRect;
  const topPos = (y + myHeight) > windowHeight ? windowHeight - myHeight : y;
  editorPosDiv.style.top = `${topPos}px`;
  if (position === 'right') {
    editorPosDiv.style.left = `${right}px`;
  } else if (position === 'left') {
    editorPosDiv.style.left = `${left - editorPosDiv.offsetWidth}px`;
  } else {
    throw new Error('Bad floating position!');
  }
};

type OwnProps = {|
  +position: FloatingPosition;
  +initialTask: Task;
  +trigger: (opened: boolean, opener: () => void) => Node;
|};

type Props = {|
  ...OwnProps;
  +fullInitialTask: TaskWithSubTasks;
|};

type ComponentState = {|
  +task: TaskWithSubTasks;
  +diff: TaskDiff;
  +open: boolean;
|};

/**
 * FloatingTaskEditor is a component used to edit a task on the fly.
 * It is triggered from a click on a specified element.
 */
function FloatingTaskEditor(
  {
    position, initialTask, fullInitialTask, trigger,
  }: Props,
): Node {
  const [componentState, setState] = React.useState<ComponentState>({
    task: fullInitialTask, diff: EMPTY_TASK_DIFF, open: false,
  });
  const { task, diff, open } = componentState;
  if (task !== fullInitialTask) {
    setState(prev => ({ ...prev, task: fullInitialTask, diff: EMPTY_TASK_DIFF }));
  }

  const editorRef = React.useRef(null);

  const windowSize = useWindowSize();
  React.useEffect(() => {
    updateFloatingEditorPosition(editorRef.current, windowSize, position);
  });

  const openPopup = () => setState(prev => ({ ...prev, open: true }));
  const closePopup = () => setState(prev => ({ ...prev, open: false, diff: EMPTY_TASK_DIFF }));

  const saveEditedTask = (currentDiff?: TaskDiff): void => {
    if (task.name.trim().length === 0) {
      return;
    }
    const diffToUse = currentDiff ?? diff;
    if (taskDiffIsEmpty(diffToUse)) {
      return;
    }
    editTask(task.id, diffToUse);
    closePopup();
  };

  const editMainTask = (partialMainTask: PartialMainTask, doSave: boolean) => {
    setState(
      (state: ComponentState) => {
        const newTask = { ...state.task, ...partialMainTask };
        const newDiff = {
          ...state.diff, mainTaskDiff: { ...state.diff.mainTaskDiff, ...partialMainTask },
        };
        if (doSave) {
          saveEditedTask(newDiff);
        }
        return { task: newTask, diff: newDiff, open: state.open };
      },
    );
  };

  const editSubTask = (subtaskId: string, partialSubTask: PartialSubTask, doSave: boolean) => {
    setState((state: ComponentState) => {
      const newTask = {
        ...state.task,
        subTasks: replaceSubTask(state.task.subTasks, subtaskId, s => ({
          ...s, ...partialSubTask,
        })),
      };
      let foundInPreviousEdits = false;
      const subtasksCreations = replaceSubTask(state.diff.subtasksCreations, subtaskId, (s) => {
        if (s.id === subtaskId) {
          foundInPreviousEdits = true;
        }
        return { ...s, ...partialSubTask };
      });
      const subtasksEdits = [];
      for (let i = 0; i < state.diff.subtasksEdits.length; i += 1) {
        const pair = state.diff.subtasksEdits[i];
        const [id, edit] = pair;
        if (id === subtaskId) {
          foundInPreviousEdits = true;
          subtasksEdits.push([id, { ...edit, ...partialSubTask }]);
        } else {
          subtasksEdits.push([id, edit]);
        }
      }
      if (!foundInPreviousEdits) {
        subtasksEdits.push([subtaskId, partialSubTask]);
      }
      const newDiff = { ...state.diff, subtasksCreations, subtasksEdits };
      if (doSave) {
        saveEditedTask(newDiff);
      }
      return { task: newTask, diff: newDiff, open: state.open };
    });
  };

  const addSubTask = (subTask: SubTask) => {
    setState((state: ComponentState) => ({
      task: {
        ...state.task,
        subTasks: [...state.task.subTasks, subTask],
      },
      diff: {
        ...state.diff,
        subtasksCreations: [...state.diff.subtasksCreations, subTask],
      },
      open: state.open,
    }));
  };

  const removeTask = () => removeTaskAction(initialTask);

  const removeSubTask = (subtaskId: string) => setState((state: ComponentState) => {
    const newTask = {
      ...state.task,
      subTasks: state.task.subTasks.filter(s => s.id !== subtaskId),
    };
    const subtasksCreations = [];
    let foundInNew = false;
    state.diff.subtasksCreations.forEach((s) => {
      if (s.id === subtaskId) {
        foundInNew = true;
      } else {
        subtasksCreations.push(s);
      }
    });
    let subtasksDeletions;
    if (foundInNew) {
      subtasksDeletions = [];
    } else {
      subtasksDeletions = [...state.diff.subtasksDeletions, subtaskId];
    }
    const newDiff = { ...state.diff, subtasksCreations, subtasksDeletions };
    return { task: newTask, diff: newDiff, open: state.open };
  });

  const Submit = (): Node => (
    <div className={styles.FloatingTaskEditorSubmitButtonRow}>
      <span className={flexiblePaddingClass} />
      <div
        role="presentation"
        className={styles.FloatingTaskEditorSaveButton}
        onClick={saveEditedTask}
      >
        <span className={styles.FloatingTaskEditorSaveButtonText}>Save</span>
      </div>
    </div>
  );

  /**
   * Render the editor node.
   *
   * @return {Node} the rendered node.
   */
  const Editor = (): Node => {
    const actions = {
      editMainTask, editSubTask, addSubTask, removeTask, removeSubTask, onSave: saveEditedTask,
    };
    return (
      <TaskEditor
        task={task}
        actions={actions}
        className={styles.FloatingTaskEditor}
        editorRef={editorRef}
      >
        <Submit />
      </TaskEditor>
    );
  };

  return (
    <React.Fragment>
      {trigger(open, openPopup)}
      {open && (
        <div className={styles.BackgroundBlocker} role="presentation" onClick={saveEditedTask} />
      )}
      {open && <Editor />}
    </React.Fragment>
  );
}

const Connected: ComponentType<OwnProps> = connect(
  ({ subTasks }: State, { initialTask }: OwnProps) => {
    const { children, ...rest } = initialTask;
    const newSubTasks = [];
    children.forEach((id) => {
      const s = subTasks.get(id);
      if (s != null) { newSubTasks.push(s); }
    });
    return { ...rest, subTasks: newSubTasks };
  },
)(FloatingTaskEditor);
export default Connected;
