import React, { ReactElement, useState, SyntheticEvent, ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import styles from './LimitSelector.module.css';

type Props = {
  readonly limit: number;
  readonly onLimitChange: (limit: number) => void;
};

export default ({ limit, onLimitChange }: Props): ReactElement => {
  const [value, setValue] = useState<number>(limit);
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const rawValue = e.currentTarget.value;
    let newValue: number;
    try {
      newValue = parseInt(rawValue, 10);
    } catch (e) {
      newValue = 1;
    }
    if (isNaN(newValue)) {
      newValue = 1;
    }
    if (newValue < 1) {
      newValue = 1;
    }
    setValue(newValue);
  };

  return (
    <div className={styles.Selector}>
      <TextField
        label="Limit"
        value={value}
        onChange={onChange}
        type="number"
        InputLabelProps={{
          shrink: true,
        }}
        margin="normal"
      />
      <Button color="inherit" onClick={() => onLimitChange(value)}>Set Limit</Button>
    </div>
  );
}
