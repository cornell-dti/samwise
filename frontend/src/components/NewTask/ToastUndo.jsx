// @flow strict

import React from 'react';
import type { Node } from 'react';
import { toast } from 'react-toastify';

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
    <span>
      {dispText}
      {' '}
      <button type="button" onClick={changeCallback}>Undo</button>
    </span>
  );
}

/**
 * Emit am UNDO toast.
 *
 * @param {string} toastId id of the toast.
 * @param {string} text the text to be displayed on the toast.
 * @param {function(SyntheticMouseEvent<HTMLButtonElement>): void} onUndo the function to
 * be called when the undo button is clicked.
 */
export function emitToast(
  toastId: string,
  text: string,
  onUndo: (SyntheticMouseEvent<HTMLButtonElement>) => void,
): void {
  toast.success((<ToastUndo dispText={text} changeCallback={onUndo} />), {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    toastId,
  });
}
