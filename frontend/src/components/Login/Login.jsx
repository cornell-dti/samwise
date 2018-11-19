// @flow strict

import React from 'react';
import type { Node } from 'react';
// $FlowFixMe
import firebase from 'firebase/app';
import 'firebase/auth';
// $FlowFixMe
import { FirebaseAuth } from 'react-firebaseui';
import { APP_NAME } from '../../util/general-util';
import styles from './Login.css';

const uiConfig = {
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  signInSuccessUrl: '/',
};

/**
 * The login node.
 *
 * @return {Node} the login node.
 */
export default (): Node => (
  <div className={styles.Login}>
    <div className={styles.LoginWrapper}>
      <h1 className={styles.LoginText}>{APP_NAME}</h1>
      <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      <div className={styles.LoginPadding} />
      <h4>Made by D&TI</h4>
      <h4>Cornell Design & Tech Initiative</h4>
    </div>
  </div>
);
