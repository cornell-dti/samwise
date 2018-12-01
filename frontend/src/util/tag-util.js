// @flow strict

import type { Tag } from '../store/store-types';

/**
 * Returns the tag from a list of tags given the name.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {number} id the tag id to find.
 * @return {string} the tag.
 */
export const getTagById = (tags: Tag[], id: number): Tag => {
  const tagOpt = tags.find(t => t.id === id);
  if (tagOpt == null) {
    throw new Error('Color not found! Corrupted store.');
  }
  return tagOpt;
};

/**
 * Returns the color by tag from a list of tags given the name.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {number} id the tag id to find.
 * @return {string} the tag name.
 */
export const getNameByTagId = (tags: Tag[], id: number): string => getTagById(tags, id).name;

/**
 * Returns the color by tag from a list of tags given the id.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {number} id the tag id to find.
 * @return {string} the color.
 */
export const getColorByTagId = (tags: Tag[], id: number): string => getTagById(tags, id).color;
