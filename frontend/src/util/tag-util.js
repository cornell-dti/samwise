// @flow strict

import type { ComponentType } from 'react';
import { connect } from 'react-redux';
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

/**
 * Returns the tag from a list of tags given the id.
 */
const getTagById = (tags: Tag[], id: string): Tag | null => tags
  .find(t => t.id === id) || null;

/**
 * A function to connect a component with just tags in redux store.
 */
export function tagsConnect<-Config>(
  component: ComponentType<Config>,
): ComponentType<$Diff<Config, {| +tags: Tag[] |}>> {
  return connect(({ tags }) => ({ tags }), null)(component);
}

/**
 * A function to connect a component with a function to find the color of a tag.
 */
export function getTagConnect<-Config>(
  component: ComponentType<Config>,
): ComponentType<$Diff<Config, {| +getTag: (id: string) => Tag; |}>> {
  return connect(
    ({ tags }) => ({ getTag: id => getTagById(tags, id) }), null,
  )(component);
}
