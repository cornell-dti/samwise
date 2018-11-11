// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import ColorConfigItem from './ColorConfigItem';
import type { State, ColorConfig } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| classColorConfig: ColorConfig, configKeys: string[] |};

const mapStateToProps = ({ classColorConfig }: State): Props => ({
  classColorConfig, configKeys: Object.keys(classColorConfig),
});

function ClassColorConfigItemList({ classColorConfig, configKeys }: Props): Node {
  return (
    <List divided relaxed style={{ width: '500px', display: 'inline-block' }}>
      {
        configKeys.map(key => (
          <ColorConfigItem key={key} tag={key} color={classColorConfig[key]} isClass />
        ))
      }
    </List>
  );
}

const ConnectedClassColorConfigItemList = simpleConnect<Props, {}, Props>(
  mapStateToProps,
)(ClassColorConfigItemList);
export default ConnectedClassColorConfigItemList;
