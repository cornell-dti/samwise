import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TaskBox from './taskBox';

const mapStateToProps = (state) => {
  return { mainTaskArray: state.mainTaskArray };
};

function unconnectedFocusView(props) {
  const { mainTaskArray } = props;
  const listItems = mainTaskArray.map(
    item => <TaskBox {...item} key={item.id} />
  );
  return (
    <List>
      { listItems }
    </List>
  );
}

const FocusView = connect(mapStateToProps, null)(unconnectedFocusView);
export default FocusView;
