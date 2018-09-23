import React, { Component } from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { editColorConfig } from '../../store/actions';

const mapDispatchToProps = dispatch => ({
  editColorConfig: (tag, color) => dispatch(editColorConfig(tag, color)),
});

class UnconnectedColorEditor extends Component {
  handleStateComplete = (color) => {
    const { tag } = this.props;
    this.props.editColorConfig(tag, color.hex);
  };

  render() {
    const { color } = this.props;
    return (
      <GithubPicker color={color} onChangeComplete={this.handleStateComplete} />
    );
  }
}

const ColorEditor = connect(null, mapDispatchToProps)(UnconnectedColorEditor);
export default ColorEditor;
