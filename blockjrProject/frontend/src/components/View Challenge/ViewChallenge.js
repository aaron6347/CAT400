import React, {Component} from "react";
import {Button, Box, Snackbar} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {useParams} from "react-router-dom";
import getCookie from "../getCookie";
import Navbar from "../Navbar";
import TabSection from "./TabSection"

function withParams(Component){
    return props => <Component {...props} params={useParams()}/>
}

class ViewChallenge extends Component {
    constructor(props){
        super(props);
        this.state = {
            uid: "",
            did: "",
            alertSeverity: "",
            alertMsg: "",
        }
        this.workspace = "";
    }

    UNSAFE_componentWillMount(){
        let {did} = this.props.params;
        let uid = getCookie(document.cookie, "uid=")
        if (uid==undefined || uid=="")
            window.location = "/error"
        else
            this.setState({uid: uid, did: did})
    }

    componentDidMount(){
        // insert workspace injection 
        this.workspace = Blockly.inject('leftDiv', {
            locale: 'en',
            comments: true,
            disable: false,
            collapse: false,
            media: "/static/scratch-blocks/media/",
            readOnly: true,
            scrollbars: true,
            toolbox: 0,
            toolboxPosition: 'start',
            horizontalLayout: null,
            trashcan: true,
            sounds: true,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 0.75,
                maxScale: 4,
                minScale: 0.25,
                scaleSpeed: 1.1
            },
            colours: {
                fieldShadow: 'rgba(255, 255, 255, 0.3)',
                dragShadowOpacity: 0.6
            }
        })
        this.workspace.addChangeListener(this.changeWorkspace)
        // save workspace as stateful
        this.setState({workspace: this.workspace})
    }

    changeWorkspace = (event)=>{
        var xml = Blockly.Xml.workspaceToDom(this.state.workspace);
        this.setState({workspacexml: Blockly.Xml.domToPrettyText(xml)})
    }

    doEdit = (event)=>{
        fetch(`/api/requestEditDesign?uid=${this.state.uid}&did=${this.state.did}`).then((response)=>{
            if(response.ok)
                window.location = `/designChallenge/${this.state.did}`
            else if(response.status==400)
                window.location = "/error"
            else if(response.status==401)
                this.setState({alertSeverity: "error", alertMsg: "Only the original creator can edit this challenge."})
        })
    }

    doHome = (event)=>{
        window.location = "/home"
    }

    closeAlert = (event, reason)=>{
        if (reason === 'clickaway')
            return;
        this.setState({alertMsg: ""})
    };

    render(){
        return (
            <div><Navbar/>
                <Snackbar open={this.state.alertMsg!=""} autoHideDuration={4000} onClose={this.closeAlert} anchorOrigin={{ vertical: "bottom",  horizontal: "left" }}>
                    <Alert variant="filled" onClose={this.closeAlert} severity={this.state.alertSeverity}>{this.state.alertMsg}</Alert>
                </Snackbar>
                <div id="leftDiv"></div>
                <div id="rightDiv">
                    <TabSection did={this.state.did} workspace={this.workspace}/></div>
                <div id="buttonDiv">
                    <Box style={{textAlign: "center", marginTop: "2em"}} >
                        <Button color="primary" variant="contained" style={{marginRight: "5em"}} onClick={this.doEdit}>
                            {"Edit"}
                        </Button>
                        <Button color="secondary" variant="contained" style={{marginLeft: "5em"}} onClick={this.doHome}>
                            {"Home"}
                        </Button>
                    </Box>
                </div>
            </div>
        )
    }
}

export default withParams(ViewChallenge)