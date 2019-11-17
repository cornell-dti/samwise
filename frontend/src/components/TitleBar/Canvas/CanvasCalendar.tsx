import React, { ReactElement, Component } from 'react';
import styles from '../Settings/SettingsPage.module.css';
import { settingsCollection } from '../../../firebase/db';
import { getAppUser } from '../../../firebase/auth-util';

type State = {
  canvasCalendar: string;
  linked: boolean;
}

export default class CanvasCalendar extends Component<{}, State> {
  public state: State = {
    canvasCalendar: '',
    linked: false,
  };

  componentWillMount(): void {
    const self = this;
    settingsCollection().doc(getAppUser().email)
      .get().then((doc) => {
        const userSettings = doc.data();
        if (userSettings) {
          self.setState({ linked: !(userSettings.canvasCalendar === null) });
        }
      });
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ canvasCalendar: e.target.value });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const self = this;
    settingsCollection().doc(getAppUser().email)
      .update({ canvasCalendar: this.state.canvasCalendar })
      .then(() => {
        self.setState({ linked: true });
      });
  };

  removeCanvasiCal = (): void => {
    const self = this;
    settingsCollection().doc(getAppUser().email)
      .update({ canvasCalendar: null })
      .then(() => {
        self.setState({ linked: false });
      });
  };

  render(): ReactElement {
    return (
      <div>
        <div style={{ display: !this.state.linked ? 'block' : 'none' }}>
          <form onSubmit={this.handleSubmit}>
            <label>
              Canvas Calendar Feed:
              <input type="text" onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>

        <div
          style={{ display: this.state.linked ? 'block' : 'none' }}
          className={styles.SettingsButton}
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
    );
  }
}
