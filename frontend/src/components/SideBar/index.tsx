import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GroupIcon from './GroupIcon';
import styles from './index.module.scss';

type Props = {
  groups: string[];
}

export default ({ groups }: Props): ReactElement => (
  <div className={styles.SideBar}>
    <SamwiseIcon iconName="personal-view" />
    {
      groups.map((g) => (<GroupIcon group={g} />))
    }
    <span>
      <FontAwesomeIcon icon={faPlus} className={styles.PlusIcon} />
    </span>
  </div>
);
