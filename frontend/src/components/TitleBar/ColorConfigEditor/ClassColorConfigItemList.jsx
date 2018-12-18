// @flow strict

import React from 'react';
import type { Node } from 'react';
import ColorConfigItem from './ColorConfigItem';
import type { State, Tag } from '../../../store/store-types';
import { simpleConnect } from '../../../store/react-redux-util';
import styles from './ColorConfigItemList.css';

type Props = {| tags: Tag[] |};

function ClassColorConfigItemList({ tags }: Props): Node {
  return (
    <ul className={styles.ColorConfigItemList}>
      {tags.map(tag => (<ColorConfigItem key={tag.id} tag={tag} />))}
    </ul>
  );
}

const ConnectedClassColorConfigItemList = simpleConnect<{}, Props>(
  ({ tags }: State): Props => ({ tags: tags.filter(t => t.type === 'class') }),
)(ClassColorConfigItemList);
export default ConnectedClassColorConfigItemList;
