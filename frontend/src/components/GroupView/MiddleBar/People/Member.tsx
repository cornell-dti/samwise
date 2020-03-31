import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';

type Props = {
  memberName: string;
}

export default ({ memberName }: Props): ReactElement => {
  const initials = `${memberName.split(' ')[0].charAt(0)}${memberName.split(' ')[1].charAt(0)}`;
  return (
    <div>
      <div>{initials}</div>
      <div>{memberName}</div>
      <SamwiseIcon iconName="poke" />
      <SamwiseIcon iconName="hug" />
    </div>
  );
}
