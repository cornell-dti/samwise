import React, { ReactElement, useState } from 'react';
import Modal from 'react-modal';
import styles from './Modal.module.css';

/**
 * The types of input this Modal will support (add more as necessary)
 */
export type TextInputTypes =
  | 'text'
  | 'email'
  | 'number';

/**
 * The type parameter Choice must be an object with predefined set of string keys and string values.
 */
export type TextInputModalProps = {
  /**
   * Whether the modal is open.
   */
  readonly open: boolean;
  /**
   * The message displayed along with the input.
   */
  readonly message: string;
  /**
   * The text displayed on the submit button.
   */
  readonly submitButtonText: string;
  /**
   * The text input type.
   */
  readonly inputType: TextInputTypes;
  /**
   * The function called when a input is submitted.
   */
  readonly onInputSubmit: (input: string) => void;
  /**
   * The function called when a input is submitted.
   */
  readonly onCancel: () => void;
}

export default (
  { open, message, submitButtonText, inputType, onInputSubmit, onCancel }: TextInputModalProps,
): ReactElement => {
  const [input, setInput] = useState('');
  return (
    <Modal isOpen={open} className={styles.ChoiceModal} contentLabel="Choice Dialog">
      <div className={styles.TextContainer}>{message}</div>
      <input
        type={inputType}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className={styles.ButtonContainer}>
        <span className={styles.Filler} />
        <button
          type="button"
          className={styles.ChoiceButton}
          onClick={() => onCancel()}
        >
          Cancel
        </button>
        <button
          type="button"
          className={styles.ChoiceButton}
          onClick={() => onInputSubmit(input)}
        >
          {submitButtonText}
        </button>
      </div>
    </Modal>
  );
}
