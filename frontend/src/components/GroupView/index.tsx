import React, { ReactElement } from 'react';
import MiddleBar from './MiddleBar';

type Props = {
  groupName: string;
}

export default ({ groupName }: Props): ReactElement => (
  <MiddleBar />
);
