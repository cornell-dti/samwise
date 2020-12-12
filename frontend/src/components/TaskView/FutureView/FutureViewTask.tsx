import React, { KeyboardEvent, ReactElement, SyntheticEvent, ReactNode, useState } from 'react';
import { connect } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Settings, State, SubTask, Task } from 'common/types/store-types';
import { getTodayAtZeroAM, getDateWithDateString } from 'common/util/datetime-util';
import { NONE_TAG } from 'common/util/tag-util';
import FloatingTaskEditor from '../../Util/TaskEditors/FloatingTaskEditor';
import CheckBox from '../../UI/CheckBox';
import { FloatingPosition, CalendarPosition } from '../../Util/TaskEditors/editors-types';
import OverdueAlert from '../../UI/OverdueAlert';
import { editMainTask } from '../../../firebase/actions';
import { useMappedWindowSize } from '../../../hooks/window-size-hook';
import SamwiseIcon from '../../UI/SamwiseIcon';
import { removeTaskWithPotentialPrompt } from '../../../util/task-util';
import FutureViewSubTask from './FutureViewSubTask';
import styles from './FutureViewTask.module.scss';

type CompoundTask = {
  readonly original: Task;
  readonly filteredSubTasks: SubTask[];
  readonly color: string;
};

type OwnProps = {
  readonly taskId: string;
  readonly index: number;
  readonly containerDate: string;
  readonly inNDaysView: boolean;
  readonly taskEditorPosition: FloatingPosition;
  readonly calendarPosition: CalendarPosition;
  readonly doesShowCompletedTasks: boolean;
  readonly isInMainList: boolean;
};

type Props = OwnProps & {
  readonly compoundTask: CompoundTask | null;
  readonly settings: Settings;
};

type OpenedState = {
  readonly isEditorOpened: boolean;
};

/**
 * The component used to render one task in backlog day.
 */
