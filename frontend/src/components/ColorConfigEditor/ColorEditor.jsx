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
|};

function ColorEditor(props: Props) {
  const { tag, editTag } = props;
  const { color } = tag;
  const handleStateComplete = (c) => {
    editTag({ ...tag, color: c.hex });
  };
  return (
    <div>
      <GithubPicker color={color} onChangeComplete={handleStateComplete} />
    </div>
  );
}

const ConnectedColorEditor = connect(null, { editTag: editTagAction })(ColorEditor);
export default ConnectedColorEditor;
