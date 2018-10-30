// @flow

import * as React from 'react';
import { Button } from 'semantic-ui-react';
import type { BacklogDisplayOption } from './backlog-types';
import styles from './Backlog.css';
import BacklogDaysContainer from './BacklogDaysContainer';

type ComponentState = {| displayOption: BacklogDisplayOption |};

/**
 * The component used to render the entire backlog.
 */
export default class Backlog extends React.Component<{}, ComponentState> {
  constructor(props: {}) {
    super(props);
    this.state = { displayOption: 'FOUR_DAYS' };
  }

  render() {
    const { displayOption } = this.state;
    const setDisplayOption = (newDisplayOption: BacklogDisplayOption) => (
      () => this.setState({ displayOption: newDisplayOption })
    );
    const switchComponent = (
      <div className={styles.BacklogControl}>
        <span className={styles.BacklogControlPadding} />
        <Button.Group>
          <Button onClick={setDisplayOption('FOUR_DAYS')}>4D</Button>
          <Button.Or />
          <Button onClick={setDisplayOption('BIWEEKLY')}>2W</Button>
          <Button.Or />
          <Button onClick={setDisplayOption('MONTHLY')}>M</Button>
        </Button.Group>
      </div>
    );
    return (
      <div>
        {switchComponent}
        <BacklogDaysContainer displayOption={displayOption} />
      </div>
    );
  }
}
