import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import {
  PartialMainTask, PartialSubTask, State, SubTask, Task,
} from '../../../store/store-types';
import { FloatingPosition, TaskWithSubTasks } from './editors-types';
import TaskEditor from './TaskEditor';
import styles from './FloatingTaskEditor.css';
import { TaskEditorFlexiblePadding as flexiblePaddingClass } from './TaskEditor/TaskEditor.css';
import { EMPTY_TASK_DIFF, taskDiffIsEmpty } from '../../../util/task-util';
import { TaskDiff } from '../../../util/task-util';
import { editTask, removeTask as removeTaskAction } from '../../../firebase/actions';
import { useWindowSizeCallback } from '../../../hooks/window-size-hook';
import { WindowSize } from '../../../hooks/window-size-hook';

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

type OwnProps = {
  readonly position: FloatingPosition;
  readonly initialTask: Task;
  readonly trigger: (opened: boolean, opener: () => void) => Node;
};

type Props = OwnProps & { readonly fullInitialTask: TaskWithSubTasks };

type ComponentState = {
  readonly task: TaskWithSubTasks;
  readonly diff: TaskDiff;
  readonly uncommittedSubTask: SubTask | null;
  readonly open: boolean;
  readonly prevFullTask: TaskWithSubTasks;
};

/**
 * FloatingTaskEditor is a component used to edit a task on the fly.
 * It is triggered from a click on a specified element.
 */
