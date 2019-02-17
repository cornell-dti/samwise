// @flow strict

import firebase from 'firebase/app';
import type { FirebaseUser } from 'firebase';
import 'firebase/auth';
import { error } from '../util/general-util';

export type AppUser = {|
  +displayName: string;
  +email: string;
  +token: string;
|};

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

let appUser: AppUser | null = null;

/**
 * Cache the given user in the memory.
 */
export function cacheAppUser(user: AppUser) {
  appUser = user;
}

/**
 * Returns the global app user.
 *
 * If the user is not cached yet, it will not try to get one from firebase.
 * Instead, it will throw an error.
 */
export const getAppUser = (): AppUser => appUser ?? error('App is not initialized.');

/**
 * Sign out from firebase auth.
 */
export function firebaseSignOut(): void {
  firebase.auth().signOut().then(() => {});
}
