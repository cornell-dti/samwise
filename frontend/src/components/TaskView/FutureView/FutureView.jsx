// @flow strict

import React from 'react';
import type { Node } from 'react';
import FutureViewControl from './FutureViewControl';
import FutureViewContainer from './FutureViewContainer';
import type { FutureViewDisplayOption } from './future-view-types';
import type { WindowSize } from '../../Util/Responsive/window-size-context';

export opaque type FutureViewConfig: Object = {|
  +displayOption: FutureViewDisplayOption;
  +offset: number;
|};
type Props = {|
  +windowSize: WindowSize;
  +config: FutureViewConfig;
  +onConfigChange: (FutureViewConfig) => void;
|};

export type FutureViewConfigProvider = {|
  +initialValue: FutureViewConfig;
  +isInNDaysView: (FutureViewConfig) => boolean;
|};
export const futureViewConfigProvider: FutureViewConfigProvider = {
  initialValue: {
    displayOption: {
      containerType: 'N_DAYS',
      doesShowCompletedTasks: true,
    },
    offset: 0,
  },
  isInNDaysView: (config: FutureViewConfig) => config.displayOption.containerType === 'N_DAYS',
};

class FutureView extends React.PureComponent<Props> {
  /**
   * Compute the number of days in n-days mode.
   *
   * @return {number} the number of days in n-days mode.
   */
  nDays = (): number => {
    const { windowSize: { width } } = this.props;
    if (width > 960) { return 5; }
    if (width > 768) { return 4; }
    return 1;
  };

  /**
   * Changes the state when the future view controller changes.
   *
   * @param {$Shape<State>} change the partial change.
   */
  controlOnChange = (change: $Shape<FutureViewConfig>) => {
    const { config, onConfigChange } = this.props;
    onConfigChange({ ...config, ...change });
  };

  render(): Node {
    const { config: { displayOption, offset } } = this.props;
    const nDays = this.nDays();
    return (
      <div>
        <FutureViewControl
          nDays={nDays}
          displayOption={displayOption}
          offset={offset}
          onChange={this.controlOnChange}
        />
        <FutureViewContainer
          nDays={nDays}
          futureViewDisplayOption={displayOption}
          futureViewOffset={offset}
        />
      </div>
    );
  }
}

// const ConnectedFutureView = windowSizeConnect<Props>(FutureView);
export default FutureView;
