// @flow strict

import React from 'react';
import type { Node } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
// $FlowFixMe
import { FirebaseAuth } from 'react-firebaseui';
import styles from './Login.css';
import type { AppUser } from '../../../util/firebase-util';
import { cacheAppUser, toAppUser } from '../../../util/firebase-util';
import { httpInitializeData } from '../../../http/http-service';
import { dispatchAction } from '../../../store/store';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  signInSuccessUrl: '/',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

/*
TODO
  I disabled this because it may destroy some state in the React component.
  Unless we go through a major code review to fix the state persistence problem,
  we should not try to ship this auto refresh feature.

const refreshDataTimeInterval = 60 * 1000;
let refreshDataTimeIntervalID: IntervalID | null = null;

function refreshData() {
  httpInitializeData().then(a => dispatchAction(a));
}

function initRefreshDataTask() {
  if (refreshDataTimeIntervalID === null) {
    refreshDataTimeIntervalID = setInterval(refreshData, refreshDataTimeInterval);
  }
}
*/

type Props = {| +appRenderer: () => Node; |}
type CurrentUser = AppUser | null | 'UNDECIDED';
// type State = {| +currentUser: CurrentUser; |};

/**
 * The login barrier component.
 * This component will stop non-logged-in user from accessing other parts of the application.
 * It will only render the app given in a function is the user is signed in.
 *
 * @param appRenderer the function to call when the login flow finishes.
 */
export default function LoginBarrier({ appRenderer }: Props): Node {
  const [currentUser, setCurrentUser] = React.useState<CurrentUser>('UNDECIDED');
  const [loaded, setLoaded] = React.useState(false);

  // Used for hook effect optimization
  const currentUserToken = (currentUser === null || typeof currentUser === 'string')
    ? null : currentUser.token;
  // Listen for auth state changes in effect hooks.
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      toAppUser(user).then((currentUserFromFirebase) => {
        if (currentUserFromFirebase === null) {
          setCurrentUser(null);
          return;
        }
        const { email } = currentUserFromFirebase;
        if (email.endsWith('@cornell.edu')) {
          setCurrentUser(currentUserFromFirebase);
        } else {
          const alertMessage = 'You should sign in with your Cornell email!';
          firebase.auth().signOut().then(() => {
            // eslint-disable-next-line
            alert(alertMessage);
            // eslint-disable-next-line
            location.reload(false);
          });
        }
      });
    });
  }, [currentUserToken]);

  // The effect of loading data when login finishes
  React.useEffect(() => {
    if (currentUser === null || typeof currentUser === 'string') {
      return;
    }
    cacheAppUser(currentUser);
    if (!loaded) {
      httpInitializeData().then((action) => {
        dispatchAction(action);
        setLoaded(true);
      });
    } else {
      // initRefreshDataTask();
    }
  });

  if (loaded) {
    // It will be loaded only if the user is signed in, so we can render!
    return appRenderer();
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
        <h4>Made by Cornell DTI</h4>
        <h4>Cornell Design & Tech Initiative</h4>
      </div>
    </div>
  );
}
