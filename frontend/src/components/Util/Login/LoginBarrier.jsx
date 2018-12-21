// @flow strict

import React from 'react';
import type { Node } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
// $FlowFixMe
import { FirebaseAuth } from 'react-firebaseui';
import styles from './Login.css';
import type { AppUser } from '../../../util/firebase-util';
import { toAppUser } from '../../../util/firebase-util';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  signInSuccessUrl: '/',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

type Props = {| +appRenderer: (user: AppUser) => Node; |}
type State = {| +currentUser: AppUser | null | 'UNDECIDED'; |};

/**
 * The login barrier component.
 * This component will stop non-logged-in user from accessing other parts of the application.
 * It will only render the app given in a function is the user is signed in.
 */
export default class LoginBarrier extends React.Component<Props, State> {
  state: State = { currentUser: 'UNDECIDED' };

  componentDidMount() {
    // Listen to the Firebase Auth state and set the local state.
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      toAppUser(user).then(currentUser => this.setState({ currentUser }));
    });
  }

  componentWillUnmount() {
    // Make sure we un-register Firebase observers when the component unmounts.
    if (this.unregisterAuthObserver != null) {
      this.unregisterAuthObserver();
    }
  }

  unregisterAuthObserver: (() => void) | null;

  render(): Node {
    const { appRenderer } = this.props;
    const { currentUser } = this.state;
    if (currentUser !== null && currentUser !== 'UNDECIDED') {
      return appRenderer(currentUser);
    }
    const loadingOrLogin = currentUser === null
      ? (
        <React.Fragment>
          <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
          <div className={styles.LoginPadding} />
        </React.Fragment>
      )
      : (<h3>Loading...</h3>);
    return (
      <div className={styles.Login}>
        <div className={styles.LoginWrapper}>
          <h1 className={styles.LoginText}>Samwise</h1>
          {loadingOrLogin}
          <h4>Made by D&TI</h4>
          <h4>Cornell Design & Tech Initiative</h4>
        </div>
      </div>
    );
  }
}
