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

function ColorEditor(props: Props) {
  const { tag, color, editColorConfig } = props;
  const handleStateComplete = (c) => {
    editColorConfig(tag, c.hex);
  };
  return (
    <div>
      <GithubPicker color={color} onChangeComplete={handleStateComplete} />
    </div>
  );
}

const ConnectedColorEditor = connect(null, mapDispatchToProps)(ColorEditor);
export default ConnectedColorEditor;
