import React, { ReactElement } from 'react';
import styles from './ProfileImage.module.scss';

type Props = {
  readonly memberName: string;
  readonly imageURL: string;
  readonly className?: string;
};

const ProfileImage = ({ memberName, imageURL, className }: Props): ReactElement => {
  return (
    <img
      className={className != null ? `${styles.ProfileCircle} ${className}` : styles.ProfileCircle}
      src={imageURL}
      alt={memberName}
    />
  );
};

export default ProfileImage;
