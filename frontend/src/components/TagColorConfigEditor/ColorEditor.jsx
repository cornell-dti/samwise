// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import type { Dispatch } from 'redux';
import { editColorConfig as editColorConfigAction } from '../../store/actions';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  editColorConfig: (tag: string, color: string) => dispatch(editColorConfigAction(tag, color)),
});

type Props = {|
  tag: string,
  color: string,
  editColorConfig: (tag: string, color: string) => void,
|};

class ColorEditor extends React.Component<Props> {
  handleStateComplete = (color) => {
    const { tag, editColorConfig } = this.props;
    editColorConfig(tag, color.hex);
  };

  render() {
    const { color } = this.props;
    return (
      <div>
        <GithubPicker color={color} onChangeComplete={this.handleStateComplete} />
      </div>
    );
  }
}

const ConnectedColorEditor = connect(null, mapDispatchToProps)(ColorEditor);
export default ConnectedColorEditor;
