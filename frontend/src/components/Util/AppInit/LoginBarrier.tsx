import React, { ReactElement } from 'react';
import firebase from 'firebase/app';
import { FirebaseAuth } from 'react-firebaseui';
import { setGAUser } from '../../../util/ga-util';
import styles from './Login.module.css';
import { cacheAppUser, toAppUser } from '../../../firebase/auth-util';
import initListeners from '../../../firebase/listeners';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      customParameters: { hd: 'cornell.edu' },
    }],
  signInSuccessUrl: '/',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

type Props = { readonly appRenderer: () => ReactElement };
type LoginStatus = boolean | 'UNDECIDED';

/**
 * The login barrier component.
 * This component will stop non-logged-in user from accessing other parts of the application.
 * It will only render the app given in a function is the user is signed in.
 *
 * @param appRenderer the function to call when the login flow finishes.
 */
export default function LoginBarrier({ appRenderer }: Props): ReactElement {
  const [loginStatus, setLoginStatus] = React.useState<LoginStatus>('UNDECIDED');
  const [loaded, setLoaded] = React.useState(false);

  // Listen for auth state changes in effect hooks.
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      toAppUser(user).then((currentUserFromFirebase) => {
        if (currentUserFromFirebase === null) {
          setLoginStatus(false);
          setLoaded(false);
          return;
        }
        const { email } = currentUserFromFirebase;
        if (email.endsWith('@cornell.edu')) {
          setGAUser(currentUserFromFirebase);
          cacheAppUser(currentUserFromFirebase);
          setLoginStatus(true);
        } else {
          const alertMessage = 'You should sign in with your Cornell email!';
          firebase.auth().signOut().then(() => {
            // eslint-disable-next-line no-alert
            alert(alertMessage);
            // eslint-disable-next-line no-restricted-globals
            location.reload(false);
          });
        }
      });
    });
  }, [loginStatus]);

  // The effect of loading data when login finishes
  React.useEffect(() => {
    if (loginStatus !== true) {
      return () => {};
    }
    if (!loaded) {
      initListeners(() => setLoaded(true));
    }
    return () => {};
  }, [loginStatus, loaded]);

  if (loaded) {
    // It will be loaded only if the user is signed in, so we can render!
    return appRenderer();
  }
  const loadingOrLogin = loginStatus === false
    ? (
      <>
        <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        <div className={styles.LoginPadding} />
      </>
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
