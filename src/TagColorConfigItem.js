import React, {Component} from 'react';
import {connect} from 'react-redux';
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
            <div>
                <span>{this.props.tag}</span>
                <span style={{backgroundColor: this.props.color}}>Color</span>
                <button onClick={this.toggleEditor}>Toggle</button>
                {this.state.showEditor && <TagColorConfigItemEditor/>}
            </div>
        );
    }

}

const TagColorConfigItem = connect(null, mapDispatchToProps)(UnconnectedTagColorConfigItem);
export default TagColorConfigItem;
