// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import styles from './FutureViewTask.css';
import FutureViewSubTask from './FutureViewSubTask';
import FloatingTaskEditor from '../../Util/TaskEditors/FloatingTaskEditor';
import type { State, Task } from '../../../store/store-types';
import CheckBox from '../../UI/CheckBox';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import { getTodayAtZeroAM } from '../../../util/datetime-util';
import OverdueAlert from '../../UI/OverdueAlert';
import { nDaysViewHeaderHeight, otherViewsHeightHeader } from './future-view-css-props';
import { error } from '../../../util/general-util';
import { editMainTask, removeTask } from '../../../firebase/actions';
import { useMappedWindowSize } from '../../../hooks/window-size-hook';
import type { CompoundTask } from '../../../util/task-util';

type OwnProps = {|
  +taskId: string;
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +doesShowCompletedTasks: boolean;
  +isInMainList: boolean;
|};

type Props = {|
  ...OwnProps;
  +compoundTask: CompoundTask | null;
|};

type AlertPos = {| +top: number; +right: number; |};

/**
 * The component used to render one task in backlog day.
 */
function FutureViewTask(
  {
    compoundTask, inNDaysView, taskEditorPosition, isInMainList,
  }: Props,
): Node {
  const [overdueAlertPosition, setOverdueAlertPosition] = React.useState<AlertPos | null>(null);
  const isSmallScreen = useMappedWindowSize(({ width }) => width <= 768);

  if (compoundTask === null) {
    return null;
  }
  const { original, filtered, color } = compoundTask;

  /**
   * Get an onClickHandler when the element is clicked.
   * This methods ensure that only clicking on task text counts.
   *
   * @param {function(): void} opener the opener passed by the floating task editor.
   * @return {function} the onClick handler.
   */
  const getOnClickHandler = (opener: () => void) => (event: SyntheticEvent<HTMLElement>): void => {
    if (event.target instanceof HTMLElement) {
      const elem: HTMLElement = event.target;
      // only accept click on text.
      if (elem.className === styles.TaskText) {
        opener();
      }
    }
  };

  const TaskCheckBox = (): Node => {
    const { id, complete } = filtered;
    const onChange = () => editMainTask(id, { complete: !complete });
    return <CheckBox className={styles.TaskCheckBox} checked={complete} onChange={onChange} />;
  };
  const TaskName = (): Node => {
    const { name, complete } = filtered;
    const tagStyle = complete ? { textDecoration: 'line-through' } : {};
    return <span className={styles.TaskText} style={tagStyle}>{name}</span>;
  };
  const RemoveTaskIcon = (): Node => {
    const handler = () => removeTask(original);
    return <Icon name="delete" className={styles.TaskIcon} onClick={handler} />;
  };
  const PinIcon = (): Node => {
    const { id, inFocus } = filtered;
    const iconName = inFocus ? 'bookmark' : 'bookmark outline';
    const handler = () => editMainTask(id, { inFocus: !inFocus });
    return <Icon name={iconName} className={styles.TaskIcon} onClick={handler} />;
  };

  const renderMainTaskInfo = (simplified: boolean = false): Node => {
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

  const renderSubTasks = (): Node => filtered.children.map(id => (
    <FutureViewSubTask key={id} mainTaskCompleted={filtered.complete} subTaskId={id} />
  ));

  const { date, complete } = original;
  const overdueComponentOpt = overdueAlertPosition && (
    <OverdueAlert absolutePosition={overdueAlertPosition} />
  );
  const refHandler = (divElement: HTMLDivElement | null) => {
    if (divElement != null) {
      const isOverdue = date < getTodayAtZeroAM() && !complete;
      if (isOverdue && overdueAlertPosition == null) {
        const { top } = divElement.getBoundingClientRect();
        const parent = divElement.parentElement ?? error('Corrupted DOM!');
        const parentRect = parent.getBoundingClientRect();
        const headerHeight = inNDaysView ? nDaysViewHeaderHeight : otherViewsHeightHeader;
        setOverdueAlertPosition({
          top: top - parentRect.top + headerHeight - 3,
          right: -5,
        });
      }
    }
  };
  // Construct the trigger for the floating task editor.
  const trigger = (opened: boolean, opener: () => void): Node => {
    const onClickHandler = getOnClickHandler(opener);
    const style = opened ? { zIndex: 8 } : {};
    const mainTasks = inNDaysView
      ? renderMainTaskInfo()
      : renderMainTaskInfo(isSmallScreen);
    const subtasks = inNDaysView ? renderSubTasks() : null;
    return (
      <div
        role="presentation"
        className={styles.Task}
        style={style}
        onClick={onClickHandler}
        ref={refHandler}
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
      initialTask={original}
      trigger={trigger}
    />
  );
}

const mapStateToProps = (
  { tasks, subTasks, tags }: State, { taskId, doesShowCompletedTasks }: OwnProps,
): {| +compoundTask: CompoundTask | null |} => {
  const original: Task = tasks.get(taskId) ?? error();
  if (original.complete && !doesShowCompletedTasks) {
    return { compoundTask: null };
  }
  const children = original.children
    .filter(id => doesShowCompletedTasks || !(subTasks.get(id)?.complete ?? false));
  const filtered = { ...original, children };
  const color = tags.get(original.tag)?.color ?? 'black';
  const compoundTask: CompoundTask = { original, filtered, color };
  return { compoundTask };
};

const Connected: ComponentType<OwnProps> = connect(mapStateToProps)(FutureViewTask);
export default Connected;
