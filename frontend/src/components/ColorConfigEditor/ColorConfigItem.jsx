// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import type { RemoveTagAction } from '../../store/action-types';
import { removeTag as removeTagAction } from '../../store/actions';
import ColorEditor from './ColorEditor';
import type { Tag } from '../../store/store-types';

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
      <List.Item style={isClass ? { width: '500px' } : { width: '250px' }}>
        <List.Content>
          <List.Header as="a" style={{ backgroundColor: color }}>{name}</List.Header>
          <List.Description as="a">
            Color:
            {' '}
            {color}
          </List.Description>
          <button type="button" onClick={this.removeMe}>Remove me</button>
          <button type="button" onClick={this.toggleEditor}>Toggle Editor</button>
          {
            showEditor && <ColorEditor tag={tag} />
          }
        </List.Content>
      </List.Item>
    );
  }
}

const ConnectedTagColorConfigItem = connect(null, { removeTag: removeTagAction })(ColorConfigItem);
export default ConnectedTagColorConfigItem;
