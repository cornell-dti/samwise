import React, {Component} from 'react';
import {connect} from 'react-redux';
import {editColorConfig, removeColorConfig} from './store/actions.js';

const mapDispatchToProps = dispatch => {
    return {
        editColorConfig: (tag, color) => dispatch(editColorConfig(tag, color)),
        removeColorConfig: (tag) => dispatch(removeColorConfig(tag))
    };
};

class UnconnectedTagColorConfigItemEditor extends Component {

    render() {
        return (
            <div>Hi. I'm the editor</div>
        );
    }

}

const TagColorConfigItemEditor = connect(null, mapDispatchToProps)(UnconnectedTagColorConfigItemEditor);
export default TagColorConfigItemEditor;