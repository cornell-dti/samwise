import React, { ReactElement } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { IconLookup } from '@fortawesome/fontawesome-svg-core';
import styles from './SquareButtons.module.scss';

type Props = {
  readonly active: boolean;
  readonly iconNames: [IconLookup, IconLookup];
  readonly onToggle: () => void;
};

/**
 * The component used to render a minimalist icon button.
 *
 * @param {boolean} active whether the button is in active state.
 * @param {[string, string]} iconNames the pair of active icon name and inactive one.
 * @param {function(): void} onToggle handle when the value is toggled.
 * @return {Node} the rendered node.
 * @constructor
 */
export default function SquareIconToggle({ active, iconNames, onToggle }: Props): ReactElement {
  const [activeIconName, inactiveIconName] = iconNames;
  const className = active
    ? `${styles.SquareButton} ${styles.SquareButtonIconButton}`
    : `${styles.SquareButton} ${styles.SquareButtonIconButton} ${styles.active}`;
  return (
    <button className={className} title="eye" type="button" onClick={onToggle}>
      <Icon
        className={styles.SquareButtonText}
        icon={active ? activeIconName : inactiveIconName}
      />
    </button>
  );
}
