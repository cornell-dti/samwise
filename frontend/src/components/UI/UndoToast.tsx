import React, { MouseEvent, ReactElement } from 'react';
import { toast } from 'react-toastify';
import styles from './UndoToast.css';

type Props = {
  readonly toastId: string;
  readonly message: string;
  readonly onUndo: () => void;
};

type Config = Props & { readonly onDismiss: () => void };

/**
 * The component for the undo toast.
 */
function UndoToast({ toastId, message, onUndo }: Props): ReactElement {
  const handleToastClick = (e: MouseEvent<HTMLSpanElement>) => {
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
export default function emitToast({ toastId, message, onUndo, onDismiss }: Config): void {
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
