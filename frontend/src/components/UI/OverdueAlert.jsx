// @flow strict

import React from 'react';
import type { Node } from 'react';
import styles from './OverdueAlert.css';

type Props = {|
  +absolutePosition: ?{| +top: number; +left: number; |};
|};

export default function OverdueAlert({ absolutePosition }: Props): Node {
  if (absolutePosition == null) {
    return <div className={styles.OverdueAlertRelative}>!</div>;
  }
  const { top, left } = absolutePosition;
  const style = { top: `${top}px`, left: `${left}px` };
  return <div className={styles.OverdueAlertAbsolute} style={style}>!</div>;
}

// eslint-disable-next-line react/default-props-match-prop-types
OverdueAlert.defaultProps = { absolutePosition: null };
