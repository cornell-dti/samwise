import React, { ReactElement, useState } from 'react';
import { connect } from 'react-redux';
import { Settings, State } from 'common/lib/types/store-types';
import settingStyles from '../Settings/SettingsPage.module.css';
import styles from './CanvasCalendar.module.css';
import { setCanvasCalendar } from '../../../firebase/actions';

type Props = { readonly settings: Settings }

function CanvasCalendar({ settings }: Props): ReactElement {
  const { canvasCalendar } = settings;
  const linked = canvasCalendar != null;
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const iCalLink = input;
    setCanvasCalendar(iCalLink);
  };

  const removeCanvasiCal = (): void => {
    setCanvasCalendar(null);
  };

  return (
    <div className={settingStyles.SettingsSection}>
      <p className={settingStyles.SettingsSectionTitle}>Canvas Calendar</p>
      <div className={settingStyles.SettingsSectionContent}>

        <div style={{ display: !linked ? 'block' : 'none' }}>
          <form
            className={[styles.CalendarForm, settingStyles.SettingsButton].join(' ')}
            onSubmit={handleSubmit}
          >
            <input
              placeholder="Paste your Canvas iCal link here"
              type="text"
              className={styles.CalendarInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" title="Link Canvas iCal"> Save </button>
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
          style={{ display: linked ? 'block' : 'none' }}
        >
          <p style={{ wordBreak: 'break-all' }}>
            Your Canvas calendar feed is linked.
            <br />
            {canvasCalendar}
          </p>
          <button
            type="button"
            onClick={removeCanvasiCal}
            title="Remove Canvas iCal Link"
          >
            Unlink
          </button>
        </div>
      </div>
    </div>
  );
}

const Connected = connect(({ settings }: State) => ({ settings }))(CanvasCalendar);
export default Connected;
