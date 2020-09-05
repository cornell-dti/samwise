/**
 * The utility file to manage all modes.
 */

export type Mode = 'DEV' | 'STAGING' | 'PROD';

const mode: Mode = (() => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_IS_STAGING !== 'true' ? 'PROD' : 'STAGING';
  }
  return 'DEV';
})();

export default mode;
