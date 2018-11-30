// @flow strict

import type { Tag } from '../store/store-types';

/**
 * Returns the tag from a list of tags given the name.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {string} name the tag name to find.
 * @return {string} the tag.
 */
export const getTagByName = (tags: Tag[], name: string): Tag => {
  const tagOpt = tags.find(t => t.name === name);
  if (tagOpt == null) {
    throw new Error('Color not found! Corrupted store.');
  }
  return tagOpt;
};

/**
 * Returns the color by tag from a list of tags given the name.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {string} name the tag name to find.
 * @return {number} the id.
 */
export const getIdByTag = (tags: Tag[], name: string): number => getTagByName(tags, name).id;

/**
 * Returns the color by tag from a list of tags given the name.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {number} id the tag od to find.
 * @return {string} the tag name.
 */
export const getNameByTagId = (tags: Tag[], id: string): string => {
  const tagOpt = tags.find(t => t.id === id);
  if (tagOpt == null) {
    throw new Error('Color not found! Corrupted store.');
  }
  return tagOpt.name;
};

/**
 * Returns the color by tag from a list of tags given the name.
 *
 * @param {Tag[]} tags the tags to search.
 * @param {string} name the tag name to find.
 * @return {string} the color.
 */
export const getColorByTag = (tags: Tag[], name: string): string => getTagByName(tags, name).color;
