// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { bindActionCreators } from 'redux';
import { editColorConfig as editColorConfigAction } from '../../store/actions';
import styles from './TagColorConfigItemAdder.css';
import type { Dispatch, TagColorConfigEditAction } from '../../store/action-types';

type Props = {| editColorConfig: (tag: string, color: string) => TagColorConfigEditAction |};

type State = {| tagInput: string, colorInput: string |};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  editColorConfig: editColorConfigAction,
}, dispatch);

class TagColorConfigItemAdder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tagInput: 'Some Random Class',
      colorInput: 'red',
    };
  }

  changeTagName = (event) => {
    event.persist();
    this.setState(state => ({ ...state, tagInput: event.target.value }));
  };

  changeColor = color => this.setState(state => ({ ...state, colorInput: color.hex }));

  addItemColor = () => {
    const { tagInput, colorInput } = this.state;
    const { editColorConfig } = this.props;
    editColorConfig(tagInput, colorInput);
  };

  render() {
    const { tagInput, colorInput } = this.state;
    return (
      <div className={styles.TagColorConfigItemAdder}>
        <input type="text" value={tagInput} onChange={this.changeTagName} />
        <div>
          Chosen Color is
          {' '}
          {colorInput}
        </div>
        <GithubPicker color={colorInput} onChangeComplete={this.changeColor} />
        <button type="button" onClick={this.addItemColor}>Add me</button>
      </div>
    );
  }
}

const ConnectedTagColorConfigItemAdder = connect(
  null,
  mapDispatchToProps,
)(TagColorConfigItemAdder);
export default ConnectedTagColorConfigItemAdder;
