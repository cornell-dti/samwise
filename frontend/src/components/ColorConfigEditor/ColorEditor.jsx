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


/*

light-teal          #7ed4e5
white               #ffffff
medium-purple       #9d4aa9
peachy-pink         #ff8a8a
greyish-brown       #5a5a5a
apple-green         #7ed321
brick               #b92424
tiffany-blue        #5ed3e9
dark-sky-blue       #459ae5
warm-grey           #7b7b7b
carolina-blue       #7fbdff
scarlet             #d0021b
warm-grey-two       #9b9b9b
greyish-brown-two   #4a4a4a
barney-purple       #740794
cornflower          #5f53ff
seafoam-blue        #56d9c1

*/

const colArray = [
  '#7ed4e5',
  '#ffffff',
  '#9d4aa9',
  '#ff8a8a',
  '#5a5a5a',
  '#7ed321',
  '#b92424',
  '#5ed3e9',
  '#459ae5',
  '#7b7b7b',
  '#7fbdff',
  '#d0021b',
  '#9b9b9b',
  '#4a4a4a',
  '#740794',
  '#5f53ff',
  '#56d9c1',
];

function ColorEditor(props: Props) {
  const { tag, editTag, changeCallback } = props;
  const { color } = tag;
  const handleStateComplete = (c) => {
    editTag({ ...tag, color: c.hex });
    changeCallback();
  };
  return (
    <GithubPicker color={color} onChangeComplete={handleStateComplete} triangle="top-right" colors={colArray} />
  );
}

const ConnectedColorEditor = connect(null, { editTag: editTagAction })(ColorEditor);
export default ConnectedColorEditor;
