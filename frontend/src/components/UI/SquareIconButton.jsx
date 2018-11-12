// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './SquareButtons.css';

type Props = {|
  +active: boolean;
  +activeIconName: string;
  +inactiveIconName: string;
  +onClick: () => any;
|};

/**
 * The component used to render a minimalist icon button.
 *
 * @param {Props} props all the props.
 * @return {Node} the rendered node.
 * @constructor
 */
export default function SquareIconButton(props: Props): Node {
  const {
    active, activeIconName, inactiveIconName, onClick,
  } = props;
  const className = active
    ? `${styles.SquareButton} ${styles.SquareButtonIconButton}`
    : `${styles.SquareButton} ${styles.SquareButtonIconButton} ${styles.active}`;
  return (
    <button className={className} type="button" onClick={onClick}>
      <Icon
        className={styles.SquareButtonText}
        name={active ? activeIconName : inactiveIconName}
      />
    </button>
  );
}
