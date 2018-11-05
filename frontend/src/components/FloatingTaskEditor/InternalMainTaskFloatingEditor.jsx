// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Icon, Input } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import connect from 'react-redux/es/connect/connect';
import type {
  State as StoreState, TagColorConfig, Task,
} from '../../store/store-types';
import styles from './FloatingTaskEditor.css';
import ClassPicker from '../ClassPicker/ClassPicker';

type Props = {|
  ...Task;
  tagColorPicker: TagColorConfig;
  +editTask: (task: Task, color?: string) => void;
|};
type State = {|
  ...Task;
  doesShowTagEditor: boolean;
  doesShowCalendarEditor: boolean;
|};

const mapStateToProps = ({ tagColorPicker }: StoreState) => ({ tagColorPicker });

/**
 * InternalMainTaskFloatingEditor is intended for internal use for FloatingTaskEditor only.
 */
class InternalMainTaskFloatingEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { editTask, tagColorPicker, ...task } = props;
    this.state = { ...task, doesShowTagEditor: false, doesShowCalendarEditor: false };
  }

  getTask = (state: State): Task => {
    const { doesShowTagEditor, doesShowCalendarEditor, ...task } = state;
    return task;
  };

  editTaskName(event: any) {
    event.preventDefault();
    const name = event.target.value;
    const { editTask } = this.props;
    this.setState((state: State) => {
      const newState = { ...state, name };
      editTask(this.getTask(newState));
      return newState;
    });
  }

  toggleTagEditor() {
    this.setState((state: State) => ({
      ...state, doesShowTagEditor: !state.doesShowTagEditor,
    }));
  }

  editTaskTag(tag: string) {
    const { editTask, tagColorPicker } = this.props;
    this.setState((state: State) => {
      const newState = { ...state, tag, doesShowTagEditor: false };
      editTask(this.getTask(newState), tagColorPicker[tag]);
      return newState;
    });
  }

  toggleDateEditor() {
    this.setState((state: State) => ({
      ...state, doesShowCalendarEditor: !state.doesShowCalendarEditor,
    }));
  }

  editTaskDate(dateString: string) {
    const date = new Date(dateString);
    const { editTask } = this.props;
    this.setState((state: State) => {
      const newState = { ...state, date, doesShowCalendarEditor: false };
      editTask(this.getTask(newState));
      return newState;
    });
  }

  render(): Node {
    const { tagColorPicker } = this.props;
    const {
      name, tag, date, doesShowTagEditor, doesShowCalendarEditor,
    } = this.state;
    const tagPickerElementOpt = doesShowTagEditor && (
      <div className={styles.FloatingTaskEditorTagEditor}>
        <ClassPicker onTagChange={t => this.editTaskTag(t)} />
      </div>
    );
    const calendarElementOpt = doesShowCalendarEditor && (
      <Calendar
        value={date}
        className={styles.FloatingTaskEditorCalendar}
        minDate={new Date()}
        onChange={e => this.editTaskDate(e)}
      />
    );
    const headerClassNames = `${styles.FloatingTaskEditorFlexibleContainer
    } ${styles.FloatingTaskEditorHeader}`;
    return (
      <div>
        <div className={headerClassNames}>
          <span className={styles.FloatingTaskEditorTag}>
            <label
              htmlFor="floating-task-tag-editor-checkbox"
              className={styles.FloatingTaskEditorTagLabel}
              style={{ backgroundColor: tagColorPicker[tag] }}
            >
              <input id="floating-task-tag-editor-checkbox" type="checkbox" />
              {tag}
            </label>
          </span>
          <span className={styles.FloatingTaskEditorFlexiblePadding} />
          <Icon
            name="tag"
            className={styles.FloatingTaskEditorIconButton}
            onClick={() => this.toggleTagEditor()}
          />
          <Icon
            name="calendar"
            className={styles.FloatingTaskEditorIconButton}
            onClick={() => this.toggleDateEditor()}
          />
          {tagPickerElementOpt}
          {calendarElementOpt}
        </div>
        <span style={{ marginRight: '0.5em' }}>Main Task: </span>
        <Input
          className={styles.FloatingTaskEditorFlexiblePadding}
          placeholder="Main Task"
          value={name}
          onChange={event => this.editTaskName(event)}
        />
      </div>
    );
  }
}

const ConnectedInternalMainTaskFloatingEditor = connect(
  mapStateToProps, null,
)(InternalMainTaskFloatingEditor);
export default ConnectedInternalMainTaskFloatingEditor;
