import React, {Component} from 'react';
import TagColorConfigItemList from "./TagColorConfigItemList";
import TagColorConfigItemAdder from "./TagColorConfigItemAdder";

export default class TagColorConfigEditor extends Component {

    render() {
        return (
            <div>
                <TagColorConfigItemList/>
                <TagColorConfigItemAdder/>
            </div>
        );
    }

}
