import React, { ReactElement, Component } from 'react';
import settingStyles from '../Settings/SettingsPage.module.css';
import styles from './CanvasCalendar.module.css';
import { setCanvasCalendar, readCanvasCalendar } from '../../../firebase/actions';

type State = {
  canvasCalendar: string | null;
  linked: boolean;
}

export default class CanvasCalendar extends Component<{}, State> {
  public state: State = {
    canvasCalendar: '',
    linked: readCanvasCalendar() != null,
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ canvasCalendar: e.target.value });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const { canvasCalendar } = this.state;
    if (canvasCalendar !== '') {
      setCanvasCalendar(canvasCalendar);
      this.setState({ linked: true });
    }
  };

  removeCanvasiCal = (): void => {
    setCanvasCalendar(null);
    this.setState({ linked: false });
  };

  calendarState = (): State => {
    const { canvasCalendar, linked } = this.state;
    return { canvasCalendar, linked };
  };

  render(): ReactElement {
    return (
      <div className={settingStyles.SettingsSection}>
        <p className={settingStyles.SettingsSectionTitle}>Canvas Calendar</p>
        <div className={settingStyles.SettingsSectionContent}>

          <div
            style={{ display: !this.calendarState().linked ? 'block' : 'none' }}
          >
            <form
              className={styles.CalendarForm}
              onSubmit={this.handleSubmit}
            >
              <input
                placeholder="Paste your Canvas iCal link here"
                type="text"
                onChange={this.handleChange}
                className={styles.CalendarInput}
              />
            </form>
            <a
              className={styles.HelpButton}
              href="https://community.canvaslms.com/docs/DOC-10691-4212717348"
              title="Link to Canvas iCal guide"
            >
              Having trouble finding the iCal link?
            </a>
          </div>

          <div
            className={settingStyles.SettingsButton}
            style={{
              marginTop: '12px',
              display: this.calendarState().linked ? 'block' : 'none',
            }}
          >
            Your Canvas calendar feed is linked.
            <button
              type="button"
              style={{ marginLeft: '12px' }}
              onClick={this.removeCanvasiCal}
              title="Remove Canvas iCal Link"
            >
              Unlink
            </button>
          </div>
        </div>
      </div>
    );
  }
}
