import React, { ReactElement } from 'react';
import { GithubPicker } from 'react-color';
import Down from '../../../assets/svgs/v.svg';
import colMap from './ListColors';
import styles from './ColorEditor.css';

type Props = {
  readonly color: string,
  readonly onChange: (color: string) => void;
};

const colArray: string[] = Object.keys(colMap);

export default function ColorEditor({ color, onChange }: Props): ReactElement {
  const [doesShowEditor, setDoesShowEditor] = React.useState(false);

  const toggleEditor = () => setDoesShowEditor(s => !s);
  const onChangeComplete = (e: { hex: string }) => {
    onChange(e.hex);
    setDoesShowEditor(false);
  };

  return (
    <React.Fragment>
      <button type="button" className={styles.ColorEdit} onClick={toggleEditor}>
        {colMap[color.toLowerCase()]}
        <span className={styles.ColorDisplay} style={{ backgroundColor: color }} />
        <Down className={styles.Arrow} />
      </button>
      {doesShowEditor && (
        <div className={styles.ColorPicker}>
          <GithubPicker
            color={color}
            onChangeComplete={onChangeComplete}
            triangle="top-right"
            colors={colArray}
          />
        </div>
      )}
    </React.Fragment>
  );
}
