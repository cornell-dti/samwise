// @flow strict

import type { Tag } from '../store/store-types';

/**
 * ID of the none tag.
 * @type {number}
 */
export const NONE_TAG_ID = 'THE_GLORIOUS_NONE_TAG';

/**
 * The none tag.
 * @type {Tag}
 */
export const NONE_TAG: Tag = {
  id: NONE_TAG_ID, order: 0, name: 'None', color: 'gray', classId: null,
};
