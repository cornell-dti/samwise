// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Icon, Input } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import type { State as StoreState, TagColorConfig } from '../../store/store-types';
import styles from './FloatingTaskEditor.css';
// $FlowFixMe FIXME
import ClassPicker from '../ClassPicker/ClassPicker';
import CheckBox from '../UI/CheckBox';
import { simpleConnect } from '../../store/react-redux-util';
import type { SimpleMainTask } from './floating-task-editor-types';

type OwnProps = {|
  ...SimpleMainTask;
  +editTask: (task: SimpleMainTask, color?: string) => void;
|};

type SubscribedProps = {| tagColorPicker: TagColorConfig; |};

type Props = {|
  ...OwnProps;
  ...SubscribedProps;
|};

type State = {|
  ...SimpleMainTask;
  doesShowTagEditor: boolean;
  doesShowCalendarEditor: boolean;
|};

const mapStateToProps = ({ tagColorPicker }: StoreState): SubscribedProps => ({ tagColorPicker });

/**
 * InternalMainTaskFloatingEditor is intended for internal use for FloatingTaskEditor only.
 */
class InternalMainTaskFloatingEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { editTask, tagColorPicker, ...task } = props;
    this.state = { ...task, doesShowTagEditor: false, doesShowCalendarEditor: false };
  }

  getTask = (state: State): SimpleMainTask => {
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

  editComplete() {
    const { editTask } = this.props;
    this.setState((state: State) => {
      const newState = { ...state, complete: !state.complete };
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

  /**
   * Return the rendered header element.
   */
  renderHeader(): Node {
    const { tagColorPicker } = this.props;
    const {
      tag, date, doesShowTagEditor, doesShowCalendarEditor,
    } = this.state;
    const headerClassNames = `${styles.FloatingTaskEditorFlexibleContainer} ${styles.FloatingTaskEditorHeader}`;
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
    return (
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
    );
  }

  /**
   * Return the rendered main task text editor element.
   */
  renderMainTaskEdit(): Node {
    const { name, complete } = this.state;
    return (
      <div className={styles.FloatingTaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.FloatingTaskEditorCheckBox}
          checked={complete}
          onChange={() => this.editComplete()}
        />
        <Input
          className={styles.FloatingTaskEditorFlexibleInput}
          placeholder="Main Task"
          value={name}
          onChange={event => this.editTaskName(event)}
        />
      </div>
    );
  }

  render(): Node {
    return (
      <div>
        {this.renderHeader()}
        {this.renderMainTaskEdit()}
      </div>
    );
  }
}

const ConnectedInternalMainTaskFloatingEditor = simpleConnect<Props, OwnProps, SubscribedProps>(
  mapStateToProps,
)(InternalMainTaskFloatingEditor);
export default ConnectedInternalMainTaskFloatingEditor;
