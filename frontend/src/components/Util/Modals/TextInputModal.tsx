import React, { ReactElement, useState } from 'react';
import Modal from 'react-modal';
import modalStyles from './Modal.module.css';
import textInputModalStyles from './TextInputModal.module.css';

/**
 * The types of input this Modal will support (add more as necessary)
 */
export type TextInputTypes =
  | 'text'
  | 'email'
  | 'number';

export type TextInputModalProps = {
  /**
   * Whether the modal is open.
   */
  readonly open: boolean;
  /**
   * The title displayed along with the input.
   */
  readonly title: string;
  /**
   * Text shown below the title
   */
  readonly subText: string;
  /**
   * The label for the input box.
   */
  readonly label: string;
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

export default ({
  open,
  title,
  subText,
  label,
  submitButtonText,
  inputType,
  onInputSubmit,
  onCancel,
}: TextInputModalProps): ReactElement => {
  const [input, setInput] = useState('');
  return (
    <Modal isOpen={open} className={`${modalStyles.Modal} ${textInputModalStyles.TextInputModal}`} contentLabel="Choice Dialog">
      <div className={textInputModalStyles.Title}>{title}</div>
      <div className={textInputModalStyles.SubText}>{subText}</div>
      <div className={textInputModalStyles.TextInput}>
        {label}
        <input
          type={inputType}
          name="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <div className={textInputModalStyles.ButtonContainer}>
        <button
          type="button"
          className={textInputModalStyles.CancelButton}
          onClick={() => {
            onCancel();
            setInput('');
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className={textInputModalStyles.SubmitButton}
          onClick={() => {
            onInputSubmit(input);
            setInput('');
          }}
        >
          {submitButtonText}
        </button>
      </div>
    </Modal>
  );
};
