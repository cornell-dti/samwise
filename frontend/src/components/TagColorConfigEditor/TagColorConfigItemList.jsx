// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import TagColorConfigItem from './TagColorConfigItem';
import type { State, TagColorConfig } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| tagColorConfig: TagColorConfig, configKeys: string[] |};

const mapStateToProps = (state: State): Props => ({
  tagColorConfig: state.tagColorPicker,
  configKeys: Object.keys(state.tagColorPicker),
});

function TagColorConfigItemList({ tagColorConfig, configKeys }: Props): Node {
  return (
    <List divided relaxed style={{ width: '250px', display: 'inline-block' }}>
      {
        configKeys.map(key => (
          <TagColorConfigItem key={key} tag={key} color={tagColorConfig[key]} isClass={false}/>
        ))
      }
    </List>
  );
}

const ConnectedTagColorConfigItemList = simpleConnect<Props, {}, Props>(
  mapStateToProps,
)(TagColorConfigItemList);
export default ConnectedTagColorConfigItemList;