function FutureViewTask({
  taskId,
  index,
  compoundTask,
  containerDate,
  inNDaysView,
  taskEditorPosition,
  isInMainList,
  calendarPosition,
  settings,
}: Props): ReactElement | null {
  const isSmallScreen = useMappedWindowSize(({ width }) => width <= 840);

  const [isEditorOpened, setOpened] = useState(false);

  const toggle = (opened: boolean): void => {
    setOpened(opened);
  };

  if (compoundTask === null) {
    return null;
  }

  const { original, filteredSubTasks, color } = compoundTask;

  const { canvasCalendar } = settings;
  const canvasLinked = canvasCalendar != null;

  const icalUID = original.metadata.type === 'ONE_TIME' ? original.metadata.icalUID : '';
  const isCanvasTask = canvasLinked && (typeof icalUID === 'string' ? icalUID !== '' : false);

  /**
   * Get an onClickHandler when the element is clicked.
   * This methods ensure that only clicking on task text counts.
   *
   * @param opener the opener passed by the floating task editor.
   * @return the onClick handler.
   */
  const getOnClickHandler = (opener: () => void) => (event?: SyntheticEvent<HTMLElement>): void => {
    if (event == null) {
      opener();
      return;
    }
    if (event.target instanceof HTMLElement) {
      const elem: HTMLElement = event.target;
      // only accept click on text.
      if (elem.className === styles.TaskText) {
        opener();
      }
    }
  };

  const replaceDateForFork = getDateWithDateString(
    original.metadata.type === 'ONE_TIME' ? original.metadata.date : null,
    containerDate
  );
  const replaceDateForForkOpt = original.metadata.type === 'ONE_TIME' ? null : replaceDateForFork;
  const TaskCheckBox = (): ReactElement => {
    const { id, complete } = original;
    const onChange = (): void => editMainTask(id, replaceDateForForkOpt, { complete: !complete });
    return <CheckBox className={styles.TaskCheckBox} checked={complete} onChange={onChange} />;
  };
  const TaskName = (): ReactElement => {
    const { name, complete } = original;
    const tagStyle = complete ? { textDecoration: 'line-through' } : {};
    return (
      <span className={styles.TaskText} style={tagStyle}>
        {name}
      </span>
    );
  };

  const RemoveTaskIcon = (): ReactElement => {
    const handler = (): void => removeTaskWithPotentialPrompt(original, replaceDateForFork);
    return <SamwiseIcon iconName="x-light" className={styles.TaskIcon} onClick={handler} />;
  };

  const Placeholder = (): ReactElement => (
    <div className={styles.hide}>
      <RemoveTaskIcon />
    </div>
  );

  const PinIcon = (): ReactElement => {
    const { id, inFocus } = original;
    const handler = (): void => editMainTask(id, replaceDateForForkOpt, { inFocus: !inFocus });
    return (
      <SamwiseIcon
        iconName={inFocus ? 'pin-light-filled' : 'pin-light-outline'}
        className={styles.TaskIcon}
        onClick={handler}
      />
    );
  };
  const DragIcon = (): ReactElement => (
    <SamwiseIcon iconName="grabber" className={styles.TaskIcon} />
  );
  const RepeatingIcon = (): ReactElement => (
    <SamwiseIcon iconName="repeat-light" className={styles.TaskIconNoHover} />
  );
  let Icon = Placeholder;
  if (compoundTask.original.metadata.type === 'MASTER_TEMPLATE') {
    Icon = RepeatingIcon;
  } else if (compoundTask.original.metadata.type === 'ONE_TIME' && !isCanvasTask) {
    Icon = DragIcon;
  }
  const renderMainTaskInfo = (simplified = false): ReactElement => {
    if (simplified && isInMainList) {
      const style = { backgroundColor: color, height: '25px' };
      return <div className={styles.TaskMainWrapper} style={style} />;
    }
    return (
      <div className={styles.TaskMainWrapper} style={{ backgroundColor: color }}>
        <Icon />
        <TaskCheckBox />
        <TaskName />
        <PinIcon />
        {isCanvasTask ? <Placeholder /> : <RemoveTaskIcon />}
      </div>
    );
  };

  const renderSubTasks = (): ReactNode =>
    filteredSubTasks.map((s) => (
      <FutureViewSubTask
        key={s.order}
        subTask={s}
        taskData={original}
        mainTaskCompleted={original.complete}
        replaceDateForFork={replaceDateForForkOpt}
      />
    ));

  const {
    metadata: { date },
    complete,
  } = original;
  const overdueComponentOpt = date < getTodayAtZeroAM() && !complete && (
    <OverdueAlert target="future-view-task" />
  );

  const trigger = (opened: boolean, opener: () => void): ReactElement => {
    const onClickHandler = getOnClickHandler(opener);

    const onSpaceHandler = (e: KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === ' ') {
        onClickHandler();
      }
    };
    const style = opened ? { zIndex: 8 } : {};
    const mainTasks = inNDaysView ? renderMainTaskInfo() : renderMainTaskInfo(isSmallScreen);
    const subtasks = inNDaysView ? renderSubTasks() : null;
    return (
      <div
        role="button"
        tabIndex={0}
        className={styles.Task}
        style={style}
        onClick={onClickHandler}
        onKeyUp={onSpaceHandler}
      >
        {overdueComponentOpt}
        {mainTasks}
        {subtasks}
      </div>
    );
  };
  return (
    <Draggable
      key={taskId}
      draggableId={taskId}
      index={index}
      isDragDisabled={
        isEditorOpened || compoundTask.original.metadata.type === 'MASTER_TEMPLATE' || isCanvasTask
      }
    >
      {(provided) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <FloatingTaskEditor
            position={taskEditorPosition}
            calendarPosition={calendarPosition}
            initialTask={original}
            taskAppearedDate={containerDate}
            trigger={trigger}
            toggle={toggle}
            open={isEditorOpened}
          />
        </div>
      )}
    </Draggable>
  );
}

const getCompoundTask = (
  { tasks, tags }: State,
  { taskId, doesShowCompletedTasks }: OwnProps
): CompoundTask | null => {
  const original = tasks.get(taskId);
  if (original == null) {
    return null;
  }
  const { color } = tags.get(original.tag) ?? NONE_TAG;
  if (doesShowCompletedTasks) {
    let filteredSubTasks = [...original.children];
    filteredSubTasks = filteredSubTasks.sort((a, b) => a.order - b.order);
    return { original, filteredSubTasks, color };
  }
  if (original.complete) {
    return null;
  }
  let filteredSubTasks: SubTask[] = [...original.children];
  filteredSubTasks = filteredSubTasks.sort((a, b) => a.order - b.order);
  return { original, filteredSubTasks, color };
};

const mapStateToProps = (
  state: State,
  ownProps: OwnProps
): { readonly compoundTask: CompoundTask | null; readonly settings: Settings } => ({
  compoundTask: getCompoundTask(state, ownProps),
  settings: state.settings,
});

const Connected = connect(mapStateToProps)(FutureViewTask);
export default Connected;
