import React, { Component } from 'react';
import styles from './index.css';

class NewTaskComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			buttonClickedCount: 0,
		};
	}

	handleClick = () => {
		this.setState(
			(prevState) => {
				return { buttonClickedCount: prevState.buttonClickedCount + 1};
			},
			() => { console.log(this.state.buttonClickedCount) });
	}

	render() {
		return (
			<input type="text" />
		);
	}
}

export default NewTaskComponent;
