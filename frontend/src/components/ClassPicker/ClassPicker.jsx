// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import ClassPickerItem from './ClassPickerItem';
import styles from './ClassPicker.css';
import type { TagColorConfig, State } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type OwnProps = {| +onTagChange: (string) => void |};
type SubscribedProps = {| +tagColorPicker: TagColorConfig |};
type Props = {| ...OwnProps; ...SubscribedProps; |};

const mapStateToProps = ({ tagColorPicker }: State) => ({ tagColorPicker });

/**
 * The component used to pick a class.
 *
 * @param {function} onTagChange the function to call when tag changed.
 * @param {TagColorConfig} tagColorPicker the config of all colors.
 * @return {Node} the rendered picker.
 * @constructor
 */
function ClassPicker({ onTagChange, tagColorPicker }: Props): Node {
  const handleClassChange = (e) => {
    const newTag = e.currentTarget.getAttribute('data-class-title') || 'None';
    onTagChange(newTag);
  };
  const items = Object.keys(tagColorPicker).map(
    cTitle => (
      <ClassPickerItem
        key={cTitle}
        color={tagColorPicker[cTitle]}
        title={cTitle}
        onChange={handleClassChange}
      />
    ),
  );
  return (
    <ul className={styles.NewTaskClass}>
      {items}
    </ul>
  );
}

const ConnectedClassPicker = simpleConnect<Props, OwnProps, SubscribedProps>(
  mapStateToProps,
)(ClassPicker);
export default ConnectedClassPicker;
