// @flow strict

import * as React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { editColorConfig as editColorConfigAction } from '../../store/actions';
import type { TagColorConfigEditAction } from '../../store/action-types';

type Props = {|
  tag: string,
  color: string,
  editColorConfig: (tag: string, color: string) => TagColorConfigEditAction,
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

const ConnectedColorEditor = connect(null, { editColorConfig: editColorConfigAction })(ColorEditor);
export default ConnectedColorEditor;
