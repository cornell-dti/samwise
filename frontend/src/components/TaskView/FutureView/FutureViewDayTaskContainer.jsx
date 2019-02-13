// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { CompoundTask } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.css';
import windowSizeConnect from '../../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../../Util/Responsive/window-size-context';

type Props = {|
  /*
   * Disabled this below for technical reason.
   * We want it to re-render whenever window size changes so we can know the
   * current status of overflow, which depends on some DOM manipulation.
   */
  // eslint-disable-next-line
  +windowSize: WindowSize;
  +tasks: CompoundTask[];
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +isInMainList: boolean;
  +onOverflowChange: (doesOverflow: boolean) => void;
|};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 */
class FutureViewDayTaskContainer extends React.PureComponent<Props> {
  updateOverflowStatus = (containerNode: ?HTMLDivElement) => {
    if (containerNode == null) {
      return;
    }
    const { onOverflowChange } = this.props;
    onOverflowChange(containerNode.scrollHeight > containerNode.clientHeight);
  };

  render(): Node {
    const {
      tasks, inNDaysView, taskEditorPosition, isInMainList,
    } = this.props;
    const taskListComponent = tasks.map((t: CompoundTask) => (
      <FutureViewTask
        key={t.original.id}
        originalTask={t.original}
        filteredTask={t.filtered}
        taskColor={t.color}
        inNDaysView={inNDaysView}
        isInMainList={isInMainList}
        taskEditorPosition={taskEditorPosition}
      />
    ));
    const className = inNDaysView ? styles.NDaysView : styles.OtherViews;
    if (isInMainList) {
      return (
        <div className={className} style={{ overflow: 'hidden' }} ref={this.updateOverflowStatus}>
          {taskListComponent}
        </div>
      );
    }
    return <div className={className} ref={this.updateOverflowStatus}>{taskListComponent}</div>;
  }
}

const Connected = windowSizeConnect<Props>(FutureViewDayTaskContainer);
export default Connected;
