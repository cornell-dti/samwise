/* eslint-disable no-param-reassign */
import React, { ReactElement, ReactNode } from 'react';
import { getDateWithDateString } from 'common/util/datetime-util';
import { Task } from 'common/types/store-types';
import { removeTaskWithPotentialPrompt } from '../../../util/task-util';
import { useWindowSizeCallback, WindowSize } from '../../../hooks/window-size-hook';
import { CalendarPosition, FloatingPosition } from './editors-types';
import TaskEditor from './TaskEditor';
import styles from './FloatingTaskEditor.module.scss';

const EDITOR_WIDTH = 300;

const updateFloatingEditorPosition = (
  editorPosDiv: HTMLFormElement,
  windowSize: WindowSize,
  position: FloatingPosition
): void => {
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
    posTop = y + myHeight > windowHeight ? windowHeight - myHeight : y;
    if (position === 'right') {
      posLeft = right;
    } else if (position === 'left') {
      posRight = windowWidth - left;
    } else {
      throw new Error('Bad floating position!');
    }
  }

  editorPosDiv.style.top = `${posTop}px`;
  editorPosDiv.style.left = posLeft === undefined ? 'initial' : `${posLeft}px`;
  editorPosDiv.style.right = posRight === undefined ? 'initial' : `${posRight}px`;
  editorPosDiv.style.width = '300px';
};

type Props = {
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

/**
 * FloatingTaskEditor is a component used to edit a task on the fly.
 * It is triggered from a click on a specified element.
 */
export default function FloatingTaskEditor({
  position,
  calendarPosition,
  initialTask: task,
  taskAppearedDate,
  trigger,
}: Props): ReactElement {
  const icalUID = task.metadata.type === 'ONE_TIME' ? task.metadata.icalUID : '';

  const [open, setOpen] = React.useState<boolean>(false);

  const editorRef = React.useRef<HTMLFormElement>(null);

  const windowSize = useWindowSizeCallback((size) => {
    const editorPosDiv = editorRef.current;
    if (editorPosDiv == null) {
      return;
    }
    updateFloatingEditorPosition(editorPosDiv, size, position);
  });

  const openPopup = (): void => setOpen(true);
  const closePopup = (): void => setOpen(false);

  const { id: _, metadata, children, ...mainTask } = task;
  const actions = {
    onChange: (): void => {
      const editorPosDiv = editorRef.current;
      if (editorPosDiv == null) {
        return;
      }
      updateFloatingEditorPosition(editorPosDiv, windowSize, position);
    },
    removeTask: (): void =>
      removeTaskWithPotentialPrompt(
        task,
        getDateWithDateString(
          metadata.date instanceof Date ? metadata.date : null,
          taskAppearedDate
        )
      ),
    onSaveClicked: closePopup,
  };

  return (
    <>
      {trigger(open, openPopup)}
      {open && (
        <>
          <TaskEditor
            id={task.id}
            type={metadata.type}
            icalUID={icalUID}
            taskAppearedDate={taskAppearedDate}
            mainTask={{ ...mainTask, date: metadata.date }}
            subTasks={children}
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
