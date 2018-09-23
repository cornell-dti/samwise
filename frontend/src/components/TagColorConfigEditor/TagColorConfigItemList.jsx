import React from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TagColorConfigItem from './TagColorConfigItem';

const mapStateToProps = state => ({
  tagColorConfig: state.tagColorPicker,
  configKeys: Object.keys(state.tagColorPicker),
});

class TagColorConfigItemList extends React.Component {
  render() {
    const { configKeys } = this.props;
    return (
      <List divided relaxed>
        {
          configKeys.map(key => (
            <TagColorConfigItem key={key} tag={key} color={this.props.tagColorConfig[key]} />
          ))
        }
      </List>
    );
  }
}

export default connect(mapStateToProps, null)(TagColorConfigItemList);
