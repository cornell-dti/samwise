import React, { Component } from 'react';
import { connect } from 'react-redux';
import ClassPickerItem from './ClassPickerItem';
import styles from './ClassPicker.css';

const mapStateToProps = state => ({ tagColorPicker: state.tagColorPicker });

class UnconClassPicker extends Component {
  constructor(props, onTagChange) {
    super(props);
    this.state = this.initialState();
    this.changeClass = React.createRef();
    this.addTask = React.createRef();
    this.openClassChange = React.createRef();
    this.openDateChange = React.createRef();
    this.onTagChange = onTagChange;
  }


  initialState() {
    return {
      name: '',
      id: (10 * new Date()) + Math.floor(10 * Math.random()),
      tag: 'None',
      date: new Date(),
      complete: false,
      subtaskArray: [],
    };
  }

  handleClassChange = (e) => 
    const newTag = e.target.getAttribute('data-class-title');
    this.onTagChange(newTag);
  }


  render() {
    return (
      <ul className={styles.NewTaskClass}>
        {Object.keys(this.props.tagColorPicker).map(
          cTitle =>
          <ClassPickerItem
            key={cTitle}
            classColor={this.props.tagColorPicker[cTitle]}
            classTitle={cTitle}
            changeCallback={this.handleClassChange} 
            />
        )}
      </ul>
    );
  }
}

const ClassPicker = connect(mapStateToProps, null)(UnconClassPicker);
export default ClassPicker;