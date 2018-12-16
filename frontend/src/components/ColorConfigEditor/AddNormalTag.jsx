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
import { colMap } from './ListColors';

type Props = {|
  +addTag: (tag: Tag) => AddTagAction
|};

type State = {|
  +showEditor: boolean;
  +color: string;
  +reset: boolean;
|};

const colArray = Object.keys(colMap);

class AddNormalTag extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      // whether to show the name editor and color picker
      showEditor: false,
      color: '#56d9c1',
      reset: true,
    };
  }


  toggleEditor = () => {
    this.setState(s => ({ ...s, showEditor: !s.showEditor }));
  };

  handleColor = (e) => {
    this.setState({ color: e.hex, reset: false });
    this.toggleEditor();
  };

  handleSave = (saveEvent: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (saveEvent.keyCode !== 13) {
      return;
    }
    const currName = saveEvent.currentTarget.value;
    const { color } = this.state;
    const currColor = color;

    this.setState({ color: '#56d9c1', reset: true, showEditor: false });
    saveEvent.currentTarget.value = '';
    const { addTag } = this.props;
    addTag({
      id: randomId(),
      type: 'other',
      name: currName,
      color: currColor,
    });
  };

  render() {
    const { showEditor, reset, color } = this.state;
    return (
      <li style={{ width: '100%', margin: 0 }} className={styles.Main}>
        <input
          className={`${styles.TagName} ${styles.AddTagName}`}
          type="text"
          placeholder="New Tag"
          onKeyDown={this.handleSave}
        />
        <button type="button" className={styles.ColorEdit} onClick={this.toggleEditor}>
          {reset ? 'Select' : colMap[color]}
          <span className={styles.ColorEditDisp} style={{ backgroundColor: color }} />
          <Icon className={styles.ColorEditArrow} name="angle down" />
        </button>
        {
          showEditor && (
            <div className={styles.OpenPicker}>
              <GithubPicker
                color={color}
                onChangeComplete={this.handleColor}
                triangle="top-right"
                colors={colArray}
              />
            </div>
          )
        }
      </li>
    );
  }
}

const ConnectedAddNormalTag = connect(null, { addTag: addTagAction })(AddNormalTag);
export default ConnectedAddNormalTag;
