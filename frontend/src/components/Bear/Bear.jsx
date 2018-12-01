import React, { Component } from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => ({ bearStatus: state.bearStatus });

class Bear extends Component {
  render() {
    const { bearStatus } = this.state;
    return <div>{ bearStatus }</div>;
  }
}

const GetBearStatus = connect(mapStateToProps, null)(Bear);
export default GetBearStatus;
