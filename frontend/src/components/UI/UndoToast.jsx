// @flow strict

import React from 'react';
import type { Node } from 'react';
import { toast } from 'react-toastify';
import styles from './UndoToast.css';

type Props = {|
  +toastId: string;
  +message: string;
  +onUndo: () => void;
|};

type Config = {| ...Props; +onDismiss: () => void; |};

/**
 * The component for the undo toast.
 */
function UndoToast(props: Props): Node {
  const { toastId, message, onUndo } = props;
  const handleToastClick = (e: SyntheticMouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (e.target instanceof HTMLButtonElement) {
      onUndo();
      toast.dismiss(toastId);
    } else {
      toast.dismiss(toastId);
    }
  };
  return (
    <span role="presentation" className={styles.UndoToast} onClick={handleToastClick}>
      {message}
      <span className={styles.UndoToastPadding} />
      <button type="button" className={styles.UndoToastButton}>Undo</button>
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
  }: Config,
): void {
  const props = { toastId, message, onUndo };
  toast.success((<UndoToast {...props} />), {
    toastId,
    position: 'top-right',
    autoClose: 5000,
    closeOnClick: false,
    onClose: onDismiss,
    closeButton: false,
    hideProgressBar: true,
    draggable: false,
  });
}
