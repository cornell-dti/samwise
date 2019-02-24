// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
// $FlowFixMe not flow strict
import { Draggable } from 'react-beautiful-dnd';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './FocusTask.module.css';

type Props = {| +id: string; order: number; |};

function FocusTask({ id, order }: Props): Node {
  return (
    <Draggable draggableId={id} index={order}>
      {provided => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <InlineTaskEditor
            className={styles.FocusTask}
            taskId={id}
          />
        </div>
      )}
    </Draggable>
  );
}

const Memoized: ComponentType<Props> = React.memo(FocusTask);
export default Memoized;
