import React, { ReactElement, Component } from 'react';
import settingStyles from '../Settings/SettingsPage.module.css';
import styles from './CanvasCalendar.module.css';
import { setCanvasCalendar } from '../../../firebase/actions';

type Props = { readonly linked: boolean }

type State = { canvasCalendar: string | null }

export default class CanvasCalendar extends Component<Props, State> {
  public state: State = { canvasCalendar: '' };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ canvasCalendar: e.target.value });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const { canvasCalendar } = this.state;
    if (canvasCalendar !== '') { setCanvasCalendar(canvasCalendar); }
  };

  removeCanvasiCal = (): void => {
    setCanvasCalendar(null);
  };

  render(): ReactElement {
    const { linked } = this.props;

    return (
      <div className={settingStyles.SettingsSection}>
        <p className={settingStyles.SettingsSectionTitle}>Canvas Calendar</p>
        <div className={settingStyles.SettingsSectionContent}>

          <div style={{ display: !linked ? 'block' : 'none' }}>
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
              display: linked ? 'block' : 'none',
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
