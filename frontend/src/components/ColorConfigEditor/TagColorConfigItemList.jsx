// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import ColorConfigItem from './ColorConfigItem';
import type { State, Tag } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';
import AddNormalTag from './AddNormalTag';

type Props = {| tags: Tag[] |};

const mapStateToProps = ({ tags }: State): Props => ({
  tags: tags.filter(t => t.type === 'other'),
});

function TagColorConfigItemList({ tags }: Props): Node {
  return (
    <ul style={{ width: '100%', display: 'inline-block', padding: 0, margin:0, listStyle: 'none' }}>
      {tags.filter(tag => tag.name != 'None').map(tag => (<ColorConfigItem key={tag.id} tag={tag} />))}
      <AddNormalTag />
    </ul>
  );
}

const ConnectedTagColorConfigItemList = simpleConnect<{}, Props>(
  mapStateToProps,
)(TagColorConfigItemList);
export default ConnectedTagColorConfigItemList;
