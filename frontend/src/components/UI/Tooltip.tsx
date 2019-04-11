import React, { ReactElement } from 'react';
import SamwiseIcon from './SamwiseIcon';
import { IconName } from './Samwise-icon-types';

type Props = {
  readonly name: string;
  readonly iconName: IconName;
}
type State = {
  hover: boolean;
}

class Tooltip extends React.Component<Props, State> {
  public readonly state: State = { hover: false };

  private handleMouseIn = () => {
    this.setState({ hover: true });
  };

  private handleMouseOut = () => {
    this.setState({ hover: false });
  };

  public render(): ReactElement {
    const { name, iconName } = this.props;
    const { hover } = this.state;
    const tooltipStyle = {
      display: hover ? 'block' : 'none',
    };

    return (
      <div>
        <div
          onMouseOver={this.handleMouseIn}
          onMouseOut={this.handleMouseOut}
        >
          <SamwiseIcon iconName={iconName}>
            {name}
          </SamwiseIcon>
        </div>
        <div>
          <div style={tooltipStyle}>this is the tooltip!!</div>
        </div>
      </div>
    );
  }
}

export default Tooltip;
