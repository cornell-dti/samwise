// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { addTag as addTagAction } from '../../store/actions';
import type { AddTagAction } from '../../store/action-types';
import styles from './ColorConfigItemAdder.css';
import type { Tag } from '../../store/store-types';
import { randomId } from '../../util/general-util';

type Props = {|
  addTag: (tag: Tag) => AddTagAction
|};

type State = {| tagInput: string, colorInput: string |};

const actionCreators = { addTag: addTagAction };

class ColorConfigItemAdder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tagInput: '',
      colorInput: '#56d9c1',
    };
  }

  changeTagName = (event) => {
    event.persist();
    this.setState(state => ({ ...state, tagInput: event.target.value }));
  };

  changeColor = () => this.setState(state => ({ ...state, colorInput: '#B80000' }));

  // addItemColor = () => {
  //   const { tagInput, colorInput } = this.state;
  //   const { editColorConfig } = this.props;
  //   editColorConfig(tagInput, colorInput);
  // };

  checkEnterStatus = (e) => {
    if (e.key === 'Enter') {
      const { tagInput, colorInput } = this.state;
      const { addTag } = this.props;
      addTag({
        id: randomId(), type: 'class', name: tagInput, color: colorInput,
      });
    this.setState(state => ({ ...state, tagInput: '', colorInput: '#56d9c1' }));
    }
  };

  render() {
    const { tagInput, colorInput } = this.state;
    return (
      <div className={styles.TagColorConfigItemAdder}>
        <input
          className={styles.searchClasses}
          type="text"
          value={tagInput}
          onChange={this.changeTagName}
          onKeyPress={this.checkEnterStatus}
          placeholder="&#x1F50E; Search classes"
        />
      </div>
    );
  }
}

const ConnectedTagColorConfigItemAdder = connect(null, actionCreators)(ColorConfigItemAdder);
export default ConnectedTagColorConfigItemAdder;
