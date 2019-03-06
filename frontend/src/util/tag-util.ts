import { Tag } from '../store/store-types';

/**
 * ID of the none tag.
 */
export const NONE_TAG_ID: string = 'THE_GLORIOUS_NONE_TAG';

/**
 * The none tag.
 */
export const NONE_TAG: Tag = {
  id: NONE_TAG_ID, order: 0, name: 'None', color: 'gray', classId: null,
};
