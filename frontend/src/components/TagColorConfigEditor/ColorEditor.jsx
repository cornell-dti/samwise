// @flow strict

import * as React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { bindActionCreators } from 'redux';
import { editColorConfig as editColorConfigAction } from '../../store/actions';
import type { Dispatch, TagColorConfigEditAction } from '../../store/action-types';

type Props = {|
  tag: string,
  color: string,
  editColorConfig: (tag: string, color: string) => TagColorConfigEditAction,
|};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
  { editColorConfig: editColorConfigAction }, dispatch,
);

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
