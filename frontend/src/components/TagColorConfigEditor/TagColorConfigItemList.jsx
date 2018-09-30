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

type Props = {| tagColorConfig: TagColorConfig, configKeys: Array<string> |};

function TagColorConfigItemList(props: Props) {
  const { configKeys, tagColorConfig } = props;
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

export default connect(mapStateToProps, null)(TagColorConfigItemList);
