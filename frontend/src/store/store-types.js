// @flow

/**
 * The tag color picker maps a tag to a color.
 */
export type TagColorConfig = {
  +[tag: string]: string
};

/**
 * The type of the entire redux state.
 */
export type State = {
  +mainTaskArray: any,
  +tagColorPicker: TagColorConfig,
  +bearStatus: string
};
