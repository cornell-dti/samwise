import React, { KeyboardEvent, ReactElement, SyntheticEvent, ReactNode } from 'react';
import { connect } from 'react-redux';
import FloatingTaskEditor from 'components/Util/TaskEditors/FloatingTaskEditor';
import { State, SubTask, Task } from 'store/store-types';
import CheckBox from 'components/UI/CheckBox';
import { FloatingPosition, CalendarPosition } from 'components/Util/TaskEditors/editors-types';
import { getTodayAtZeroAM, getDateWithDateString } from 'util/datetime-util';
import OverdueAlert from 'components/UI/OverdueAlert';
import { editMainTask } from 'firebase/actions';
import { useMappedWindowSize } from 'hooks/window-size-hook';
import { NONE_TAG } from 'util/tag-util';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { removeTaskWithPotentialPrompt } from 'util/task-util';
import FutureViewSubTask from './FutureViewSubTask';
import styles from './FutureViewTask.module.css';

type CompoundTask = {
  readonly original: Task;
  readonly filteredSubTasks: SubTask[];
  readonly color: string;
};

type OwnProps = {
  readonly taskId: string;
  readonly containerDate: string;
  readonly inNDaysView: boolean;
  readonly taskEditorPosition: FloatingPosition;
  readonly calendarPosition: CalendarPosition;
  readonly doesShowCompletedTasks: boolean;
  readonly isInMainList: boolean;
};

type Props = OwnProps & {
  readonly compoundTask: CompoundTask | null;
};

/**
 * The component used to render one task in backlog day.
 */
function FutureViewTask(
  {
    compoundTask, containerDate, inNDaysView, taskEditorPosition, isInMainList, calendarPosition,
  }: Props,
): ReactElement | null {
  const isSmallScreen = useMappedWindowSize(({ width }) => width <= 768);

  if (compoundTask === null) {
    return null;
  }
  const { original, filteredSubTasks, color } = compoundTask;

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
    original.type === 'ONE_TIME' ? original.date : null, containerDate,
  );
  const replaceDateForForkOpt = original.type === 'ONE_TIME' ? null : replaceDateForFork;
  const TaskCheckBox = (): ReactElement => {
    const { id, complete } = original;
    const onChange = (): void => editMainTask(id, replaceDateForForkOpt, { complete: !complete });
    return <CheckBox className={styles.TaskCheckBox} checked={complete} onChange={onChange} />;
  };
  const TaskName = (): ReactElement => {
    const { name, complete } = original;
    const tagStyle = complete ? { textDecoration: 'line-through' } : {};
    return <span className={styles.TaskText} style={tagStyle}>{name}</span>;
  };

  const RemoveTaskIcon = (): ReactElement => {
    const handler = (): void => removeTaskWithPotentialPrompt(original, replaceDateForFork);
    return <SamwiseIcon iconName="x-light" className={styles.TaskIcon} onClick={handler} />;
  };
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

  const renderMainTaskInfo = (simplified = false): ReactElement => {
    if (simplified && isInMainList) {
      const style = { backgroundColor: color, height: '25px' };
      return <div className={styles.TaskMainWrapper} style={style} />;
    }
    return (
      <div className={styles.TaskMainWrapper} style={{ backgroundColor: color }}>
        <TaskCheckBox />
        <TaskName />
        <PinIcon />
        <RemoveTaskIcon />
      </div>
    );
  };

  const renderSubTasks = (): ReactNode => filteredSubTasks.map((s) => (
    <FutureViewSubTask
      key={s.id}
      subTask={s}
      mainTaskId={original.id}
      replaceDateForFork={replaceDateForForkOpt}
      mainTaskCompleted={original.complete}
    />
  ));

  const { date, complete } = original;
  const overdueComponentOpt = (date < getTodayAtZeroAM() && !complete) && (
    <OverdueAlert target="future-view-task" />
  );
  // Construct the trigger for the floating task editor.
  const trigger = (opened: boolean, opener: () => void): ReactElement => {
    const onClickHandler = getOnClickHandler(opener);
    const onSpaceHandler = (e: KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === ' ') {
        onClickHandler();
      }
    };
    const style = opened ? { zIndex: 8 } : {};
    const mainTasks = inNDaysView
      ? renderMainTaskInfo()
      : renderMainTaskInfo(isSmallScreen);
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
    <FloatingTaskEditor
      position={taskEditorPosition}
      calendarPosition={calendarPosition}
      initialTask={original}
      taskAppearedDate={containerDate}
      trigger={trigger}
    />
  );
}

const getCompoundTask = (
  { tasks, subTasks, tags }: State, { taskId, doesShowCompletedTasks }: OwnProps,
): CompoundTask | null => {
  const original = tasks.get(taskId);
  if (original == null) {
    return null;
  }
  const { color } = tags.get(original.tag) || NONE_TAG;
  if (doesShowCompletedTasks) {
    let filteredSubTasks: SubTask[] = [];
    original.children.forEach((subTaskId) => {
      const s = subTasks.get(subTaskId);
      if (s != null) { filteredSubTasks.push(s); }
    });
    filteredSubTasks = filteredSubTasks.sort((a, b) => a.order - b.order);
    return { original, filteredSubTasks, color };
  }
  if (original.complete) {
    return null;
  }
  let filteredSubTasks: SubTask[] = [];
  original.children.forEach((subTaskId) => {
    const s = subTasks.get(subTaskId);
    if (s != null && !s.complete) { filteredSubTasks.push(s); }
  });
  filteredSubTasks = filteredSubTasks.sort((a, b) => a.order - b.order);
  return { original, filteredSubTasks, color };
};

const mapStateToProps = (
  state: State, ownProps: OwnProps,
): { readonly compoundTask: CompoundTask | null } => ({
  compoundTask: getCompoundTask(state, ownProps),
});

const Connected = connect(mapStateToProps)(FutureViewTask);
export default Connected;
