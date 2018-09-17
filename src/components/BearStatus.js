import react, {Component} from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        MainTaskArray: state.MainTaskArray,
    }
}

class BearStatus extends Component {


    render() {
        return (
            <div>
                //TODO
            </div>
        )
    }

}

const GetStoreBearStatus = connect(mapStateToProps, null)(BearStatus)
export default BearStatus;