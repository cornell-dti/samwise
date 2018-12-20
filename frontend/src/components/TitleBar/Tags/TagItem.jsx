// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import type { RemoveTagAction } from '../../../store/action-types';
import { removeTag as removeTagAction } from '../../../store/actions';
import ColorEditor from './ColorEditor';
import type { Tag } from '../../../store/store-types';
import styles from './TagItem.css';
import { colMap } from './ListColors';

type Props = {|
  +tag: Tag;
  +removeTag: (tagId: number) => RemoveTagAction
|};

type State = {| showEditor: boolean |};

class TagItem extends React.Component<Props, State> {
  state: State = { showEditor: false };

  removeMe = () => {
    // eslint-disable-next-line
    if (!confirm('Do you want to remove this config?')) {
      return;
    }
    const { tag: { id }, removeTag } = this.props;
    removeTag(id);
  };

  toggleEditor = () => this.setState(s => ({ showEditor: !s.showEditor }));

  render() {
    const { tag } = this.props;
    const { name, color, type } = tag;
    const { showEditor } = this.state;
    const isClass = type === 'class';
    return (
      <li className={styles.ColorConfigItem}>
        <span
          className={styles.TagName}
          style={{ width: isClass ? '100px' : 'calc(100% - 150px)' }}
        >
          {name}
        </span>
        {isClass && <span className={styles.ClassExpandedTitle}>Class Name Goes Here</span>}
        <button type="button" className={styles.ColorEdit} onClick={this.toggleEditor}>
          {colMap[color.toLowerCase()]}
          <span className={styles.ColorEditDisp} style={{ backgroundColor: color }} />
          <Icon className={styles.ColorEditArrow} name="angle down" />
        </button>
        <button type="button" className={styles.DeleteTag} onClick={this.removeMe}>
          <Icon name="close" />
        </button>
        {showEditor && (
          <div className={styles.OpenPicker}>
            <ColorEditor tag={tag} changeCallback={this.toggleEditor} />
          </div>
        )}
      </li>
    );
  }
}

const ConnectedTagItem = connect(null, { removeTag: removeTagAction })(TagItem);
export default ConnectedTagItem;
