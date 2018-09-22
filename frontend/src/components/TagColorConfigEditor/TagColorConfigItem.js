import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List} from 'semantic-ui-react'
import {removeColorConfig} from '../../store/actions.js';
import ColorEditor from './ColorEditor'

const mapDispatchToProps = dispatch => {
    return {
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

    removeMe = () => {
        if (!confirm('Do you want to remove this config?')) {
            return;
        }
        this.props.removeColorConfig(this.props.tag);
    };

    toggleEditor = () => {
        this.setState(s => ({...s, showEditor: !s.showEditor}));
    };

    render() {
        return (
            <List.Item>
                <List.Icon name='github' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a' style={{backgroundColor: this.props.color}}>
                        {this.props.tag}
                    </List.Header>
                    <List.Description as='a'>Color: {this.props.color}</List.Description>
                    <button onClick={this.removeMe}>Remove me</button>
                    <button onClick={this.toggleEditor}>Toggle Editor</button>
                    {
                        this.state.showEditor && <ColorEditor tag={this.props.tag} color={this.props.color}/>
                    }
                </List.Content>
            </List.Item>
        );
    }

}

const TagColorConfigItem = connect(null, mapDispatchToProps)(UnconnectedTagColorConfigItem);
export default TagColorConfigItem;
