import React, {
	Component
} from 'react';
import NewTaskClassPicker from './NewTaskClassPicker';
import styles from './NewTask.css';

class NewTaskComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			buttonClickedCount: 0,
		};
		this.changeClass = React.createRef();
		this.addTask = React.createRef();
	}

	/*handleChange = () => {
		this.setState(
			(prevState) => {
				return {
					buttonClickedCount: prevState.buttonClickedCount + 1
				};
			},
			() => {
				console.log(this.state.buttonClickedCount)
			});
	}*/

	handleClassChange = (e) => {
		let newColor = e.target.getAttribute("data-color");
		this.changeClass.current.style.backgroundColor = newColor;
		this.changeClass.current.previousSibling.checked = false;
		this.addTask.current.focus();
	}

	render() {
		return (
			<div className = {styles.NewTaskWrap} >
				<input type="text" className={styles.NewTaskComponent} placeholder="What do you have to do?" ref={this.addTask} />
				<div className = {styles.NewTaskActive}>

					<div className = {styles.NewTaskClass}>
						<input id="changeClassCheckbox" type="checkbox"/>
						<label htmlFor="changeClassCheckbox" ref={this.changeClass}></label>
						<ul>
							<NewTaskClassPicker classColor="#FFFF00" classTitle="CHIN 1109" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#0000FF" classTitle="MATH 2230" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#FF0000" classTitle="PHYS 1116" changeCallback={this.handleClassChange}></NewTaskClassPicker>
							<NewTaskClassPicker classColor="#00FF00" classTitle="CS 2112" changeCallback={this.handleClassChange}></NewTaskClassPicker>
						</ul>
					</div>

					<div className = {styles.NewTaskDate}>
						<input type="date" min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} />
					</div>
				
				</div>
			</div>
		);
	}
}

export default NewTaskComponent;