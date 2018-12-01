// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { GithubPicker } from 'react-color';
import type { Tag } from '../../store/store-types';
import styles from './IndividualItem.css';
import type { AddTagAction } from '../../store/action-types';
import { addTag as addTagAction } from '../../store/actions';
import { randomId } from '../../util/general-util';


type Props = {|
  +tag: Tag;
  +addTag: (tag: Tag) => AddTagAction
|};

type State = {| showEditor: boolean |};

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
const colMap = {
  '#7ed4e5': 'light teal       ',
  '#ffffff': 'white            ',
  '#9d4aa9': 'medium purple    ',
  '#ff8a8a': 'peachy pink      ',
  '#5a5a5a': 'greyish brown    ',
  '#7ed321': 'apple green      ',
  '#b92424': 'brick            ',
  '#5ed3e9': 'tiffany blue     ',
  '#459ae5': 'dark sky blue    ',
  '#7b7b7b': 'warm grey        ',
  '#7fbdff': 'carolina blue    ',
  '#d0021b': 'scarlet          ',
  '#9b9b9b': 'warm grey two    ',
  '#4a4a4a': 'greyish brown two',
  '#740794': 'barney purple    ',
  '#5f53ff': 'cornflower       ',
  '#56d9c1': 'seafoam blue     ',
};

class UnconnAddNormalTag extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      // whether to show the name editor and color picker
      showEditor: false,
      color: 'gray',
      reset: true,
    };
  }


  toggleEditor = () => {
    this.setState(s => ({ ...s, showEditor: !s.showEditor }));
  };

  handleColor = (e) => {
    this.setState({ color: e.hex, reset: false });
    this.toggleEditor();
  }

  handleSave = (e) => {
    if (e.keyCode !== 13) { return; }

    const currName = e.target.value;
    const currColor = this.state.color;

    this.setState({ color: 'gray', reset: true, showEditor: false });
    e.target.value = '';

    this.props.addTag({
      id: randomId(),
      type: 'other',
      name: currName,
      color: currColor,
    });
  }

  render() {
    const { showEditor } = this.state;
    return (
      <li style={{ width: '100%', margin:0 }} className={styles.Main}>
        <input className={styles.TagName, styles.AddTagName} type="text" placeholder="New Tag" onKeyDown={this.handleSave} />

        <button type="button" className={styles.ColorEdit} onClick={this.toggleEditor}>
          {this.state.reset ? 'Select' : colMap[this.state.color]}
          <span className={styles.ColorEditDisp} style={{ backgroundColor: this.state.color }} />
          <Icon className={styles.ColorEditArrow} name="angle down" />
        </button>
        {
          showEditor &&
          <div className={styles.OpenPicker}>
            <GithubPicker color={this.state.color} onChangeComplete={this.handleColor} triangle="top-right" colors={colArray} />
          </div>
        }
      </li>
    );
  }
}

const AddNormalTag = connect(null, { addTag: addTagAction })(UnconnAddNormalTag);
export default AddNormalTag;
