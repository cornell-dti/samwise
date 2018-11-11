// @flow strict

import React from 'react';
import type { Node } from 'react';
import { List } from 'semantic-ui-react';
import ColorConfigItem from './ColorConfigItem';
import type { State, ColorConfig } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type Props = {| tagColorConfig: ColorConfig, configKeys: string[] |};

const mapStateToProps = ({ tagColorConfig }: State): Props => ({
  tagColorConfig, configKeys: Object.keys(tagColorConfig),
});

function TagColorConfigItemList({ tagColorConfig, configKeys }: Props): Node {
  return (
    <List divided relaxed style={{ width: '250px', display: 'inline-block' }}>
      {
        configKeys.map(key => (
          <ColorConfigItem key={key} tag={key} color={tagColorConfig[key]} isClass={false} />
        ))
      }
    </List>
  );
}

const ConnectedTagColorConfigItemList = simpleConnect<Props, {}, Props>(
  mapStateToProps,
)(TagColorConfigItemList);
export default ConnectedTagColorConfigItemList;
