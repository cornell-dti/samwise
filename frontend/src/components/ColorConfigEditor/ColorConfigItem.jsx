// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import type { RemoveTagAction } from '../../store/action-types';
import { removeTag as removeTagAction } from '../../store/actions';
import ColorEditor from './ColorEditor';
import { Icon } from 'semantic-ui-react';
import type { Tag } from '../../store/store-types';
import styles from './IndividualItem.css';

type Props = {|
  +tag: Tag;
  +removeTag: (tagId: number) => RemoveTagAction
|};

type State = {| showEditor: boolean |};

class ColorConfigItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      // whether to show the name editor and color picker
      showEditor: false,
    };
  }

  removeMe = () => {
    // eslint-disable-next-line
    if (!confirm('Do you want to remove this config?')) {
      return;
    }
    const { tag, removeTag } = this.props;
    removeTag(tag.id);
  };

  toggleEditor = () => {
    this.setState(s => ({ ...s, showEditor: !s.showEditor }));
  };

  render() {
    const { tag } = this.props;
    const { name, color, type } = tag;
    const { showEditor } = this.state;
    const isClass = type === 'class';
    return (
      <li style={{ width: '100%', margin:0 }} className={styles.Main}>
        <span className={styles.TagName} style={{ width: isClass ? '100px' : 'calc(100% - 150px)' }}>{name}</span>
        <span className={styles.ClassExpandedTitle} style={{ display: isClass ? 'inline-block' : 'none' }}>
          Class Name Goes Here
        </span>
        <button type="button" className={styles.ColorEdit} onClick={this.toggleEditor}>
          {color}
          <span className={styles.ColorEditDisp} style={{ backgroundColor: color }} />
          <Icon className={styles.ColorEditArrow} name="angle down" />
        </button>
        <button type="button" className={styles.DeleteTag} onClick={this.removeMe}>
          <Icon name="close" />
        </button>
        {
          showEditor && <div className={styles.OpenPicker}><ColorEditor tag={tag} changeCallback={this.toggleEditor} /></div>
        }
      </li>
    );
  }
}
//style={{ backgroundColor: color }}
/*
Color:
            {' '}
            {color}
            */

const ConnectedTagColorConfigItem = connect(null, { removeTag: removeTagAction })(ColorConfigItem);
export default ConnectedTagColorConfigItem;
