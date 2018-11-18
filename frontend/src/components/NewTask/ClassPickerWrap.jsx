import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import ClassPicker from '../ClassPicker/ClassPicker';
import styles from './Picker.css';

const mapStateToProps = ({ classColorConfig, tagColorConfig }) => ({
  colorConfig: { ...classColorConfig, ...tagColorConfig },
});

class UnconClassPickerWrap extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
  }

  initialState = () => ({
    tag: 'None',
    opened: false,
    reset: true,
  })

  resetState = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState(this.initialState());
  }

  handleOpenClose = () => {
    const { opened } = this.state;
    this.setState({ opened: !opened });
    if (!opened) {
      const { onOpened } = this.props;
      onOpened();
    }
  }

  close = () => {
    this.setState({ opened: false });
  }

  handleTagChange = (e) => {
    if (e === 'None') {
      this.resetState();
    } else {
      this.setState({ tag: e, opened: false, reset: false });
    }
    const { onTagChange } = this.props;
    onTagChange(e);
  }

  render() {
    const { tag, opened, reset } = this.state;
    const { colorConfig } = this.props;
    return (
      <div className={styles.Main}>
        <span
          htmlFor="changeTagCheckbox"
          ref={this.changeClass}
          onClick={this.handleOpenClose}
          style={{ background: reset ? 'none' : colorConfig[tag] }}
          className={styles.LabelHack}
        >
          <span className={styles.TagDisplay} style={{ display: reset ? 'none' : 'inline' }}>
            {tag}
          </span>
          <Icon
            name="tag"
            className={styles.CenterIcon}
            style={{ display: reset ? 'inline' : 'none', color: 'black' }}
          />
          <button
            type="button"
            className={styles.ResetButton}
            onClick={this.resetState}
            style={{ display: reset ? 'none' : 'inline' }}
          >
            &times;
          </button>
        </span>
        <div className={styles.NewTaskClassPick} style={{ display: opened ? 'block' : 'none' }}>
          <ClassPicker onTagChange={this.handleTagChange} />
        </div>
      </div>
    );
  }
}


const ClassPickerWrap = connect(mapStateToProps, null, null, { withRef: true })(UnconClassPickerWrap);
export default ClassPickerWrap;
