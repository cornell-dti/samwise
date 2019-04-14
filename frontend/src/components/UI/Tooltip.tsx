import React, { Component, ReactElement } from 'react';
import SamwiseIcon from './SamwiseIcon';
import { IconName } from './samwise-icon-types';
import styles from './Tooltip.module.css';

type Props = {
  readonly text: string;
  readonly iconName: IconName;
}
type State = {
  hover: boolean;
}

export default class Tooltip extends Component<Props, State> {
  public readonly state: State = { hover: false };

  private handleMouseIn = () => this.setState({ hover: true });

  private handleMouseOut = () => this.setState({ hover: false });

  public render(): ReactElement {
    const { text, iconName } = this.props;
    const { hover } = this.state;
    const tooltipStyle = { display: hover ? 'block' : 'none' };

    return (
      <div>
        <div
          onMouseOver={this.handleMouseIn}
          onMouseOut={this.handleMouseOut}
          onFocus={this.handleMouseIn}
          onBlur={this.handleMouseOut}
        >
          <SamwiseIcon iconName={iconName} />
        </div>
        <div className={styles.tooltip}>
          <div className={styles.tooltiptext} style={tooltipStyle}>{text}</div>
        </div>
      </div>
    );
  }
}
