import React, { ReactElement } from 'react';
import systemMode, { Mode } from '../../util/mode-util';
import styles from './ModeIndicator.module.scss';

type Props = { readonly mode: Mode };

/**
 * A mode indicator on the top-left corner to indicate whether a page is for DEV, STAGING or PROD.
 */
export const ConfigurableModeIndicator = ({ mode }: Props): ReactElement | null => {
  if (mode === 'PROD') {
    return null;
  }
  return <div className={styles.Indicator}>{mode}</div>;
};

const ModeIndicator = (): ReactElement | null => <ConfigurableModeIndicator mode={systemMode} />;

export default ModeIndicator;
