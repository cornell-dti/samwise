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

	handleClassChange = () => {
		let optionArray = this.changeClass.current.options;
		let newColor = optionArray[optionArray.selectedIndex].getAttribute("data-color");
		this.changeClass.current.style.backgroundColor = newColor;
		//console.log();
	}

	render() {
		return (
			<div className = {styles.NewTaskWrap} >
				<input type="text" className={styles.NewTaskComponent} placeholder="What do you have to do?" />
				<div className = {styles.NewTaskActive}>
					<select className = {styles.NewTaskClassDropdown} onChange={this.handleClassChange} ref={this.changeClass}>
						<option data-color="#FF0000">CS 2112</option>
						<option data-color="#00FF00">MATH 2230</option>
						<option data-color="#0000FF">PHYS 1116</option>
					</select>
				</div>
			</div>
		);
	}
}

export default NewTaskComponent;