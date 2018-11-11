// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { editColorConfig as editColorConfigAction } from '../../store/actions';
import styles from './ColorConfigItemAdder.css';
import type { ColorConfigEditAction } from '../../store/action-types';

type Props = {|
  editColorConfig: (tag: string, color: string, classOrTag: string) => ColorConfigEditAction
|};

type State = {| tagInput: string, colorInput: string |};

const actionCreators = {
  editColorConfig: editColorConfigAction,
};

class ColorConfigItemAdder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tagInput: 'Search classes',
      colorInput: 'red',
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
      const { editColorConfig } = this.props;
      editColorConfig(tagInput, colorInput, 'class');
    }
  };

  render() {
    const { tagInput, colorInput } = this.state;
    return (
      <div className={styles.TagColorConfigItemAdder}>
        <div>
          <p className={styles.searchClassesLabel}>Add Class Tags</p>
          <input
            className={styles.searchClasses}
            type="text"
            value={tagInput}
            onChange={this.changeTagName}
            onKeyPress={this.checkEnterStatus}
          />
        </div>
      </div>
    );
  }
}

const ConnectedTagColorConfigItemAdder = connect(null, actionCreators)(ColorConfigItemAdder);
export default ConnectedTagColorConfigItemAdder;
