// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import ClassPickerItem from './ClassPickerItem';
import styles from './ClassPicker.css';
import type { ColorConfig, State } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type OwnProps = {| +onTagChange: (string) => void |};
type SubscribedProps = {| +classColorConfig: ColorConfig; +tagColorConfig: ColorConfig; |};
type Props = {| ...OwnProps; ...SubscribedProps; |};

const mapStateToProps = ({ classColorConfig, tagColorConfig }: State) => ({
  classColorConfig, tagColorConfig,
});

/**
 * The component used to pick a class.
 *
 * @param {function} onTagChange the function to call when tag changed.
 * @param {ColorConfig} classColorConfig the config of all class colors.
 * @param {ColorConfig} tagColorConfig the config of all tag colors.
 * @return {Node} the rendered picker.
 * @constructor
 */
function ClassPicker({ onTagChange, classColorConfig, tagColorConfig }: Props): Node {
  const handleClassChange = (e) => {
    const newTag = e.currentTarget.getAttribute('data-class-title') || 'None';
    onTagChange(newTag);
  };
  const items = Object.keys({ ...classColorConfig, ...tagColorConfig }).map(
    (title: string) => {
      const color = tagColorConfig[title] || classColorConfig[title];
      return (
        <ClassPickerItem key={title} color={color} title={title} onChange={handleClassChange} />
      );
    },
  );
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
