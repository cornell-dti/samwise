import React, { ReactElement } from 'react';
import styles from './OverdueAlert.module.css';

type Props = { readonly target: 'task-card' | 'future-view-task' };

/**
 * The overdue alert that will be displayed on the top-right corner of a div.
 */
export default function OverdueAlert({ target }: Props): ReactElement {
  const className = target === 'task-card'
    ? styles.OverdueAlertInTaskCard
    : styles.OverdueAlertInFutureView;
  return <div className={className}>!</div>;
}
