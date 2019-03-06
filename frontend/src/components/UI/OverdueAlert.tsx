import React, { ReactElement } from 'react';
import styles from './OverdueAlert.css';

type Props = { readonly absolutePosition: { readonly top: number; readonly right: number } | null };

/**
 * The overdue alert that will be displayed on the top-right corner of a div.
 */
export default function OverdueAlert({ absolutePosition }: Props): ReactElement {
  if (absolutePosition == null) {
    return <div className={styles.OverdueAlertRelative}>!</div>;
  }
  const { top, right } = absolutePosition;
  const style = { top: `${top}px`, right: `${right}px` };
  return <div className={styles.OverdueAlertAbsolute} style={style}>!</div>;
}

OverdueAlert.defaultProps = { absolutePosition: null };
