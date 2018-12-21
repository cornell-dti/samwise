// @flow strict

import type { ComponentType } from 'react';
import type { Tag } from '../store/store-types';
import { error } from './general-util';
import { stateConnect } from '../store/react-redux-util';
import type { ConnectedComponent } from '../store/react-redux-util';

/**
 * ID of the none tag.
 * @type {number}
 */
export const NONE_TAG_ID = -1;

/**
 * The none tag.
 * @type {Tag}
 */
export const NONE_TAG: Tag = {
  id: NONE_TAG_ID, type: 'other', name: 'None', color: 'gray',
};

/**
 * Returns the tag from a list of tags given the name.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {number} id the tag id to find.
 * @return {string} the tag.
 */
const getTagById = (tags: Tag[], id: number): Tag => tags
  .find(t => t.id === id) ?? error('Color not found! Corrupted store.');

type TagsProps = {| +tags: Tag[] |};

/**
 * A function to connect a component with just tags in redux store.
 *
 * @param component the component to connect.
 * @return {ConnectedComponent<Config, TagsProps>} the connected component.
 */
export function tagsConnect<Config: Object>( // flowlint-line unclear-type:off
  component: ComponentType<Config>,
): ConnectedComponent<Config, TagsProps> {
  return stateConnect<Config, TagsProps>(
    ({ tags }): TagsProps => ({ tags }),
  )(component);
}

type TagColorProps = {| +getTag: (id: number) => Tag; |};

/**
 * A function to connect a component with a function to find the color of a tag.
 *
 * @param component the component to connect.
 * @return {ConnectedComponent<Config, TagColorProps>} the connected component.
 */
export function getTagConnect<Config: Object>( // flowlint-line unclear-type:off
  component: ComponentType<Config>,
): ConnectedComponent<Config, TagColorProps> {
  return stateConnect<Config, TagColorProps>(
    ({ tags }): TagColorProps => ({ getTag: id => getTagById(tags, id) }),
  )(component);
}
