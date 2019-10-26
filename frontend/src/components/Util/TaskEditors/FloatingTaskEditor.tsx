import React, { ReactElement, ReactNode } from 'react';
import { connect } from 'react-redux';
import { getDateWithDateString } from 'util/datetime-util';
import { removeTaskWithPotentialPrompt } from 'util/task-util';
import { State, SubTask, Task } from 'store/store-types';
import { useWindowSizeCallback, WindowSize } from 'hooks/window-size-hook';
import { CalendarPosition, FloatingPosition, TaskWithSubTasks } from './editors-types';
import TaskEditor from './TaskEditor';
import styles from './FloatingTaskEditor.module.css';

const EDITOR_WIDTH = 300;

const updateFloatingEditorPosition = (
  editorElement: HTMLFormElement | null | undefined,
  windowSize: WindowSize,
  position: FloatingPosition,
): void => {
  const editorPosDiv = editorElement;
  if (editorPosDiv == null) {
    return;
  }
  const taskElement = editorPosDiv.previousElementSibling;
  if (taskElement === null || !(taskElement instanceof HTMLDivElement)) {
    throw new Error('Task element must be a div!');
  }
  const taskElementBoundingRect = taskElement.getBoundingClientRect();
  if (!(taskElementBoundingRect instanceof DOMRect)) {
    throw new Error('Bad taskElementBoundingRect!');
  }
  const myHeight = editorPosDiv.offsetHeight;
  const windowWidth = windowSize.width;
  const windowHeight = windowSize.height;
  let posTop: number;
  let posLeft: number | undefined;
  let posRight: number | undefined;
  if (windowWidth <= 768) {
    posTop = (windowHeight - myHeight) / 2;
    editorPosDiv.style.left = `${windowWidth - EDITOR_WIDTH}px`;
    posLeft = (windowWidth - EDITOR_WIDTH) / 2;
  } else {
    const { y, left, right } = taskElementBoundingRect;
    posTop = (y + myHeight) > windowHeight ? windowHeight - myHeight : y;
    if (position === 'right') {
      posLeft = right;
    } else if (position === 'left') {
      posRight = windowWidth - left;
    } else {
      throw new Error('Bad floating position!');
    }
  }

  editorPosDiv.style.overflowY = `auto`;
  editorPosDiv.style.top = `${posTop}px`;
  editorPosDiv.style.left = posLeft === undefined ? 'initial' : `${posLeft}px`;
  editorPosDiv.style.right = posRight === undefined ? 'initial' : `${posRight}px`;
  editorPosDiv.style.width = '300px';
  editorPosDiv.style.maxHeight = `400px`;
};

type OwnProps = {
  // the position of the editor
  readonly position: FloatingPosition;
  // the initial task to edit
  readonly initialTask: Task;
  // the date string that specifies when the task appears (useful for repeated task)
  readonly taskAppearedDate: string;
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
  {
    position,
    calendarPosition,
    initialTask,
    fullInitialTask: task,
    taskAppearedDate,
    trigger,
  }: Props,
): ReactElement {
  const [open, setOpen] = React.useState<boolean>(false);

  const editorRef = React.useRef(null);

  useWindowSizeCallback((windowSize) => {
    updateFloatingEditorPosition(editorRef.current, windowSize, position);
  });

  const openPopup = (): void => setOpen(true);
  const closePopup = (): void => setOpen(false);

  const { id: _, type, subTasks, ...mainTask } = task;
  const actions = {
    removeTask: (): void => removeTaskWithPotentialPrompt(
      initialTask,
      getDateWithDateString(mainTask.date instanceof Date ? mainTask.date : null, taskAppearedDate),
    ),
    onSave: closePopup,
  };

  return (
    <>
      {trigger(open, openPopup)}
      {open && (
        <>
          <TaskEditor
            id={task.id}
            type={type}
            taskAppearedDate={taskAppearedDate}
            mainTask={mainTask}
            subTasks={subTasks}
            actions={actions}
            className={styles.Editor}
            editorRef={editorRef}
            calendarPosition={calendarPosition}
          />
          <div className={styles.BackgroundBlocker} role="presentation" onClick={closePopup} />
        </>
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
