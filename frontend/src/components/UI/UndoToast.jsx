// @flow strict

import React from 'react';
import type { Node } from 'react';
import { toast } from 'react-toastify';

type Props = {|
  +message: string;
  +onUndo: () => void;
  +onDismiss: () => void;
|};

/**
 * The component for the undo toast.
 *
 * @param {string} message the message to be displayed on the toast.
 * @param {function(): void} onUndo the function to be called when the undo button is clicked.
 * @param {function(): void} onDismiss the function to be called when the toast is dismissed.
 * @return {Node} the rendered UNDO toast.
 * @constructor
 */
function UndoToast({ message, onUndo, onDismiss }: Props): Node {
  const spanClickHandler = (e: SyntheticMouseEvent<HTMLSpanElement>): void => {
    if (e.target instanceof HTMLButtonElement) {
      return;
    }
    onDismiss();
  };
  return (
    <span role="button" tabIndex={-1} onClick={spanClickHandler} onKeyDown={() => {}}>
      {message}
      {' '}
      <button type="button" onClick={onUndo}>Undo</button>
    </span>
  );
}

/**
 * Emit am UNDO toast.
 *
 * @param {string} toastId id of the toast.
 * @param {string} message the message to be displayed on the toast.
 * @param {function(): void} onUndo the function to be called when the undo button is clicked.
 * @param {function(): void} onDismiss the function to be called when the toast is dismissed.
 */
export default function emitToast(
  toastId: string,
  message: string,
  onUndo: () => void,
  onDismiss: () => void,
): void {
  toast.success((<UndoToast message={message} onUndo={onUndo} onDismiss={onDismiss} />), {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    draggable: false,
    toastId,
  });
}
