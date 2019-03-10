import React, { ReactElement } from 'react';
import { OneStat } from './stat-types';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import styles from './StatDisplay.module.css';

type Props = {
  readonly stats: OneStat[] | null;
};

export default ({ stats }: Props): ReactElement => {
  if (stats === null) {
    return <div>Stat Loading...</div>;
  }
  return (
    <div>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell align="right">Create Tag</TableCell>
              <TableCell align="right">Edit Tag</TableCell>
              <TableCell align="right">Delete Tag</TableCell>
              <TableCell align="right">Create Task</TableCell>
              <TableCell align="right">Create SubTask</TableCell>
              <TableCell align="right">Delete Task</TableCell>
              <TableCell align="right">Delete SubTask</TableCell>
              <TableCell align="right">Edit Task</TableCell>
              <TableCell align="right">Complete Task</TableCell>
              <TableCell align="right">Focus Task</TableCell>
              <TableCell align="right">Complete Focused Task</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map(({ time, actions }: OneStat) => (
              <TableRow key={time}>
                <TableCell component="th" scope="row">{time}</TableCell>
                <TableCell align="right">{actions.createTag}</TableCell>
                <TableCell align="right">{actions.editTag}</TableCell>
                <TableCell align="right">{actions.deleteTag}</TableCell>
                <TableCell align="right">{actions.createTask}</TableCell>
                <TableCell align="right">{actions.createSubTask}</TableCell>
                <TableCell align="right">{actions.deleteTask}</TableCell>
                <TableCell align="right">{actions.deleteSubTask}</TableCell>
                <TableCell align="right">{actions.editTask}</TableCell>
                <TableCell align="right">{actions.completeTask}</TableCell>
                <TableCell align="right">{actions.focusTask}</TableCell>
                <TableCell align="right">{actions.completeFocusedTask}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};
