import React, { Component } from 'react';
import { connect } from 'react-redux';
import { GithubPicker } from 'react-color';
import { editColorConfig } from '../../store/actions';
import styles from './TagColorConfigItemAdder.css';

const mapDispatchToProps = dispatch => ({
  editColorConfig: (tag, color) => dispatch(editColorConfig(tag, color)),
});

class TagColorConfigItemAdder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tagInput: 'Some Random Class',
      colorInput: 'red',
    };
  }

  changeTagName = event => this.setState({ ...this.state, tagInput: event.target.value });

  changeColor = (color) => {
    this.setState({ ...this.state, colorInput: color.hex });
  };

  addItemColor = () => {
    const { tagInput, colorInput } = this.state;
    this.props.editColorConfig(tagInput, colorInput);
  };

  render() {
    const { tagInput, colorInput } = this.state;
    return (
      <div className={styles.TagColorConfigItemAdder}>
        <input type="text" value={tagInput} onChange={this.changeTagName} />
        <div>
          Chosen Color is
          {colorInput}
        </div>
        <GithubPicker color={colorInput} onChangeComplete={this.changeColor} />
        <button type="button" onClick={this.addItemColor}>Add me</button>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(TagColorConfigItemAdder);
