import React, { ReactElement, useState, ReactNode } from 'react';
import { connect } from 'react-redux';
import styles from './GroupTasksContainer.module.css';
import GroupTask from './GroupTask';
import {
  getFocusViewProps,
  FocusViewTaskMetaData,
  FocusViewProps,
} from '../../../../store/selectors';

type IdOrder = { readonly id: string; readonly order: number };

function renderTaskList(list: IdOrder[], filterCompleted: boolean): ReactNode {
  return list.map(({ id }, index) => (
    <GroupTask key={id} id={id} order={index} filterCompleted={filterCompleted} />
  ));
}

function GroupTasksContainer({ tasks }: FocusViewProps): ReactElement {
  const [localTasks, setLocalTasks] = useState<FocusViewTaskMetaData[]>(tasks);
  if (localTasks !== tasks) {
    setLocalTasks(tasks);
  }
  const localCompletedList: IdOrder[] = [];
  const localUncompletedList: IdOrder[] = [];
  localTasks.forEach(({ id, order, inFocusView, inCompleteFocusView }: FocusViewTaskMetaData) => {
    if (!inFocusView) {
      return;
    }
    const idOrder = { id, order };
    if (inCompleteFocusView) {
      localCompletedList.push(idOrder);
    } else {
      localUncompletedList.push(idOrder);
    }
  });

  return (
    <div className={styles.GroupTasksContainer}>{renderTaskList(localUncompletedList, false)}</div>
  );
}

const Connected = connect(getFocusViewProps)(GroupTasksContainer);
export default Connected;
