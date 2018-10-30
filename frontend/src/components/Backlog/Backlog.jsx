// @flow strict

import * as React from 'react';
import type { BacklogDisplayOption } from './backlog-types';
import BacklogDaysContainer from './BacklogDaysContainer';
import BacklogViewSwitcher from './BacklogViewSwitcher';

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
    return (
      <div>
        <BacklogViewSwitcher onChange={o => this.setState({ displayOption: o })} />
        <BacklogDaysContainer displayOption={displayOption} />
      </div>
    );
  }
}
