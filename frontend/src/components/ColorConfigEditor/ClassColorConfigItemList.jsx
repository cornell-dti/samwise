// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import ColorConfigItem from './ColorConfigItem';
import type { State, Tag } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| tags: Tag[] |};

const mapStateToProps = ({ tags }: State): Props => ({
  tags: tags.filter(t => t.type === 'class'),
});

function ClassColorConfigItemList({ tags }: Props): Node {
  return (
    <List divided relaxed style={{ width: '500px', display: 'inline-block' }}>
      {tags.map(tag => (<ColorConfigItem key={tag.id} tag={tag} />))}
    </List>
  );
}

const ConnectedClassColorConfigItemList = simpleConnect<{}, Props>(
  mapStateToProps,
)(ClassColorConfigItemList);
export default ConnectedClassColorConfigItemList;
