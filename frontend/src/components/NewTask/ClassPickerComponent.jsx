// @flow strict

import React from 'react';
import { Icon } from 'semantic-ui-react';
import ClassPicker from '../ClassPicker/ClassPicker';
import styles from './Picker.css';
import type { State as StoreState, Tag } from '../../store/store-types';
import { getColorByTagId, getNameByTagId } from '../../util/tag-util';
import { simpleConnect } from '../../store/react-redux-util';
import { NONE_TAG_ID } from '../../util/constants';

type OwnProps = {|
  +tag: number;
  +opened: boolean;
  +onTagChange: (tag: number) => void;
  +onPickerOpened: () => void;
|};
type SubscribedProps = {| +tags: Tag[] |};
type Props = {| ...OwnProps; ...SubscribedProps |};

function ClassPickerComponent(props: Props) {
  const {
    tag, opened, tags, onTagChange, onPickerOpened,
  } = props;
  // Some Handlers
  const clickPicker = () => { if (!opened) { onPickerOpened(); } };
  const reset = () => onTagChange(NONE_TAG_ID);
  // Picker and Displayer
  const displayedNode = (isDefault: boolean) => {
    const style = { background: isDefault ? 'none' : getColorByTagId(tags, tag) };
    const internal = isDefault
      ? (<Icon name="tag" className={styles.CenterIcon} />)
      : (
        <React.Fragment>
          <span className={styles.TagDisplay}>{getNameByTagId(tags, tag)}</span>
          <button type="button" className={styles.ResetButton} onClick={reset}>&times;</button>
        </React.Fragment>
      );
    return (
      <span role="presentation" onClick={clickPicker} className={styles.Label} style={style}>
        {internal}
      </span>
    );
  };
  return (
    <div className={styles.Main}>
      {displayedNode(tag === NONE_TAG_ID)}
      {opened && (
        <div className={styles.NewTaskClassPick}>
          <ClassPicker onTagChange={onTagChange} />
        </div>
      )}
    </div>
  );
}

const ConnectedClassPicker = simpleConnect<OwnProps, SubscribedProps>(
  ({ tags }: StoreState) => ({ tags }),
)(ClassPickerComponent);
export default ConnectedClassPicker;