function FloatingTaskEditor(
  { position, initialTask, fullInitialTask, trigger }: Props,
): ReactElement {
  const [componentState, setState] = React.useState<ComponentState>({
    task: fullInitialTask,
    diff: EMPTY_TASK_DIFF,
    uncommittedSubTask: null,
    open: false,
    prevFullTask: fullInitialTask,
  });
  const { task, diff, uncommittedSubTask, open, prevFullTask } = componentState;
  if (prevFullTask !== fullInitialTask) {
    setState(prev => ({
      ...prev,
      task: fullInitialTask,
      diff: EMPTY_TASK_DIFF,
      uncommittedSubTask: null,
      prevFullTask: fullInitialTask,
    }));
  }

  const editorRef = React.useRef(null);

  useWindowSizeCallback((windowSize) => {
    updateFloatingEditorPosition(editorRef.current, windowSize, position);
  });

  const openPopup = () => setState(prev => ({ ...prev, open: true }));
  const closePopup = () => setState(prev => ({
    ...prev, open: false, diff: EMPTY_TASK_DIFF, uncommittedSubTask: null,
  }));

  const commitUncommittedTask = (
    tempUncommittedTask: SubTask, state: ComponentState,
  ): ComponentState => ({
    ...state,
    task: { ...state.task, subTasks: [...state.task.subTasks, tempUncommittedTask] },
    diff: {
      ...state.diff,
      subtasksCreations: [...state.diff.subtasksCreations, tempUncommittedTask],
    },
    uncommittedSubTask: null, // just committed here!
  });

  const saveEditedTask = (): void => {
    if (task.name.trim().length === 0) {
      return;
    }
    let diffToUse: TaskDiff;
    if (uncommittedSubTask !== null) {
      diffToUse = commitUncommittedTask(uncommittedSubTask, componentState).diff;
    } else {
      diffToUse = diff;
    }
    if (taskDiffIsEmpty(diffToUse)) {
      return;
    }
    editTask(task.id, diffToUse);
    closePopup();
  };

  const editMainTask = (partialMainTask: PartialMainTask) => {
    setState(
      (state: ComponentState) => {
        const newTask = { ...state.task, ...partialMainTask };
        const newDiff = {
          ...state.diff, mainTaskDiff: { ...state.diff.mainTaskDiff, ...partialMainTask },
        };
        return { ...state, task: newTask, diff: newDiff };
      },
    );
  };

  const editSubTask = (subTaskId: string, partialSubTask: PartialSubTask) => {
    if (uncommittedSubTask !== null && subTaskId === uncommittedSubTask.id) {
      const newSubTask: SubTask = { ...uncommittedSubTask, ...partialSubTask };
      setState((state: ComponentState) => commitUncommittedTask(newSubTask, state));
      return;
    }
    setState((state: ComponentState) => {
      const newSubTasks = state.task.subTasks.map(
        s => (s.id === subTaskId ? { ...s, ...partialSubTask } : s),
      );
      const newTask = { ...state.task, subTasks: newSubTasks };
      let foundInPreviousEdits = false;
      const subtasksCreations = state.diff.subtasksCreations.map((s) => {
        if (s.id === subTaskId) {
          foundInPreviousEdits = true;
          return { ...s, ...partialSubTask };
        }
        return s;
      });
      const subtasksEdits = [];
      for (let i = 0; i < state.diff.subtasksEdits.length; i += 1) {
        const pair = state.diff.subtasksEdits[i];
        const [id, edit] = pair;
        if (id === subTaskId) {
          foundInPreviousEdits = true;
          subtasksEdits.push([id, { ...edit, ...partialSubTask }]);
        } else {
          subtasksEdits.push([id, edit]);
        }
      }
      if (!foundInPreviousEdits) {
        subtasksEdits.push([subTaskId, partialSubTask]);
      }
      const newDiff = { ...state.diff, subtasksCreations, subtasksEdits };
      return { ...state, task: newTask, diff: newDiff };
    });
  };

  const addSubTask = (subTask: SubTask) => {
    setState((state: ComponentState) => ({ ...state, uncommittedSubTask: subTask }));
  };

  const removeTask = () => removeTaskAction(initialTask);

  const removeSubTask = (subTaskId: string) => {
    if (uncommittedSubTask !== null && subTaskId === uncommittedSubTask.id) {
      setState((state: ComponentState) => ({ ...state, uncommittedSubTask: null }));
      return;
    }
    setState((state: ComponentState) => {
      const newTask = {
        ...state.task,
        subTasks: state.task.subTasks.filter(s => s.id !== subTaskId),
      };
      const subtasksCreations = [];
      let foundInNew = false;
      state.diff.subtasksCreations.forEach((s) => {
        if (s.id === subTaskId) {
          foundInNew = true;
        } else {
          subtasksCreations.push(s);
        }
      });
      let subtasksDeletions;
      if (foundInNew) {
        subtasksDeletions = [];
      } else {
        subtasksDeletions = [...state.diff.subtasksDeletions, subTaskId];
      }
      const newDiff = { ...state.diff, subtasksCreations, subtasksDeletions };
      return { ...state, task: newTask, diff: newDiff };
    });
  };

  const actions = {
    editMainTask, editSubTask, addSubTask, removeTask, removeSubTask, onSave: saveEditedTask,
  };
  const { id: _, subTasks, ...mainTask } = task;

  return (
    <React.Fragment>
      {trigger(open, openPopup)}
      {open && (
        <div className={styles.BackgroundBlocker} role="presentation" onClick={saveEditedTask} />
      )}
      {open && (
        <TaskEditor
          mainTask={mainTask}
          subTasks={subTasks}
          tempSubTask={uncommittedSubTask}
          actions={actions}
          className={styles.Editor}
          editorRef={editorRef}
        >
          <div className={styles.SaveButtonRow}>
            <span className={flexiblePaddingClass} />
            <div role="presentation" className={styles.SaveButton} onClick={saveEditedTask}>
              <span className={styles.SaveButtonText}>Save</span>
            </div>
          </div>
        </TaskEditor>
      )}
    </React.Fragment>
  );
}

const Connected = connect(
  ({ subTasks }: State, { initialTask }: OwnProps) => {
    const { children, ...rest } = initialTask;
    const newSubTasks = [];
    children.forEach((id) => {
      const s = subTasks.get(id);
      if (s != null) { newSubTasks.push(s); }
    });
    const fullInitialTask: TaskWithSubTasks = { ...rest, subTasks: newSubTasks };
    return { fullInitialTask };
  },
)(FloatingTaskEditor);
export default Connected;
