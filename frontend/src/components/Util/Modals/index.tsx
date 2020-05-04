import React, { ReactElement, useState, useEffect } from 'react';
import Modal from 'react-modal';
import ChoiceModal, { ChoiceObj, ChoiceModalProps } from './ChoiceModal';
import TextInputModal, { TextInputModalProps, TextInputTypes } from './TextInputModal';

export function initModal(): void {
  Modal.setAppElement('#root');
}

const dummyChoiceModalProps: ChoiceModalProps<ChoiceObj> = {
  open: false, message: '', choices: {}, onChoicePick: () => { },
};
const dummyTextInputModalProps: TextInputModalProps = {
  open: false,
  title: '',
  subText: '',
  label: '',
  submitButtonText: 'Submit',
  inputType: 'text',
  onCancel: () => { },
  onInputSubmit: () => { },
};

type ModalProps = ChoiceModalProps<ChoiceObj> | TextInputModalProps;

let currentChoiceModalSetter: (props: ChoiceModalProps<ChoiceObj>) => void = (): void => { };
let currentTextInputModalSetter: (props: TextInputModalProps) => void = (): void => { };

export async function promptChoice<Choices extends ChoiceObj>(
  message: string,
  choices: Choices,
): Promise<keyof Choices> {
  return new Promise<keyof Choices>((onChoicePick) => {
    const choiceModalProps: ChoiceModalProps<Choices> = {
      open: true,
      message,
      choices,
      onChoicePick: (pickedChoice: keyof Choices) => {
        onChoicePick(pickedChoice);
        // close the modal
        currentChoiceModalSetter(dummyChoiceModalProps);
      },
    };
    currentChoiceModalSetter(choiceModalProps);
  });
}

const confirmCancelChoices = { CANCEL: 'Cancel', CONFIRM: 'Confirm' };

export async function promptConfirm(message: string): Promise<boolean> {
  const result = await promptChoice(message, confirmCancelChoices);
  return result === 'CONFIRM';
}

const ChoiceModalWrapper = (): React.ReactElement => {
  const [choiceModalProps, setChoiceModalProps] = useState(dummyChoiceModalProps);
  const { open, message, choices, onChoicePick } = choiceModalProps;
  useEffect(() => {
    // register modal setter
    currentChoiceModalSetter = setChoiceModalProps;
  }, []);
  return (
    <ChoiceModal open={open} message={message} choices={choices} onChoicePick={onChoicePick} />
  );
};

export const promptTextInput = async (
  title: string,
  subText: string,
  label: string,
  submitButtonText: string,
  inputType: TextInputTypes,
): Promise<string> => (
  new Promise<string>((onInputSubmit) => {
    const textInputModalProps: TextInputModalProps = {
      open: true,
      title,
      subText,
      label,
      submitButtonText,
      inputType,
      onInputSubmit: (input: string) => {
        onInputSubmit(input);
        // close the modal
        currentTextInputModalSetter(dummyTextInputModalProps);
      },
      onCancel: () => {
        // close the modal
        currentTextInputModalSetter(dummyTextInputModalProps);
      },
    };
    currentTextInputModalSetter(textInputModalProps);
  })
);

const TextInputModalWrapper = (): React.ReactElement => {
  const [textInputModalProps, setTextInputModalProps] = useState(dummyTextInputModalProps);
  const {
    open,
    title,
    subText,
    label,
    submitButtonText,
    inputType,
    onInputSubmit,
    onCancel,
  } = textInputModalProps;
  useEffect(() => {
    // register modal setter
    currentTextInputModalSetter = setTextInputModalProps;
  }, []);
  return (
    <TextInputModal
      open={open}
      title={title}
      subText={subText}
      label={label}
      submitButtonText={submitButtonText}
      inputType={inputType}
      onInputSubmit={onInputSubmit}
      onCancel={onCancel}
    />
  );
};

export const ModalsContainer = (): ReactElement => (
  <div>
    <ChoiceModalWrapper />
    <TextInputModalWrapper />
  </div>
);
