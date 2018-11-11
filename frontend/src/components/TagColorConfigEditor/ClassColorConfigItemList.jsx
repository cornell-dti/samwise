// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import TagColorConfigItem from './TagColorConfigItem';
import type { State, TagColorConfig } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| classColorConfig: ClassColorConfig, configKeys: string[] |};

const mapStateToProps = (state: State): Props => ({
  classColorConfig: state.classColorPicker,
  configKeys: Object.keys(state.classColorPicker),
});

function ClassColorConfigItemList({ classColorConfig, configKeys }: Props): Node {
  return (
    <List divided relaxed style={{ width: '500px', display: 'inline-block' }}>
      {
        configKeys.map(key => (
          <TagColorConfigItem key={key} tag={key} color={classColorConfig[key]} isClass={true}/>
        ))
      }
    </List>
  );
}

const ConnectedClassColorConfigItemList = simpleConnect<Props, {}, Props>(
  mapStateToProps,
)(ClassColorConfigItemList);
export default ConnectedClassColorConfigItemList;
