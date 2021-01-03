import React, { ReactElement } from 'react';
import clsx from 'clsx';
import styles from './ProfileImage.module.scss';

type Props = {
  readonly memberName: string;
  readonly imageURL: string;
  readonly className?: string;
};

const ProfileImage = ({ memberName, imageURL, className }: Props): ReactElement => (
  <img className={clsx(styles.ProfileCircle, className)} src={imageURL} alt={memberName} />
);

export default ProfileImage;
