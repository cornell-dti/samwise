// @flow strict

import firebase from 'firebase/app';
import type { FirebaseUser } from 'firebase';
import 'firebase/auth';
import { firebaseConfig } from './config';

export type AppUser = {|
  +displayName: string;
  +email: string;
  +token: string;
|};

/**
 * Initialize the firebase app.
 */
export function firebaseInit(): void {
  firebase.initializeApp(firebaseConfig);
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({
    login_hint: 'your-email@cornell.edu',
    hd: 'cornell.edu',
  });
}

/**
 * Returns the promise of an app user from the given raw firebase user.
 *
 * @param firebaseUser a raw firebase user or null.
 * @return {Promise<AppUser | null>} the promise of an app user.
 */
export async function toAppUser(firebaseUser: ?FirebaseUser): Promise<AppUser | null> {
  if (firebaseUser == null) {
    return null;
  }
  const { displayName, email } = firebaseUser;
  if (typeof displayName !== 'string' || typeof email !== 'string') {
    throw new Error('Bad user!');
  }
  const token: string = await firebaseUser.getIdToken(true);
  return { displayName, email, token };
}

/**
 * Returns the promise of firebase user or null if there is no signed-in user.
 *
 * @return {Promise<FirebaseUser | null>} the promise of firebase user or promise of null if
 * there is no signed-in user.
 */
export async function firebaseUserPromise(): Promise<AppUser | null> {
  return toAppUser(firebase.auth().currentUser);
}

/**
 * Sign out.
 */
export function firebaseSignOut(): void {
  firebase.auth().signOut().then(() => {});
}
