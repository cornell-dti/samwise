// @flow strict

import * as React from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { editTag as editTagAction } from '../../store/actions';
import type { EditTagAction } from '../../store/action-types';
import type { Tag } from '../../store/store-types';

type Props = {|
  tag: Tag,
  editTag: (tag: Tag) => EditTagAction,
  changeCallback: Function,
|};

function ColorEditor(props: Props) {
  const { tag, editTag, changeCallback } = props;
  const { color } = tag;
  const handleStateComplete = (c) => {
    editTag({ ...tag, color: c.hex });
    changeCallback();
  };
  return (
    <GithubPicker color={color} onChangeComplete={handleStateComplete} triangle="top-right" />
  );
}

const ConnectedColorEditor = connect(null, { editTag: editTagAction })(ColorEditor);
export default ConnectedColorEditor;
