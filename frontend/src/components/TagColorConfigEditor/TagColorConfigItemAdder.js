import React, { Component } from 'react';
import { connect } from 'react-redux';
import { editColorConfig } from '../../store/actions';
import styles from './TagColorConfigItemAdder.css';
import { GithubPicker } from 'react-color';

const mapDispatchToProps = dispatch => {
  return {
    editColorConfig: (tag, color) => dispatch(editColorConfig(tag, color))
  };
};

class UnconnectedTagColorConfigItemAdder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tagInput: 'Some Random Class',
      colorInput: 'red'
    }
  }

  changeTagName = event => {
    this.setState({ ...this.state, tagInput: event.target.value });
  };

  changeColor = (color) => {
    this.setState({ ...this.state, colorInput: color.hex });
  };

  addItemColor = () => {
    this.props.editColorConfig(this.state.tagInput, this.state.colorInput);
  };

  render() {
    return (
      <div className={styles.TagColorConfigItemAdder}>
        <input type='text' value={this.state.tagInput} onChange={this.changeTagName}/>
        <div>Chosen Color is {this.state.colorInput}</div>
        <GithubPicker color={this.state.colorInput} onChangeComplete={this.changeColor}/>
        <button onClick={this.addItemColor}>Add me</button>
      </div>
    );
  }

}

const TagColorConfigItemAdder = connect(null, mapDispatchToProps)(UnconnectedTagColorConfigItemAdder);
export default TagColorConfigItemAdder;
