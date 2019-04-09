import React from 'react';
import SamwiseIcon from './SamwiseIcon';
import { IconName } from './Samwise-icon-types';

type props = {
  readonly name: string;
  readonly iconName: string;
}
type states = {
  name: string;
  iconName: IconName;
  hover: boolean;
}

class Tooltip extends React.Component<props, states> {
  public constructor(props: any) {
    super(props);
    this.state = {
      name: props.name,
      iconName: props.iconName,
      hover: false,
    };
  }

  public handleMouseIn() {
    this.setState({ hover: true });
  }

  public handleMouseOut() {
    this.setState({ hover: false });
  }

  public render() {
    const { name, iconName, hover } = this.state;
    const tooltipStyle = {
      display: hover ? 'block' : 'none',
    };

    return (
      <div>
        <SamwiseIcon
          iconName={iconName}
          onMouseOver={this.handleMouseIn.bind(this)}
          onMouseOut={this.handleMouseOut.bind(this)}
        >
          {name}
        </SamwiseIcon>
        <div>
          <div style={tooltipStyle}>this is the tooltip!!</div>
        </div>
      </div>
    );
  }
}

export default Tooltip;
