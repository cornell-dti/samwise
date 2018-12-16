// @flow strict

import React from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';

type Props = {|
  +onPinChange: (inFocus: boolean) => void;
|};
type State = {| +pinned: boolean; |}

export default class FocusPicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { pinned: false };
  }

  handleOpenClose = (e: SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    const { onPinChange } = this.props;
    const { pinned } = this.state;
    this.setState({ pinned: !pinned });
    onPinChange(!pinned);
  };

  resetState = () => this.setState({ pinned: false });

  render() {
    const { pinned } = this.state;
    return (
      <div className={styles.Main}>
        <span
          role="button"
          tabIndex={-1}
          onClick={this.handleOpenClose}
          onKeyDown={() => {}}
          style={{ background: 'none' }}
          className={styles.LabelHack}
        >
          <Icon
            name="pin"
            className={styles.CenterIcon}
            style={{ color: pinned ? 'black' : 'gray' }}
          />
        </span>
      </div>
    );
  }
}
