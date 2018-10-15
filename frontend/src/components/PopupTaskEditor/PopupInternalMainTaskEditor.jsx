// @flow

import * as React from 'react';
import { Header, Icon, Input } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import connect from 'react-redux/es/connect/connect';
import type {
  State as StoreState, TagColorConfig, Task,
} from '../../store/store-types';
import styles from './PopupTaskEditor.css';
import NewTaskClassPicker from '../NewTask/NewTaskClassPicker';

const mapStateToProps = ({ tagColorPicker }: StoreState): {| tagColorPicker: TagColorConfig |} => ({
  tagColorPicker,
});

type Props = {|
  ...Task;
  tagColorPicker: TagColorConfig;
  +editTask: (task: Task) => void;
|};
type State = {|
  ...Task;
  doesShowTagEditor: boolean;
  doesShowCalendarEditor: boolean;
|};

/**
 * PopupInternalMainTaskEditor is intended for internal use for PopupTaskEditor only.
 */
class PopupInternalMainTaskEditor extends React.Component<Props, State> {
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

  editTaskTag(event: any) {
    const tag = event.target.getAttribute('data-class-title');
    const { editTask } = this.props;
    this.setState((state: State) => {
      const newState = { ...state, tag, doesShowTagEditor: false };
      editTask(this.getTask(newState));
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

  render() {
    const { tagColorPicker } = this.props;
    const {
      name, tag, date, doesShowTagEditor, doesShowCalendarEditor,
    } = this.state;
    const tagPickerElementOpt = doesShowTagEditor && (
      <div className={styles.PopupTaskEditorTagEditor}>
        <ul>
          {
            Object.keys(tagColorPicker).map(oneTag => (
              <NewTaskClassPicker
                key={oneTag}
                classColor={tagColorPicker[oneTag]}
                classTitle={oneTag}
                changeCallback={e => this.editTaskTag(e)}
              />))
          }
        </ul>
      </div>
    );
    const calendarElementOpt = doesShowCalendarEditor && (
      <Calendar
        value={date}
        className={styles.PopupTaskEditorCalendar}
        onChange={e => this.editTaskDate(e)}
      />
    );
    return (
      <Header className={styles.PopupTaskEditorFlexibleContainer}>
        <span style={{ marginRight: '0.5em' }}>Main Task: </span>
        <Input
          className={styles.PopupTaskEditorFlexibleInput}
          placeholder="Main Task"
          value={name}
          onChange={event => this.editTaskName(event)}
        />
        <span className={styles.PopupTaskEditorTag}>
          <label
            htmlFor="popup-task-tag-editor-checkbox"
            className={styles.PopupTaskEditorTagLabel}
            style={{ backgroundColor: tagColorPicker[tag] }}
          >
            <input id="popup-task-tag-editor-checkbox" type="checkbox" />
            {tag}
          </label>
        </span>
        <Icon
          name="tag"
          className={styles.PopupTaskEditorIconButton}
          onClick={() => this.toggleTagEditor()}
        />
        <Icon
          name="calendar"
          className={styles.PopupTaskEditorIconButton}
          onClick={() => this.toggleDateEditor()}
        />
        {tagPickerElementOpt}
        {calendarElementOpt}
      </Header>
    );
  }
}

const ConnectedPopupInternalMainTaskEditor = connect(
  mapStateToProps, null,
)(PopupInternalMainTaskEditor);
export default ConnectedPopupInternalMainTaskEditor;
