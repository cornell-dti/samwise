// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import { markSubtask as markSubtaskAction } from '../../store/actions';
import type { SubTask } from '../../store/store-types';
import type { MarkSubTaskAction } from '../../store/action-types';

type Props = {|
  ...SubTask;
  mainTaskID: number;
  markSubtask: (id: number, subTaskId: number) => MarkSubTaskAction;
|};

/**
 * The component to render a subtask in focus view.
 */
class SubtaskBox extends React.Component<Props> {
  markSubtaskAsComplete = (event) => {
    event.stopPropagation();
    const { id, mainTaskID, markSubtask } = this.props;
    markSubtask(mainTaskID, id);
  };

  render(): Node {
    const { name, complete } = this.props;
    return (
      <div>
        <input defaultChecked={complete} type="checkbox" onClick={this.markSubtaskAsComplete} />
        <p style={complete ? { textDecoration: 'line-through' } : {}}>
          {name}
        </p>
      </div>
    );
  }
}

const ConnectedSubtaskBox = connect(null, { markSubtask: markSubtaskAction })(SubtaskBox);
export default ConnectedSubtaskBox;
