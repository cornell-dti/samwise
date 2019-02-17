// @flow strict

import React from 'react';
import type { Node } from 'react';
import styles from './TagItem.css';
import ColorEditor from './ColorEditor';
import { addTag } from '../../../firebase/actions';

type Props = {||};
type State = {| +name: string; +color: string; |};

const defaultColor = '#289de9';
const initialState: State = { name: '', color: defaultColor };

export default class OtherTagAdder extends React.PureComponent<Props, State> {
  state: State = initialState;

  editColor = (color: string) => this.setState({ color });

  editName = (event: SyntheticEvent<HTMLInputElement>) => this.setState({
    name: event.currentTarget.value,
  });

  onSubmit = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    const { name, color } = this.state;
    addTag({
      name, color, classId: null,
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
