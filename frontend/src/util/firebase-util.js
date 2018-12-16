// @flow strict
import firebase from 'firebase/app';
import type { FirebaseUser } from 'firebase';
import 'firebase/auth';

export type AppUser = {|
  +displayName: string;
  +email: string;
  +token: string;
  +isDummy: boolean;
|};

/**
 * Initialize the firebase app.
 */
export function firebaseInit(): void {
  const config = {
    apiKey: 'AIzaSyBrnR-ai3ZQrr3aYnezDZTZdw9e2TWTRtc',
    authDomain: 'dti-samwise.firebaseapp.com',
    databaseURL: 'https://dti-samwise.firebaseio.com',
    projectId: 'dti-samwise',
    storageBucket: 'dti-samwise.appspot.com',
    messagingSenderId: '114434220691',
  };
  firebase.initializeApp(config);
}

/**
 * Returns the promise of firebase user or null if there is no signed-in user.
 *
 * @return {Promise<FirebaseUser | null>} the promise of firebase user or promise of null if
 * there is no signed-in user.
 */
export async function firebaseUserPromise(): Promise<AppUser | null> {
  const rawUser = await new Promise<?FirebaseUser>(
    (resolve, reject) => firebase.auth().onAuthStateChanged(resolve, reject),
  );
  if (rawUser == null) {
    return null;
  }
  // eslint-disable-next-line prefer-destructuring
  const currentUser: FirebaseUser | null = firebase.auth().currentUser;
  if (currentUser == null) {
    return null;
  }
  const { displayName, email } = currentUser;
  const token: string = await currentUser.getIdToken(true);
  const nonEmptyDisplayName = displayName == null ? 'Anonymous' : displayName;
  const nonEmptyEmail = email == null ? 'dummy-email@gmail.com' : email;
  return {
    displayName: nonEmptyDisplayName,
    email: nonEmptyEmail,
    token,
    isDummy: false,
  };
}
