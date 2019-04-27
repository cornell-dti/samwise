import React, { ReactElement, useState, useEffect } from 'react';
import Modal from 'react-modal';
import ChoiceModal, { ChoiceObj, ChoiceModalProps } from './ChoiceModal';

export function initModal(): void {
  Modal.setAppElement('#main');
}

const dummyChoiceModalProps: ChoiceModalProps<ChoiceObj> = {
  open: false, message: '', choices: {}, onChoicePick: () => { },
};

let currentChoiceModalSetter: (props: ChoiceModalProps<ChoiceObj>) => void = (): void => { };

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

export function ModalsContainer(): ReactElement {
  const [choiceModalProps, setChoiceModalProps] = useState(dummyChoiceModalProps);
  useEffect(() => {
    // register modal setter
    currentChoiceModalSetter = setChoiceModalProps;
  });
  return (
    <>
      <ChoiceModal {...choiceModalProps} />
    </>
  );
}
