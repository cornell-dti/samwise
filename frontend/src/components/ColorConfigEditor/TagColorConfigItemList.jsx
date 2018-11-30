// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import ColorConfigItem from './ColorConfigItem';
import type { State, Tag } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| tags: Tag[] |};

const mapStateToProps = ({ tags }: State): Props => ({
  tags: tags.filter(t => t.type === 'other'),
});

function TagColorConfigItemList({ tags }: Props): Node {
  return (
    <List divided relaxed style={{ width: '250px', display: 'inline-block' }}>
      {tags.map(tag => (<ColorConfigItem key={tag.id} tag={tag} />))}
    </List>
  );
}

const ConnectedTagColorConfigItemList = simpleConnect<{}, Props>(
  mapStateToProps,
)(TagColorConfigItemList);
export default ConnectedTagColorConfigItemList;
