// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import FocusViewTaskBox from './FocusViewTaskBox';
import type { State, Task } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| mainTaskArray: Task[] |};

const mapStateToProps = ({ mainTaskArray }: State): Props => ({ mainTaskArray });

/**
 * The focus view component.
 *
 * @param {Task[]} mainTaskArray the main task array from redux store.
 * @return {Node} the rendered focus view component.
 * @constructor
 */
function FocusView({ mainTaskArray }: Props): Node {
  const filterMapper: (Task) => (Task | null) = (task) => {
    if (task.inFocus) {
      return task;
    }
    const subtaskArray = task.subtaskArray.filter(subTask => subTask.inFocus);
    return subtaskArray.length === 0 ? null : { ...task, subtaskArray };
  };
  const listItems = mainTaskArray
    .map(filterMapper)
    .map((task: Task | null) => task && (<FocusViewTaskBox key={task.id} {...task} />));
  return (<List>{listItems}</List>);
}

const ConnectedFocusView = simpleConnect<{}, Props>(mapStateToProps)(FocusView);
export default ConnectedFocusView;
