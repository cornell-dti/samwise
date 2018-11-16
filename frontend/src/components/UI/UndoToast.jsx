// @flow strict

import React from 'react';
import type { Node } from 'react';
import { toast } from 'react-toastify';

export type Props = {|
  +toastId: string;
  +message: string;
  +onUndo: () => void;
  +onDismiss: () => void;
|};

/**
 * The component for the undo toast.
 *
 * @param {Props} props all the props.
 * @return {Node} the rendered UNDO toast.
 * @constructor
 */
function UndoToast(props: Props): Node {
  const {
    toastId, message, onUndo, onDismiss,
  } = props;
  const handleUndo = () => {
    onUndo();
    toast.dismiss(toastId);
  };
  const handleDismiss = () => {
    onDismiss();
    toast.dismiss(toastId);
  };
  return (
    <span>
      {message}
      {' '}
      <button type="button" onClick={handleUndo}>Undo</button>
      <button type="button" onClick={handleDismiss}>Dismiss</button>
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
  {
    toastId, message, onUndo, onDismiss,
  }: Props,
): void {
  const props = {
    toastId, message, onUndo, onDismiss,
  };
  toast.success((<UndoToast {...props} />), {
    toastId,
    position: 'top-right',
    autoClose: 5000,
    closeOnClick: false,
    closeButton: false,
    hideProgressBar: true,
    draggable: false,
  });
}
