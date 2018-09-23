import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List} from 'semantic-ui-react'
import TagColorConfigItem from './TagColorConfigItem';

const mapStateToProps = state => {
    console.log(state);
    return {
        tagColorConfig: state.tagColorPicker,
        configKeys: Object.keys(state.tagColorPicker)
    };
};

class UnconnectedTagColorConfigItemList extends Component {

    render() {
        return (
            <List divided relaxed>
                {
                    this.props.configKeys.map(key => {
                        return <TagColorConfigItem key={key} tag={key} color={this.props.tagColorConfig[key]}/>;
                    })
                }
            </List>
        );
    }

}

const TagColorConfigItemList = connect(mapStateToProps, null)(UnconnectedTagColorConfigItemList);
export default TagColorConfigItemList;
