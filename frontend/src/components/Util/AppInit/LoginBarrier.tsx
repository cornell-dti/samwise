import React, { ReactElement } from 'react';
import firebase from 'firebase/app';
import { FirebaseAuth } from 'react-firebaseui';
import { setGAUser } from '../../../util/ga-util';
import styles from './Login.module.css';
import { cacheAppUser, toAppUser } from '../../../firebase/auth-util';
import initListeners from '../../../firebase/listeners';

import dtiLogo from '../../../assets/splash/wordmark.png';
import screenshot from '../../../assets/splash/header_final.png';
import samwiseLogo from '../../../assets/splash/samwise_logo.svg';
import splashTopImage from '../../../assets/splash/splash_top_image.svg';
import splashPeakBear from '../../../assets/splash/splash_peak_bear.svg';
import blueCurve from '../../../assets/splash/blue.svg';
import splashScreenshot from '../../../assets/splash/screenshot.png';
import splashMidImage from '../../../assets/splash/splash_mid_image.svg';
import feature1 from '../../../assets/splash/feature1.svg';
import feature2 from '../../../assets/splash/feature2.svg';
import feature3 from '../../../assets/splash/feature3.svg';
import splashPeakBear2 from '../../../assets/splash/splash_peak_bear_2.svg';
import logoHeart from '../../../assets/splash/heart_logo.svg';
import logoLink from '../../../assets/splash/link_logo.svg';

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
          const alertMessage = 'Sorry, but Samwise registration is currently restricted to Cornell students. Please login with an @cornell.edu email address';
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

  const loginScreen = (
    <div className={styles.Landing}>
      <header>
        <img src={samwiseLogo} alt="Samwise" />
      </header>
      <div className={styles.LandingHeroWrap}>
        <h1>
          Stop Worrying.
          <br />
          Start Doing.
        </h1>
        <img src={splashTopImage} alt="" />
        <div className={styles.LandingHeroLogin}>
          <img src={splashPeakBear} alt="" />
          <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
      </div>
      <div className={styles.LandingLower}>
        <img src={blueCurve} className={styles.LandingBlue} alt="" />
        <img src={splashScreenshot} className={styles.LandingScreenshot} alt="Screenshot of the Samwise app interface" />
        <h2>
          Samwise is a task manager for Cornell students who
          {' '}
          <span>put in work.</span>
        </h2>
        <img src={splashMidImage} alt="" className={styles.LandingMidImg} />
        <div>
          <img src={feature1} className={styles.LandingFeatures} alt="Take control of your schedule" />
          <img src={feature2} className={styles.LandingFeatures} alt="Your workload, visualized" />
          <img src={feature3} className={styles.LandingFeatures} alt="Create actionable (sub)tasks" />
        </div>
        <div className={styles.LandingLastLogin}>
          <img src={splashPeakBear2} alt="" />
        </div>
        <footer>
          <p>
            Made by DTI
            {' '}
            <img src={logoHeart} alt="with love" />
          </p>
          <p>
            <a href="https://cornelldti.org">
              Cornell Design &amp; Tech Initiative
              {' '}
              <img src={logoLink} alt="external link" />
            </a>
          </p>
        </footer>
      </div>
    </div>
  );

  const loadingScreen = (
    <div className={styles.Login}>
      <section className={styles.LoginSection}>
        <div>
          <h1>Samwise</h1>
          <p>A Student Planner for Everyone</p>
          <h3>Loading...</h3>
        </div>
      </section>
      <div className={styles.LoginWrapper}>
        <img src={screenshot} alt="Samwise screenshot" />
      </div>
      <footer className={styles.LoginFooter}>
        <a href="https://cornelldti.org">
          <img
            src={dtiLogo}
            alt="Cornell DTI"
          />
        </a>
      </footer>
    </div>
  );

  return loginStatus === false ? loginScreen : loadingScreen;
}
