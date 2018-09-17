import react, {Component} from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        MainTaskArray: state.MainTaskArray,
    }
}

class TaskForm extends Component {


    render() {
        return (
            <div>
                <form>
                    
                </form>

                <button onClick = {this.handleClick}>
                    Enter
                </button>
            </div>
        )
    }

}

const GetStoreTaskForm = connect(mapStateToProps, null)(TaskForm)
export default TaskForm;