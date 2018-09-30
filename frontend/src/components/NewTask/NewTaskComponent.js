import React, { Component } from 'react';
import { connect } from 'react-redux';
import NewTaskClassPicker from './NewTaskClassPicker';
import { addTask } from '../../store/actions.js';
import styles from './NewTask.css';

const mapDispatchToProps = dispatch => {
  return {
    addTask: () => dispatch(addTask(this.state))
  };
};

const mapStateToProps = state => {
  return { tagColorPicker: state.tagColorPicker };
};

class UnconNewTaskComponent extends Component {
	constructor(props) {
		super(props);
		this.state = this.initialState();
		this.changeClass = React.createRef();
		this.addTask = React.createRef();
	}


	initialState() {
		return {
			name: "",
			id: (10 * new Date()) + Math.floor(10 * Math.random()),
			tag: null,
			date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
			complete: false,
			subtaskArray: []
		};
	}

	handleSave = (e) => {
		e.preventDefault();

		console.log(this.state);

		this.props.addTask(this.state);
		this.setState(this.initialState());
		this.changeClass.current.style.backgroundColor = "";

		console.log("Saved");
	}

	/*handleEnter = (e) => {
		if(e.keyCode == 13){
			//Enter was pressed
			this.handleSave();
		}
	}*/

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
			});
	}


	handleTaskNameChange = (e) => {
		this.setState({name: e.target.value});
	}


	handleDateChange = (e) => {
		this.setState({date: e.target.value});
	}
//Object.keys(this.props.tagColorPicker)
	
/*
<NewTaskClassPicker classColor="#FFFF00" classTitle="CHIN 1109" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#0000FF" classTitle="MATH 2230" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#FF0000" classTitle="PHYS 1116" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#00FF00" classTitle="CS 2112" changeCallback={this.handleClassChange}></NewTaskClassPicker>
*/
	render() {
		return (
			<form className = {styles.NewTaskWrap} onSubmit={this.handleSave} >
				<input value={this.state.name} onChange={this.handleTaskNameChange} type="text" className={styles.NewTaskComponent} placeholder="What do you have to do?" ref={this.addTask} />
				<div className = {styles.NewTaskActive}>

					<div className = {styles.NewTaskClass}>
						<input id="changeClassCheckbox" type="checkbox" />
						<label htmlFor="changeClassCheckbox" ref={this.changeClass}></label>
						<ul>
							{Object.keys(this.props.tagColorPicker).map((cTitle) =>
								<NewTaskClassPicker key={cTitle} classColor={this.props.tagColorPicker[cTitle]} classTitle={cTitle} changeCallback={this.handleClassChange}></NewTaskClassPicker>
							)}
						</ul>
					</div>

					<div className = {styles.NewTaskDate}>
						<input type="date" value={this.state.date} onChange = {this.handleDateChange} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} />
					</div>
				
				</div>
			</form>
		);
	}
}

const NewTaskComponent = connect(mapStateToProps, mapDispatchToProps)(UnconNewTaskComponent);
export default NewTaskComponent;