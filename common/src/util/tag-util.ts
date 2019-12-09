import { Tag } from '../types/store-types';

/**
 * ID of the none tag.
 */
export const NONE_TAG_ID = 'THE_GLORIOUS_NONE_TAG';

/**
 * The none tag.
 */
export const NONE_TAG: Tag = {
  id: NONE_TAG_ID,
  order: 0,
  name: 'None',
  color: '#969696',
  classId: null,
};
