// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
// $FlowFixMe not flow strict
import { Draggable } from 'react-beautiful-dnd';
import type { Task } from '../../../store/store-types';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './FocusTask.module.css';

type Props = {| +task: Task |};

function FocusTask({ task }: Props): Node {
  React.useState(() => {
    console.log('focus task recreated');
    return null;
  });
  return (
    <Draggable draggableId={task.id} index={task.order}>
      {provided => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <InlineTaskEditor className={styles.FocusTask} task={task} />
        </div>
      )}
    </Draggable>
  );
}

const Connected: ComponentType<Props> = React.memo(FocusTask);
export default Connected;
