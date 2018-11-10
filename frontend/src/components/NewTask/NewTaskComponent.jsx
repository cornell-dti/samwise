import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Calendar } from 'react-calendar';
import { Icon } from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    this.addTaskModal = React.createRef();
    this.blockModal = React.createRef();
    this.subtaskList = React.createRef();
  }

  
  initialState() {
    return {
      name: '',
      id: (10 * new Date()) + Math.floor(10 * Math.random()),
      tag: 'None',
      date: new Date(),
      complete: false,
      subtaskArray: [],
    };
  }
  
  openNewTask = () => {
    this.addTaskModal.current.style.display = 'block';
    this.blockModal.current.style.display = 'block';
  }
  
  closeNewTask = () => {
    this.addTaskModal.current.style.display = '';
    this.blockModal.current.style.display = '';
  }

  handleSave = (e) => {
    e.preventDefault();

    this.props.addTask(this.state);

    this.closeNewTask();
    const taskMsg = 'Added ' + this.state.name + ' ' + this.state.date.toLocaleDateString('en-US', {  
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    this.setState(this.initialState());

    toast.success(
      <ToastUndo dispText={taskMsg} changeCallback={this.handleUndo} />, {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: 'addtasktoast',
      },
    );
  }

  handleUndo = () => {
    this.props.undoAction();
  }

  handleClassChange = (e) => {
    this.changeClass.current.previousSibling.checked = false;
    this.addTask.current.focus();
    this.setState({ tag: e });
  }


  handleTaskNameChange = (e) => {
    this.setState({ name: e.target.value });
  }


  handleDateChange = (e) => {
    this.openDateChange.current.click();
    this.setState({ date: e });
    this.addTask.current.focus();
  }

  handleAddSubtask = (e) => {
    //if (e.keyCode === 13) {
      //e.preventDefault();

      const newSubtask = {
        id: this.state.subtaskArray.length,
        name: e.target.value,
        complete: false,
      };

      this.setState({
        subtaskArray: [...this.state.subtaskArray, newSubtask]
      }, () => {
        const liList = this.subtaskList.current.getElementsByTagName("LI");
        const lastItem = liList[liList.length - 1];
        lastItem.getElementsByTagName("INPUT")[0].focus();
      });
      
      e.target.value = "";
    
    
    //}
  }

  forceClassChangeOpen = () => {
    this.openClassChange.current.click();
  }
  
  handleChangeSubtask = (e) => {
    const subtaskId = parseInt(e.target.parentElement.getAttribute("data-subtaskid"));
    const newSubtaskArr = this.state.subtaskArray.map(
      el => (el.id === subtaskId ? { ...el, name: e.target.value } : el)
    );

    this.setState({ subtaskArray: newSubtaskArr });
  }

  handleDelSubtask = (e) => {
    e.preventDefault();

    let i = 0;

    const subtaskId = parseInt(e.target.parentElement.parentElement.getAttribute("data-subtaskid"));
    const newSubtaskArr = this.state.subtaskArray.filter(
      el => el.id != subtaskId
    ).map(
      el => ({ ...el, id: i++ })
    );

    this.setState({ subtaskArray: newSubtaskArr });
  }


  render() {
    const { name, tag, date } = this.state;
    const { tagColorPicker } = this.props;
    return (
      <div>
        <div onClick={this.closeNewTask} className={styles.CloseNewTask} ref={this.blockModal}></div>
        <form
          className={styles.NewTaskWrap}
          onSubmit={this.handleSave}
          onFocus={this.openNewTask}
        >
          <input
            value={name}
            onChange={this.handleTaskNameChange}
            type="text"
            className={styles.NewTaskComponent}
            placeholder="What do you have to do?"
            ref={this.addTask}
          />
          <div className={styles.NewTaskActive} ref={this.addTaskModal}>

            <div className={styles.NewTaskClass}>
              <input id="changeClassCheckbox" type="checkbox" ref={this.openClassChange} />
              <label
                htmlFor="changeClassCheckbox"
                data-curr={tag}
                style={{ backgroundColor: tagColorPicker[tag] }}
                ref={this.changeClass}
              >
                <span>{tag}</span>
                <Icon name="tag" className={styles.CenterIcon} />
              </label>
              <ClassPicker onTagChange={this.handleClassChange} />
            </div>

            <div className={styles.NewTaskDate}>
              <label htmlFor="changeDateCheckbox">
                <Icon name="calendar outline" className={styles.CenterIcon} />
              </label>
              <input id="changeDateCheckbox" type="checkbox" ref={this.openDateChange} />
              <div className={styles.NewTaskDatePick}>
                <Calendar
                  onChange={this.handleDateChange}
                  value={date}
                  minDate={new Date()}
                />
              </div>
            </div>

            <button type="submit" className={styles.SubmitNewTask}>
              <Icon color="black" name="arrow alternate circle right outline" className={styles.CenterIcon} />
            </button>

            <div className={styles.NewTaskModal}>
              <ul ref={this.subtaskList}>
                {this.state.subtaskArray.map(
                  subtaskObj => (
                    <li key={subtaskObj.name + Math.random()} data-subtaskid={subtaskObj.id}>
                      <button type="button" onClick={this.handleDelSubtask}><Icon name="delete" /></button>
                      <input
                        onBlur={this.handleChangeSubtask}
                        type="text"
                        defaultValue={subtaskObj.name}
                      />
                    </li>),
                )}
              </ul>
              <Icon name="plus" />
              <input type="text" placeholder="Add a Subtask" onKeyUp={this.handleAddSubtask} />
            </div>

          </div>
        </form>

        <ToastContainer />
      </div>
    );
  }//📆
}

const NewTaskComponent = connect(mapStateToProps, mapDispatchToProps)(UnconNewTaskComponent);
export default NewTaskComponent;
