// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import type { EditTagAction, RemoveTagAction } from '../../../store/action-types';
import { editTag as editTagAction, removeTag as removeTagAction } from '../../../store/actions';
import type { Tag } from '../../../store/store-types';
import styles from './TagItem.css';
import { dispatchConnect } from '../../../store/react-redux-util';
import ColorEditor from './ColorEditor';

type Props = {|
  +tag: Tag;
  +editTag: (tag: Tag) => EditTagAction;
  +removeTag: (tagId: number) => RemoveTagAction
|};

class TagItem extends React.Component<Props, void> {
  removeMe = () => {
    // eslint-disable-next-line
    if (!confirm('Do you want to remove this config?')) {
      return;
    }
    const { tag: { id }, removeTag } = this.props;
    removeTag(id);
  };

  /**
   * Edit the color.
   *
   * @param {string} color the color from the editor.
   */
  editColor = (color: string) => {
    const { tag, editTag } = this.props;
    editTag({ ...tag, color });
  };

  render(): Node {
    const { tag } = this.props;
    const { name, color, type } = tag;
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
        <ColorEditor color={color} onChange={this.editColor} />
        <button type="button" className={styles.DeleteTag} onClick={this.removeMe}>
          <Icon name="close" />
        </button>
      </li>
    );
  }
}

const actionCreators = { editTag: editTagAction, removeTag: removeTagAction };
const Connected = dispatchConnect<Props, typeof actionCreators>(actionCreators)(TagItem);
export default Connected;
