// @flow strict

import React from 'react';
import type { Node } from 'react';
import ColorConfigItem from './ColorConfigItem';
import type { State, Tag } from '../../../store/store-types';
import { simpleConnect } from '../../../store/react-redux-util';
import AddNormalTag from './AddNormalTag';
import styles from './ColorConfigItemList.css';

type Props = {| tags: Tag[] |};

function TagColorConfigItemList({ tags }: Props): Node {
  return (
    <ul className={styles.ColorConfigItemList}>
      {tags.filter(tag => tag.name !== 'None').map(tag => (
        <ColorConfigItem key={tag.id} tag={tag} />))}
      <AddNormalTag />
    </ul>
  );
}

const ConnectedTagColorConfigItemList = simpleConnect<{}, Props>(
  ({ tags }: State): Props => ({ tags: tags.filter(t => t.type === 'other') }),
)(TagColorConfigItemList);
export default ConnectedTagColorConfigItemList;
