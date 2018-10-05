import * as React from 'react';
import { connect } from 'react-redux';
import type { OneDayTask, SimpleTask } from './types';
import BacklogDay from './BacklogDay';
import type { State, Task } from '../../store/store-types';
import styles from './Backlog.css';

const mapStateToProps = (state: State) => {
  const days: OneDayTask[] = [];
  const aMonthLater = new Date();
  aMonthLater.setDate(aMonthLater.getDate() + 30);
  for (let d = new Date(); d <= aMonthLater; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const tasks: SimpleTask[] = state.mainTaskArray
      .filter((task: Task) => {
        const tDate = task.date;
        return tDate.getFullYear() === date.getFullYear()
          && tDate.getMonth() === date.getMonth() && tDate.getDate() === date.getDate();
      })
      .map(({ name, tag }: Task) => ({ name, color: state.tagColorPicker[tag] }));
    days.push({ date, tasks });
  }
  return { days };
};

type Props = {| days: OneDayTask[] |};

function Backlog({ days }: Props) {
  const renderDay = (day: OneDayTask) => (
    <BacklogDay key={day.date.toDateString()} {...day} />
  );
  return <div className={styles.Backlog}>{days.map(renderDay)}</div>;
}

export default connect(mapStateToProps, null)(Backlog);
