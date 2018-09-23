import React from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TagColorConfigItem from './TagColorConfigItem';

const mapStateToProps = state => ({
  tagColorConfig: state.tagColorPicker,
  configKeys: Object.keys(state.tagColorPicker),
});

function TagColorConfigItemList() {
  return (
    <List divided relaxed>
      {
        this.props.configKeys.map(key => {
          return <TagColorConfigItem key={key} tag={key} color={this.props.tagColorConfig[key]} />;
        })
      }
    </List>
  );
}

export default connect(mapStateToProps, null)(TagColorConfigItemList);
