import React, { ReactElement } from 'react';
import { GithubPicker } from 'react-color';
import colMap from './ListColors';
import styles from './ColorEditor.module.css';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = {
  readonly color: string;
  readonly onChange: (color: string) => void;
};

const colArray: string[] = Object.keys(colMap);

export default function ColorEditor({ color, onChange }: Props): ReactElement {
  const [doesShowEditor, setDoesShowEditor] = React.useState(false);

  const toggleEditor = (): void => setDoesShowEditor((s) => !s);
  const onChangeComplete = (e: { hex: string }): void => {
    onChange(e.hex);
    setDoesShowEditor(false);
  };

  return (
    <>
      <button type="button" className={styles.ColorEdit} onClick={toggleEditor} tabIndex={0}>
        {colMap[color.toLowerCase()]}
        <span className={styles.ColorDisplay} style={{ backgroundColor: color }} />
        <SamwiseIcon iconName="dropdown" className={styles.Arrow} />
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
    </>
  );
}
