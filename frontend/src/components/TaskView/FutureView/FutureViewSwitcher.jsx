// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { FutureViewDisplayOption } from './future-view-types';
import styles from './FutureViewHeaderButtons.css';

type Props = {|
  +nDays: number;
  +displayOption: FutureViewDisplayOption;
  +onChange: (option: FutureViewDisplayOption) => void;
|};

/**
 * The component used to render a switcher for different backlog views.
 *
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewDisplayOption} displayOption current display option.
 * @param {function(FutureViewDisplayOption): void} onChange called when the future view changes.
 * @return {Node} the rendered component.
 * @constructor
 */
export default function FutureViewSwitcher({ nDays, displayOption, onChange }: Props): Node {
  const setDisplayOption = newDisplayOption => () => { onChange(newDisplayOption); };
  const renderButton = (option: FutureViewDisplayOption, text: string) => {
    const className = displayOption === option
      ? `${styles.ViewSwitcherButton} ${styles.ViewSwitcherActiveButton}`
      : styles.ViewSwitcherButton;
    return (
      <button
        className={className}
        type="button"
        onClick={setDisplayOption(option)}
      >
        <span className={styles.ViewSwitcherButtonText}>{text}</span>
      </button>
    );
  };
  return (
    <div className={styles.ViewSwitcher}>
      {renderButton('N_DAYS', `${nDays}D`)}
      {renderButton('BIWEEKLY', '2W')}
      {renderButton('MONTHLY', 'M')}
    </div>
  );
}
