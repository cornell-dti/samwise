// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { Task } from '../../store/store-types';
import styles from './FocusViewTaskBox.css';
import InlineTaskEditor from '../TaskEditors/InlineTaskEditor';

type Props = Task;

/**
 * A task box inside focus view.
 *
 * @param props the passed props, which is just a task object.
 * @return {Node} the rendered box.
 * @constructor
 */
export default function FocusViewTaskBox(props: Props): Node {
  return (<InlineTaskEditor className={styles.FocusViewTaskBox} initialTask={props} />);
}
