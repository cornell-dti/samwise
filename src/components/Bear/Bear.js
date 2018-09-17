import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateBearStatus } from '../../store/actions.js'

const mapStateToProps = state => {
    return { bearStatus: state.bearStatus };
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
