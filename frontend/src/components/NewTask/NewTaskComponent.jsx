import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addTask, removeTask } from '../../store/actions';
import styles from './NewTask.css';
import ToastUndo from './ToastUndo';
import ClassPicker from '../ClassPicker/ClassPicker';
import ClassPickerWrap from './ClassPickerWrap';
import CalPicker from './CalPicker';

const placeholderText = 'What do you have to do?';

const mapDispatchToProps = dispatch => ({
  addTask: e => dispatch(addTask(e)),
  removeTask: e => dispatch(removeTask(e)),
});

const mapStateToProps = ({ mainTaskArray, classColorConfig, tagColorConfig }) => ({
  colorConfig: { ...classColorConfig, ...tagColorConfig },
  mainTaskArray,
});

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
      lastDel: -1,
    };
  }

  openNewTask = () => {
    this.addTaskModal.current.style.display = 'block';
    this.blockModal.current.style.display = 'block';
    this.addTask.current.placeholder = '';
  }

  closeNewTask = () => {
    this.addTaskModal.current.style.display = '';
    this.blockModal.current.style.display = '';
    this.addTask.current.placeholder = placeholderText;
    this.addTask.current.blur();
  }

  handleSave = (e) => {
    e.preventDefault();

    const { name, subtaskArray, date } = this.state;
    const { addTask } = this.props;

    if (name === '') {
      return;
    }

    const newSubtaskArr = subtaskArray.filter(
      el => el.name !== '',
    ).map(
      (el, i) => ({ ...el, id: i }),
    );


    const toAdd = { ...this.state, subtaskArray: newSubtaskArr };
    delete toAdd.lastDel;
    addTask(toAdd);
    const lastId = toAdd.id;

    const taskMsg = 'Added ' + name + ' ' + date.toLocaleDateString('en-US', {  
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    this.setState({ ...this.initialState(), lastDel: lastId });

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
    this.closeNewTask();
  }

  handleUndo = () => {
    const { lastDel } = this.state;
    const { mainTaskArray, removeTask } = this.props;

    const taskId = lastDel;
    if (taskId === -1) { return; }

    const lastTask = mainTaskArray.find(e => e.id === taskId);
    removeTask(taskId);

    this.setState({ ...lastTask, lastDel: -1 });
    this.addTask.current.focus();
  }

  handleClassChange = (e) => {
    this.changeClass.current.previousSibling.checked = false;
    this.addTask.current.focus();
    this.setState({ tag: e });
  }

  handleTagChange = (e) => {
    this.addTask.current.focus();
    this.setState({ tag: e });
  }


  handleTaskNameChange = (e) => {
    this.setState({ name: e.target.value });
  }


  handleDateChange = (e) => {
    this.setState({ date: e });
    this.addTask.current.focus();
  }

  handleAddSubtask = (e) => {
    if (e.target.value === '') {
      return;
    }

    const { subtaskArray } = this.state;

    const newSubtask = {
      id: subtaskArray.length,
      name: e.target.value,
      complete: false,
    };

    this.setState({
      subtaskArray: [...subtaskArray, newSubtask],
    }, () => {
      const liList = this.subtaskList.current.getElementsByTagName('LI');
      const lastItem = liList[liList.length - 1];
      lastItem.getElementsByTagName('INPUT')[0].focus();
    });

    e.target.value = '';
  }

  forceClassChangeOpen = () => {
    this.openClassChange.current.click();
  }

  handleChangeSubtask = (e) => {
    const subtaskId = parseInt(e.target.parentElement.getAttribute('data-subtaskid'), 10);

    const { subtaskArray } = this.state;

    const newSubtaskArr = subtaskArray.map(
      el => (el.id === subtaskId ? { ...el, name: e.target.value } : el),
    );

    this.setState({ subtaskArray: newSubtaskArr });
  }

  handleDelSubtask = (e) => {
    e.preventDefault();

    const { subtaskArray } = this.state;

    const subtaskId = parseInt(e.target.parentElement.parentElement.getAttribute('data-subtaskid'), 10);
    const newSubtaskArr = subtaskArray.filter(
      el => el.id !== subtaskId,
    ).map(
      (el, i) => ({ ...el, id: i }),
    );

    this.setState({ subtaskArray: newSubtaskArr });
  }


  render() {
    const {
      name, tag, subtaskArray,
    } = this.state;
    const { colorConfig } = this.props;
    return (
      <div>
        <div
          onClick={this.closeNewTask}
          role="presentation"
          className={styles.CloseNewTask}
          ref={this.blockModal}
        />
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
            required
          />
          <div className={styles.NewTaskActive} ref={this.addTaskModal}>

            {/* <div className={styles.NewTaskDate}>
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
            </div> */}
            <ClassPickerWrap onTagChange={this.handleTagChange} />
            <span style={{ marginRight: '10px' }} />
            <CalPicker onDateChange={this.handleDateChange} />

            <button type="submit" className={styles.SubmitNewTask}>
              <Icon color="black" name="arrow alternate circle right outline" className={styles.CenterIcon} />
            </button>

            <div className={styles.NewTaskModal}>
              <ul ref={this.subtaskList}>
                {subtaskArray.map(
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
  }
}

const NewTaskComponent = connect(mapStateToProps, mapDispatchToProps)(UnconNewTaskComponent);
export default NewTaskComponent;
