// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import ClassPickerItem from './ClassPickerItem';
import styles from './ClassPicker.css';
import type { State, Tag } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type OwnProps = {| +onTagChange: (number) => void |};
type SubscribedProps = {| +tags: Tag[]; |};
type Props = {| ...OwnProps; ...SubscribedProps; |};

const mapStateToProps = ({ tags }: State) => ({ tags });

/**
 * The component used to pick a class.
 *
 * @param {function} onTagChange the function to call when tag changed.
 * @param {Tag[]} tags a list of all tags. Given by the redux store.
 * @return {Node} the rendered picker.
 * @constructor
 */
function ClassPicker({ onTagChange, tags }: Props): Node {
  const handleClassChange = (e) => {
    const newTag = parseInt(e.currentTarget.getAttribute('data-id') || -1, 10);
    onTagChange(newTag);
  };
  const items = tags.map(({ id, name, color }: Tag) => (
    <ClassPickerItem key={id} id={id} title={name} color={color} onChange={handleClassChange} />
  ));
  return (
    <ul className={styles.NewTaskClass}>
      {items}
    </ul>
  );
}

const ConnectedClassPicker = simpleConnect<OwnProps, SubscribedProps>(
  mapStateToProps,
)(ClassPicker);
export default ConnectedClassPicker;
