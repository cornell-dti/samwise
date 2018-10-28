import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Calendar } from 'react-calendar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewTaskClassPicker from './NewTaskClassPicker';
import { addTask, undoAction } from '../../store/actions';
import styles from './NewTask.css';
import ToastUndo from './ToastUndo';
import ClassPicker from '../ClassPicker/ClassPicker';

const mapDispatchToProps = dispatch => ({
  addTask: e => dispatch(addTask(e)),
  undoAction: () => dispatch(undoAction()),
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
      tag: 'None',
      date: new Date(),//new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
      complete: false,
      subtaskArray: [],
    };
  }

  handleSave = (e) => {
    e.preventDefault();

    this.props.addTask(this.state);
    this.setState(this.initialState());

    toast.success(<ToastUndo dispText='Task Added :D' changeCallback={this.handleUndo}/>, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
  
  handleUndo = () => {
    console.log("UNDO CALLED");
    this.props.undoAction();
  }

  handleClassChange = (e) => {
    this.changeClass.current.previousSibling.checked = false;
    this.addTask.current.focus();
    //const newTag = e.target.getAttribute('data-class-title');
    this.setState({ tag: e });
  }


  handleTaskNameChange = (e) => {
    this.setState({ name: e.target.value });
  }


  handleDateChange = (e) => {
    this.openDateChange.current.click();
    this.setState({ date: e });
  }

  forceClassChangeOpen = (e) => {
    this.openClassChange.current.click();
  }
  

  render() {
    return (
      <form className={styles.NewTaskWrap} onSubmit={this.handleSave}>
        <input value={this.state.name} onChange={this.handleTaskNameChange} type='text' className={styles.NewTaskComponent} placeholder='What do you have to do?' ref={this.addTask} />
        <div className={styles.NewTaskActive}>

          <div className={styles.NewTaskClass}>
            <input id='changeClassCheckbox' type='checkbox' ref={this.openClassChange} />
            <label htmlFor='changeClassCheckbox' data-curr={this.state.tag}  style={{ backgroundColor: this.props.tagColorPicker[this.state.tag] }} ref={this.changeClass}>{this.state.tag}</label>
            <ClassPicker onTagChange={this.handleClassChange} />
          </div>

          <div className={styles.NewTaskDate}>
            <label htmlFor='changeDateCheckbox'>📆</label>
            <input id='changeDateCheckbox' type='checkbox' ref={this.openDateChange} />
            <div className={styles.NewTaskDatePick}>
              <Calendar
                onChange={this.handleDateChange}
                value={this.state.date}
//<<<<<<< HEAD
//<<<<<<< HEAD
                minDate={new Date()}
//=======
//>>>>>>> Properly Updating Calendar
//=======
//                minDate={new Date()}
//>>>>>>> Calendar Min Date
                />
            </div>
          </div>
          <ToastContainer />

        </div>
      </form>
    );/*<ul>
              {Object.keys(this.props.tagColorPicker).map(
                cTitle =>
                  <NewTaskClassPicker
                    key={cTitle}
                    classColor={this.props.tagColorPicker[cTitle]}
                    classTitle={cTitle}
                    changeCallback={this.handleClassChange} 
                  />
              )}
            </ul>*/
  }
}

const NewTaskComponent = connect(mapStateToProps, mapDispatchToProps)(UnconNewTaskComponent);
export default NewTaskComponent;
