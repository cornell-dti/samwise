import React, { ReactElement, ReactNode } from 'react';
import { connect } from 'react-redux';
import { State, SubTask, Task } from '../../../store/store-types';
import { CalendarPosition, FloatingPosition, TaskWithSubTasks } from './editors-types';
import TaskEditor from './TaskEditor';
import styles from './FloatingTaskEditor.css';
import { removeTask as removeTaskAction } from '../../../firebase/actions';
import { useWindowSizeCallback, WindowSize } from '../../../hooks/window-size-hook';

const updateFloatingEditorPosition = (
  editorElement: HTMLFormElement | null | undefined,
  windowSize: WindowSize,
  position: FloatingPosition,
): void => {
  const editorPosDiv = editorElement;
  if (editorPosDiv == null) {
    return;
  }
  const taskElement = editorPosDiv.previousElementSibling == null
    ? null
    : editorPosDiv.previousElementSibling.previousElementSibling;
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
  // the position of the editor
  readonly position: FloatingPosition;
  // the initial task to edit
  readonly initialTask: Task;
  // the trigger function to open the editor
  readonly trigger: (opened: boolean, opener: () => void) => ReactNode;
  // the position of the calendar
  readonly calendarPosition: CalendarPosition;
};

type Props = OwnProps & { readonly fullInitialTask: TaskWithSubTasks };

/**
 * FloatingTaskEditor is a component used to edit a task on the fly.
 * It is triggered from a click on a specified element.
 */
function FloatingTaskEditor(
  { position, calendarPosition, initialTask, fullInitialTask: task, trigger }: Props,
): ReactElement {
  const [open, setOpen] = React.useState<boolean>(false);

  const editorRef = React.useRef(null);

  useWindowSizeCallback((windowSize) => {
    updateFloatingEditorPosition(editorRef.current, windowSize, position);
  });

  const openPopup = (): void => setOpen(true);
  const closePopup = (): void => setOpen(false);

  const actions = {
    removeTask: (): void => removeTaskAction(initialTask),
    onSave: closePopup,
  };
  const { id: _, subTasks, ...mainTask } = task;

  return (
    <>
      {trigger(open, openPopup)}
      {open && (
        <div className={styles.BackgroundBlocker} role="presentation" onClick={closePopup} />
      )}
      {open && (
        <TaskEditor
          id={task.id}
          mainTask={mainTask}
          subTasks={subTasks}
          actions={actions}
          className={styles.Editor}
          editorRef={editorRef}
          calendarPosition={calendarPosition}
        />
      )}
    </>
  );
}

const Connected = connect(
  ({ subTasks }: State, { initialTask }: OwnProps) => {
    const { children, ...rest } = initialTask;
    const newSubTasks: SubTask[] = [];
    children.forEach((id) => {
      const s = subTasks.get(id);
      if (s != null) { newSubTasks.push(s); }
    });
    const fullInitialTask: TaskWithSubTasks = { ...rest, subTasks: newSubTasks };
    return { fullInitialTask };
  },
)(FloatingTaskEditor);
export default Connected;
