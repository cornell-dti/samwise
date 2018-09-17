import React, { Component } from 'react'
import { connect } from 'reac-redux'
import { updateBearStatus } from '../store/actions.js'

const mapStateToProps = state => {
    return { bearStatus: state.bearStatus };
};

const mapDispatchToProps = dispatch => {
    return {
        updateBearStatus: () => dispatch(updateBearStatus());
    };
};

class Bear extends Component {
    render() {
        return (
            <div>
                {this.state.bearStatus}
            </div>
        );
    }
};

const GetBearStatus = connect(mapStateToProps, null)(Bear);
export default GetBearStatus