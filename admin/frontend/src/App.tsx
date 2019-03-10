import React, { ReactElement } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { blue as primary } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import styles from './App.module.css';
import ControlPanel from './ControlPanel';

const theme = createMuiTheme({
  palette: { primary },
  typography: { useNextVariants: true },
});

const Title = (): ReactElement => (
  <Typography variant="h6" color="inherit" className={styles.Title}>
    Samwise Admin Control Panel
  </Typography>
);

const PublicWebsiteLink = (): ReactElement => (
  <Button color="inherit">
    <Link color="inherit" href="https://samwise.today" target="_blank" rel="noopener noreferrer" >
      Public Website
    </Link>
  </Button>
);

const TopAppBar = (): ReactElement => (
  <AppBar position="static">
    <Toolbar>
      <Title />
      <PublicWebsiteLink />
    </Toolbar>
  </AppBar>
);

export default (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div className={styles.App}>
      <TopAppBar />
      <ControlPanel />
    </div>
  </MuiThemeProvider>
);
