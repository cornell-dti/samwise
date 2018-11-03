import React from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TaskBox from './taskBox';

const mapStateToProps = state => ({
  mainTaskArray: state.mainTaskArray,
});

function unconnectedFocusView(props) {
  const destructuredProps = props;
  const listItems = destructuredProps.mainTaskArray.map(
    item => (item.inFocus ? <TaskBox {...item} key={item.id} /> : null),
  );
  return (
    <List>
      { listItems }
    </List>
  );
}


const FocusView = connect(mapStateToProps, null)(unconnectedFocusView);
export default FocusView;
