import React, { ReactElement } from 'react';
import { Icon, SemanticICONS } from 'semantic-ui-react';
import styles from './SquareButtons.css';

type Props = {
  readonly active: boolean;
  readonly iconNames: [SemanticICONS, SemanticICONS];
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
    <button className={className} type="button" onClick={onToggle}>
      <Icon className={styles.SquareButtonText} name={active ? activeIconName : inactiveIconName} />
    </button>
  );
}
