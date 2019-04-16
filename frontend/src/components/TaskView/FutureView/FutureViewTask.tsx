import React, { KeyboardEvent, ReactElement, SyntheticEvent, ReactNode } from 'react';
import { connect } from 'react-redux';
import styles from './FutureViewTask.module.css';
import FutureViewSubTask from './FutureViewSubTask';
import FloatingTaskEditor from '../../Util/TaskEditors/FloatingTaskEditor';
import { State, SubTask, Task } from '../../../store/store-types';
import CheckBox from '../../UI/CheckBox';
import { FloatingPosition, CalendarPosition } from '../../Util/TaskEditors/editors-types';
import { getTodayAtZeroAM } from '../../../util/datetime-util';
import OverdueAlert from '../../UI/OverdueAlert';
import { editMainTask, removeTask } from '../../../firebase/actions';
import { useMappedWindowSize } from '../../../hooks/window-size-hook';
import { NONE_TAG } from '../../../util/tag-util';
import SamwiseIcon from '../../UI/SamwiseIcon';

type CompoundTask = {
  readonly original: Task;
  readonly filteredSubTasks: SubTask[];
  readonly color: string;
};

type OwnProps = {
  readonly taskId: string;
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
    compoundTask, inNDaysView, taskEditorPosition, isInMainList, calendarPosition,
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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

  const TaskCheckBox = (): ReactElement => {
    const { id, complete } = original;
    const onChange = (): void => editMainTask(id, { complete: !complete });
    return <CheckBox className={styles.TaskCheckBox} checked={complete} onChange={onChange} />;
  };
  const TaskName = (): ReactElement => {
    const { name, complete } = original;
    const tagStyle = complete ? { textDecoration: 'line-through' } : {};
    return <span className={styles.TaskText} style={tagStyle}>{name}</span>;
  };

  const RemoveTaskIcon = (): ReactElement => {
    const handler = (): void => removeTask(original);
    return <SamwiseIcon iconName="x-light" className={styles.TaskIcon} onClick={handler} />;
  };
  const PinIcon = (): ReactElement => {
    const { id, inFocus } = original;
    const handler = (): void => editMainTask(id, { inFocus: !inFocus });
    return (
      <SamwiseIcon
        iconName={inFocus ? 'pin-light-filled' : 'pin-light-outline'}
        className={styles.TaskIcon}
        onClick={handler}
      />
    );
  };

  const renderMainTaskInfo = (simplified: boolean = false): ReactElement => {
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

  const renderSubTasks = (): ReactNode => filteredSubTasks.map(s => (
    <FutureViewSubTask
      key={s.id}
      subTask={s}
      mainTaskId={original.id}
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
