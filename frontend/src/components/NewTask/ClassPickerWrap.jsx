import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import ClassPicker from '../ClassPicker/ClassPicker';
import styles from './Picker.css';
import { getColorByTagId, getNameByTagId } from '../../util/tag-util';

const mapStateToProps = ({ tags }) => ({ tags });

class ClassPickerWrap extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
  }

  initialState = () => ({
    tag: -1,
    opened: false,
    reset: true,
  });

  resetState = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState(this.initialState());
  };

  handleOpenClose = () => {
    const { opened } = this.state;
    this.setState({ opened: !opened });
    if (!opened) {
      const { onOpened } = this.props;
      onOpened();
    }
  };

  close = () => {
    this.setState({ opened: false });
  };

  handleTagChange = (e) => {
    if (e === -1) {
      this.resetState();
    } else {
      this.setState({ tag: e, opened: false, reset: false });
    }
    const { onTagChange } = this.props;
    onTagChange(e);
  };

  render() {
    const { tag, opened, reset } = this.state;
    const { tags } = this.props;
    return (
      <div className={styles.Main}>
        <span
          htmlFor="changeTagCheckbox"
          ref={this.changeClass}
          onClick={this.handleOpenClose}
          style={{ background: reset ? 'none' : getColorByTagId(tags, tag) }}
          className={styles.LabelHack}
        >
          <span className={styles.TagDisplay} style={{ display: reset ? 'none' : 'inline' }}>
            {getNameByTagId(tags, tag)}
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

const ConnectedClassPickerWrap = connect(
  mapStateToProps, null, null, { withRef: true },
)(ClassPickerWrap);
export default ConnectedClassPickerWrap;
