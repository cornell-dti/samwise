// @flow

import React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { editColorConfig as editColorConfigAction } from '../../store/actions';

const mapDispatchToProps = dispatch => ({
  editColorConfig: (tag, color) => dispatch(editColorConfigAction(tag, color)),
});

type Props = {
  tag: string,
  color: string,
  editColorConfig: (tag: string, color: string) => void
}

class ColorEditor extends React.Component<Props> {
  handleStateComplete = (color) => {
    const { tag, editColorConfig } = this.props;
    editColorConfig(tag, color.hex);
  };

  render() {
    const { color } = this.props;
    return (
      <GithubPicker color={color} onChangeComplete={this.handleStateComplete} />
    );
  }
}

export default connect(null, mapDispatchToProps)(ColorEditor);
