// @flow

export type TagColorConfigEditAction = {|
  +type: 'EDIT_COLOR_CONFIG', +tag: string, +color: string
|};
export type TagColorConfigRemoveAction = {|
  +type: 'REMOVE_COLOR_CONFIG', +tag: string
|};

export type TagColorConfigAction = TagColorConfigEditAction | TagColorConfigRemoveAction;

export type Action = { +type: string };
