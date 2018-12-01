// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import ClassPicker from '../ClassPicker/ClassPicker';
import styles from './Picker.css';
import type { State as StoreState, Tag } from '../../store/store-types';
import { getColorByTagId, getNameByTagId } from '../../util/tag-util';

type OwnProps = {|
  +onOpened: () => void;
  +onTagChange: (number) => void;
|};
type SubscribedProps = {| +tags: Tag[] |};
type Props = {| ...OwnProps; ...SubscribedProps |};

type State = {|
  +tag: number;
  +opened: boolean;
  +reset: boolean;
|};

const mapStateToProps = ({ tags }: StoreState) => ({ tags });

const initialState = { tag: -1, opened: false, reset: true };

class ClassPickerWrap extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  resetState = (e?: SyntheticEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState(initialState);
  };

  handleOpenClose = () => {
    const { opened } = this.state;
    this.setState({ opened: !opened });
    if (!opened) {
      const { onOpened } = this.props;
      onOpened();
    }
  };

  close = () => {
    this.setState({ opened: false });
  };

  handleTagChange = (tag: number) => {
    if (tag === -1) {
      this.resetState();
    } else {
      this.setState({ tag, opened: false, reset: false });
    }
    const { onTagChange } = this.props;
    onTagChange(tag);
  };

  render() {
    const { tag, opened, reset } = this.state;
    const { tags } = this.props;
    return (
      <div className={styles.Main}>
        <span
          role="button"
          tabIndex={-1}
          onClick={this.handleOpenClose}
          onKeyDown={() => {}}
          style={{ background: reset ? 'none' : getColorByTagId(tags, tag) }}
          className={styles.LabelHack}
        >
          <span className={styles.TagDisplay} style={{ display: reset ? 'none' : 'inline' }}>
            {getNameByTagId(tags, tag)}
          </span>
          <Icon
            name="tag"
            className={styles.CenterIcon}
            style={{ display: reset ? 'inline' : 'none', color: 'black' }}
          />
          <button
            type="button"
            className={styles.ResetButton}
            onClick={this.resetState}
            style={{ display: reset ? 'none' : 'inline' }}
          >
            &times;
          </button>
        </span>
        <div className={styles.NewTaskClassPick} style={{ display: opened ? 'block' : 'none' }}>
          <ClassPicker onTagChange={this.handleTagChange} />
        </div>
      </div>
    );
  }
}

const ConnectedClassPickerWrap = connect<OwnProps, SubscribedProps, Props>(
  mapStateToProps, null, null, { withRef: true },
)(ClassPickerWrap);
export default ConnectedClassPickerWrap;
