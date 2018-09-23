import React, { Component } from 'react';
import { connect } from 'react-redux';
import NewTaskClassPicker from './NewTaskClassPicker';
import { addTask } from './store/actions.js';
import styles from './NewTask.css';

const mapDispatchToProps = dispatch => {
  return {
    addTask: () => dispatch(addTask())
  };
};

class UnconNewTaskComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			id: (10 * new Date()) + Math.floor(10 * Math.random()),
			tag: null,
			date: null,
			complete: false,
			subtaskArray: []
		};
		this.changeClass = React.createRef();
		this.addTask = React.createRef();
	}

	handleSave = () => {
		this.props.addTask(this.state);
	}

	handleEnter = (e) => {
		if(e.keyCode == 13){
			//Enter was pressed
			this.handleSave();
		}
	}

	handleClassChange = (e) => {
		let newColor = e.target.getAttribute("data-color");
		this.changeClass.current.style.backgroundColor = newColor;
		this.changeClass.current.previousSibling.checked = false;
		this.addTask.current.focus();
		let newTag = e.target.getAttribute("data-class-title");
		this.setState(
			(prevState) => {
				return {
					tag: newTag
				};
			},
			() => {
				console.log(this.state)
		});
	}


	handTaskNameChange = (e) => {
		let newName = e.target.value;
		this.setState(
			(prevState) => {
				return {
					name: newName
				};
			},
			() => {
				console.log(this.state)
		});
	}


	handleDateChange = (e) => {
		let newDate = new Date(e.target.value);
		this.setState(
			(prevState) => {
				return {
					date: newDate
				};
			},
			() => {
				console.log(this.state)
		});
	}


	render() {
		return (
			<div className = {styles.NewTaskWrap} >
				<input onChange={this.handTaskNameChange} onKeyDown={this.handleEnter} type="text" className={styles.NewTaskComponent} placeholder="What do you have to do?" ref={this.addTask} />
				<div className = {styles.NewTaskActive}>

					<div className = {styles.NewTaskClass}>
						<input id="changeClassCheckbox" type="checkbox" />
						<label htmlFor="changeClassCheckbox" ref={this.changeClass}></label>
						<ul>
							<NewTaskClassPicker classColor="#FFFF00" classTitle="CHIN 1109" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#0000FF" classTitle="MATH 2230" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#FF0000" classTitle="PHYS 1116" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#00FF00" classTitle="CS 2112" changeCallback={this.handleClassChange}></NewTaskClassPicker>
						</ul>
					</div>

					<div className = {styles.NewTaskDate}>
						<input type="date" onChange = {this.handleDateChange} defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} />
					</div>
				
				</div>
			</div>
		);
	}
}

const NewTaskComponent = connect(null, mapDispatchToProps)(UnconNewTaskComponent);
export default NewTaskComponent;