import React, { ReactElement } from 'react';

type Props = {
  groupName: string;
}

export default ({ groupName }: Props): ReactElement => (
  <p>{groupName}</p>
);
