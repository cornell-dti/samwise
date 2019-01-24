// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { Tag } from '../../../store/store-types';
import styles from './TagItem.css';
import type { AddTagAction } from '../../../store/action-types';
import { addTag as addTagAction } from '../../../store/actions';
import { randomId } from '../../../util/general-util';
import { dispatchConnect } from '../../../store/react-redux-util';
import ColorEditor from './ColorEditor';

type Props = {| +addTag: (tag: Tag) => AddTagAction |};
type State = {| +name: string; +color: string; |};

const defaultColor = '#56d9c1';
const initialState: State = { name: '', color: defaultColor };

class OtherTagAdder extends React.Component<Props, State> {
  state: State = initialState;

  /**
   * Edit the color.
   *
   * @param {string} color the color from the editor.
   */
  editColor = (color: string) => this.setState({ color });

  /**
   * Edit the name.
   *
   * @param {SyntheticEvent<HTMLInputElement>} event the edit event.
   */
  editName = (event: SyntheticEvent<HTMLInputElement>) => this.setState({
    name: event.currentTarget.value,
  });

  /**
   * Handle potential submit.
   *
   * @param {SyntheticKeyboardEvent<HTMLInputElement>} event the potential submit event.
   */
  onSubmit = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    const { name, color } = this.state;
    const { addTag } = this.props;
    addTag({
      id: randomId(), name, color, classId: null,
    });
    this.setState(initialState);
  };

  render(): Node {
    const { name, color } = this.state;
    return (
      <li className={styles.ColorConfigItem}>
        <input
          type="text"
          className={`${styles.TagName} ${styles.AddTagName}`}
          placeholder="New Tag"
          value={name}
          onChange={this.editName}
          onKeyDown={this.onSubmit}
        />
        <ColorEditor color={color} onChange={this.editColor} />
      </li>
    );
  }
}

const ConnectedOtherTagAdder = dispatchConnect<Props, Props>(
  { addTag: addTagAction },
)(OtherTagAdder);
export default ConnectedOtherTagAdder;
