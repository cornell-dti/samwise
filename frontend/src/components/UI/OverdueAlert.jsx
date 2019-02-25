// @flow strict

import React from 'react';
import type { Node } from 'react';
import styles from './OverdueAlert.module.css';

type Props = {| +absolutePosition: ?{| +top: number; +right: number; |}; |};

/**
 * The overdue alert that will be displayed on the top-right corner of a div.
 */
export default function OverdueAlert({ absolutePosition }: Props): Node {
  if (absolutePosition == null) {
    return <div className={styles.OverdueAlertRelative}>!</div>;
  }
  const { top, right } = absolutePosition;
  const style = { top: `${top}px`, right: `${right}px` };
  return <div className={styles.OverdueAlertAbsolute} style={style}>!</div>;
}

// Eslint is dumb when working with Flow in this case.
// eslint-disable-next-line react/default-props-match-prop-types
OverdueAlert.defaultProps = { absolutePosition: null };
