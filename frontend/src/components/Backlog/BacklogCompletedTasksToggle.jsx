// @flow strict
/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */

import * as React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './BacklogHeaderButtons.css';

type Props = {| +onChange: () => void |};
type State = {| +doesDisplay: boolean |};

/**
 * The base class name for the button.
 */
const baseClassName = `${styles.BacklogViewSwitcherButton} ${styles.BacklogViewSwitcherSingleButton}`;

/**
 * The component used to render a toggle for displaying completed tasks.
 */
export default class BacklogCompletedTasksToggle extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { doesDisplay: true };
  }

  render(): Node {
    const { onChange } = this.props;
    const { doesDisplay } = this.state;
    const toggle = () => {
      this.setState(() => {
        // report to parent component
        onChange();
        return { doesDisplay: !doesDisplay };
      });
    };
    const className = doesDisplay
      ? baseClassName
      : `${baseClassName} ${styles.BacklogViewSwitcherActiveButton}`;
    return (
      <div className={className} onClick={toggle}>
        <Icon
          className={styles.BacklogViewSwitcherButtonText}
          name={doesDisplay ? 'eye slash' : 'eye'}
        />
      </div>
    );
  }
}
