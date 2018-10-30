// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TagColorConfigItem from './TagColorConfigItem';
import type { State, TagColorConfig } from '../../store/store-types';

type Props = {| tagColorConfig: TagColorConfig, configKeys: string[] |};

const mapStateToProps = (state: State): Props => ({
  tagColorConfig: state.tagColorPicker,
  configKeys: Object.keys(state.tagColorPicker),
});

function TagColorConfigItemList({ tagColorConfig, configKeys }: Props) {
  return (
    <List divided relaxed>
      {
        configKeys.map(key => (
          <TagColorConfigItem key={key} tag={key} color={tagColorConfig[key]} />
        ))
      }
    </List>
  );
}

const ConnectedTagColorConfigItemList = connect(mapStateToProps, null)(TagColorConfigItemList);
export default ConnectedTagColorConfigItemList;
