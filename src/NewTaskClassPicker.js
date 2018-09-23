import React, {
	Component
} from 'react';
import styles from './NewTask.css';

class NewTaskClassPicker extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<li style={{["--custom-color"]: this.props.classColor}}>
        <input data-color={this.props.classColor} data-class-title={this.props.classTitle} onChange={this.props.changeCallback} type="radio" name="classSelectRadio" />{this.props.classTitle}
      </li>
		);
	}
}

export default NewTaskClassPicker;