import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import { List } from 'semantic-ui-react'
import {editColorConfig, removeColorConfig} from './store/actions.js';
import TagColorConfigItemEditor from './TagColorConfigItemEditor'

const mapDispatchToProps = dispatch => {
    return {
        editColorConfig: (tag, color) => dispatch(editColorConfig(tag, color)),
        removeColorConfig: (tag) => dispatch(removeColorConfig(tag))
    };
};

class UnconnectedTagColorConfigItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // whether to show the name editor and color picker
            showEditor: false
        };
    }

    toggleEditor = () => {
        this.setState(s => ({...s, showEditor: !s.showEditor}));
    };

    render() {
        return (
            <Fragment>
                <List.Item>
                    <List.Icon name='github' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header as='a' style={{backgroundColor: this.props.color}}>
                            {this.props.tag}
                            </List.Header>
                        <List.Description as='a'>Color: {this.props.color}</List.Description>
                        <button onClick={this.toggleEditor}>Toggle</button>
                        {this.state.showEditor && <TagColorConfigItemEditor/>}
                    </List.Content>
                </List.Item>
            </Fragment>
        );
    }

}

const TagColorConfigItem = connect(null, mapDispatchToProps)(UnconnectedTagColorConfigItem);
export default TagColorConfigItem;
