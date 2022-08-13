import React, {Component} from "react";
import ReactDOM from "react-dom";
import Routing from "./Routing";

export default class App extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <Routing/>
        )
    }
}
ReactDOM.render(<App/>, document.getElementById("root"));