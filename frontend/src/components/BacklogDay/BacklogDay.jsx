// @flow

import * as React from 'react';
import BacklogTask from './BacklogTask';

/**
 * The type for a simplified task with just enough information needed to render the backlog
 * day component.
 */
type SimpleTask = {| name: string, color: string |};

type Props = {|
  date: Date,
  tasks: Array<SimpleTask>
|}

export default function BacklogDay({ date, tasks }: Props) {
  let dayString: string;
  switch (date.getDay()) {
    case 0:
      dayString = 'SUN';
      break;
    case 1:
      dayString = 'MON';
      break;
    case 2:
      dayString = 'TUE';
      break;
    case 3:
      dayString = 'WED';
      break;
    case 4:
      dayString = 'THU';
      break;
    case 5:
      dayString = 'FRI';
      break;
    case 6:
      dayString = 'SAT';
      break;
    default:
      throw new Error('Impossible Case');
  }
  return (
    <div>
      <div>{dayString}</div>
      <div>{date.getDate()}</div>
      <div>
        {tasks.map(t => <BacklogTask name={t.name} color={t.color} />)}
      </div>
    </div>
  );
}
