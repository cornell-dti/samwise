import React, {
	Component
} from 'react';
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
							<li style={{["--custom-color"]: "#0000FF"}}><input data-color="#0000FF" onChange={this.handleClassChange} type="radio" name="classSelectRadio" />MATH 2230</li>
							<li style={{["--custom-color"]: "#FF0000"}}><input data-color="#FF0000" onChange={this.handleClassChange} type="radio" name="classSelectRadio" />PHYS 1116</li>
							<li style={{["--custom-color"]: "#00FF00"}}><input data-color="#00FF00" onChange={this.handleClassChange} type="radio" name="classSelectRadio" />CS 2112</li>
						</ul>
					</div>
				
				</div>
			</div>
		);
	}
}

export default NewTaskComponent;