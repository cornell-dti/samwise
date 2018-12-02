// @flow strict

import React from 'react';
import type { Node } from 'react';
import ColorConfigItem from './ColorConfigItem';
import type { State, Tag } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| tags: Tag[] |};

const mapStateToProps = ({ tags }: State): Props => ({
  tags: tags.filter(t => t.type === 'class'),
});

function ClassColorConfigItemList({ tags }: Props): Node {
  return (
    <ul style={{ width: '100%', display: 'inline-block', padding: 0, margin:0, listStyle: 'none' }}>
      {tags.map(tag => (<ColorConfigItem key={tag.id} tag={tag} />))}
    </ul>
  );
}

const ConnectedClassColorConfigItemList = simpleConnect<{}, Props>(
  mapStateToProps,
)(ClassColorConfigItemList);
export default ConnectedClassColorConfigItemList;
