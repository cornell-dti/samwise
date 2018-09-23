import React, {Component} from 'react';
import {connect} from 'react-redux';
import {editColorConfig} from '../../store/actions.js';
import {GithubPicker} from 'react-color';

const mapDispatchToProps = dispatch => {
    return {
        editColorConfig: (tag, color) => dispatch(editColorConfig(tag, color))
    };
};

class UnconnectedColorEditor extends Component {

    handleStateComplete = color => {
        const tag = this.props.tag;
        this.props.editColorConfig(tag, color.hex);
    };

    render() {
        return (
            <GithubPicker color={this.props.color} onChangeComplete={this.handleStateComplete} />
        );
    }

}

const ColorEditor = connect(null, mapDispatchToProps)(UnconnectedColorEditor);
export default ColorEditor;
