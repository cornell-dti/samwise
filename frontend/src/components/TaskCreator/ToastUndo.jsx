// @flow strict

import React from 'react';
import type { Node } from 'react';
import styles from './UndoBtn.css';

type Props = {|
  +dispText: string;
  +changeCallback: (SyntheticMouseEvent<HTMLButtonElement>) => void
|};

/**
 * The component for the undo toast.
 *
 * @param {string} dispText the text to be displayed on the toast.
 * @param {function(SyntheticMouseEvent<HTMLButtonElement>): void} changeCallback the function to
 * be called when the undo button is clicked.
 * @return {Node} the rendered UNDO toast.
 * @constructor
 */
export default function ToastUndo({ dispText, changeCallback }: Props): Node {
  return (
    <span className={styles.Wrap}>
      {dispText}
      {' '}
      <button type="button" onClick={changeCallback} className={styles.Main}>Undo</button>
    </span>
  );
}
