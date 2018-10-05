// @flow

import React from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TagColorConfigItem from './TagColorConfigItem';
import type { State, TagColorConfig } from '../../store/store-types';

const mapStateToProps = (state: State) => ({
  tagColorConfig: state.tagColorPicker,
  configKeys: Object.keys(state.tagColorPicker),
});

type Props = {| tagColorConfig: TagColorConfig, configKeys: string[] |};

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
