// @flow strict

import React from 'react';
import type { Node } from 'react';
import styles from './SquareButtons.css';

type Props = {| +text: string; +onClick: () => void |};

/**
 * The class name used for the component.
 * @type {string}
 */
const className = `${styles.SquareButton} ${styles.SquareButtonTextButton}`;

/**
 * The component used to render a text toggle button.
 *
 * @param {string} text text inside the button.
 * @param {function(): void} onClick the function when clicked.
 * @return {Node} the rendered component.
 * @constructor
 */
export default function SquareTextButton({ text, onClick }: Props): Node {
  return (
    <button className={className} type="button" onClick={onClick}>
      <span className={styles.SquareButtonText}>{text}</span>
    </button>
  );
}
