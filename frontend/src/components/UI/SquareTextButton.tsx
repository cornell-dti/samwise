import React, { ReactElement } from 'react';
import styles from './SquareButtons.module.scss';

type Props = { readonly text: string; readonly onClick: () => void };

const className = [styles.SquareButton, styles.SquareButtonTextButton].join(' ');

/**
 * The component used to render a text button.
 * @constructor
 */
export default function SquareTextButton({ text, onClick }: Props): ReactElement {
  return (
    <button className={className} title={text} type="button" onClick={onClick}>
      <span className={styles.SquareButtonText}>{text}</span>
    </button>
  );
}
