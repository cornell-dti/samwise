// @flow

import * as React from 'react';
import {
  Header, Input, Icon, Modal,
} from 'semantic-ui-react';
import type { SubTask, Task } from '../../store/store-types';
import styles from './PopupTaskEditor.css';

type Props = Task;
type State = Task;

export default class PopupTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...props };
  }

  render() {
    const {
      name, id, tag, date, subtaskArray,
    } = this.state;
    return (
      <div id={id}>
        <Header className={styles.flexibleContainer}>
          <span style={{ marginRight: '0.5em' }}>Main Task: </span>
          <Input className={styles.flexibleInput} placeholder="Main Task" value={name} />
          <Icon name="tag" style={{ marginLeft: '0.5em' }} />
          <Icon name="calendar" style={{ marginLeft: '0.5em' }} />
        </Header>
        <Modal.Description>
          <div>Sub-tasks:</div>
          <div>
            {
              subtaskArray.map((subTask: SubTask) => (
                <div className={styles.flexibleContainer}>
                  <Input
                    id={subTask.id}
                    className={styles.flexibleInput}
                    placeholder="Your Sub-Task"
                    value={subTask.name}
                  />
                  <Icon name="close" />
                </div>
              ))
            }
            <div className={styles.flexibleContainer}>
              <Input className={styles.flexibleInput} placeholder="Your New Sub-Task" />
              <Icon name="close" />
            </div>
          </div>
        </Modal.Description>
      </div>
    );
  }
}
