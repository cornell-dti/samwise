import React, { Component } from 'react';
import { connect } from 'react-redux';
import NewTaskClassPicker from './NewTaskClassPicker';
import { addTask } from '../../store/actions';
import styles from './NewTask.css';
import Calendar from 'react-calendar';

const mapDispatchToProps = dispatch => ({
	addTask: e => dispatch(addTask(e)),
});

const mapStateToProps = state => ({ tagColorPicker: state.tagColorPicker });

class UnconNewTaskComponent extends Component {
	constructor(props) {
		super(props);
		this.state = this.initialState();
		this.changeClass = React.createRef();
		this.addTask = React.createRef();
		this.openClassChange = React.createRef();
		this.openDateChange = React.createRef();
	}


	initialState() {
		return {
			name: '',
			id: (10 * new Date()) + Math.floor(10 * Math.random()),
			tag: null,
			date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
			complete: false,
			subtaskArray: [],
		};
	}

	handleSave = (e) => {
		e.preventDefault();

		this.props.addTask(this.state);
		this.setState(this.initialState());
	}

	handleClassChange = (e) => {
		this.changeClass.current.previousSibling.checked = false;
		this.addTask.current.focus();
		const newTag = e.target.getAttribute('data-class-title');
		this.setState({ tag: newTag });
	}


	handleTaskNameChange = (e) => {
		this.setState({ name: e.target.value });
	}


	handleDateChange = (e) => {
		this.openDateChange.current.click();
		this.setState({ date: e });
	}

	forceClassChangeOpen = (e) => {
		console.log("Fired event");
		this.openClassChange.current.click();
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
			<form className={styles.NewTaskWrap} onSubmit={this.handleSave}>
				<input value={this.state.name} onChange={this.handleTaskNameChange} type="text" className={styles.NewTaskComponent} placeholder="What do you have to do?" ref={this.addTask} />
				<div className={styles.NewTaskActive}>

					<div className={styles.NewTaskClass}>
						<input id="changeClassCheckbox" type="checkbox" ref={this.openClassChange} />
						<label htmlFor="changeClassCheckbox" style={{ backgroundColor: this.props.tagColorPicker[this.state.tag] }} ref={this.changeClass}>{this.state.tag}</label>
						<ul>
							{Object.keys(this.props.tagColorPicker).map(cTitle => <NewTaskClassPicker key={cTitle} classColor={this.props.tagColorPicker[cTitle]} classTitle={cTitle} changeCallback={this.handleClassChange} />)}
						</ul>
					</div>

					<div className={styles.NewTaskDate}>
						<label htmlFor="changeDateCheckbox">📆</label>
						<input id="changeDateCheckbox" type="checkbox" ref={this.openDateChange} />
						<div className={styles.NewTaskDatePick}>
						<Calendar
							onChange={this.handleDateChange}
							value={new Date()}
							
							/>
							</div>
					</div>

				</div>
			</form>
		);//<input type="date" value={this.state.date} onChange={this.handleDateChange} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]} />
	}
}

const NewTaskComponent = connect(mapStateToProps, mapDispatchToProps)(UnconNewTaskComponent);
export default NewTaskComponent;
