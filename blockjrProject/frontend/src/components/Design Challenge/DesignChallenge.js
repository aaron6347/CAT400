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

class CreateChallenge extends Component {
    constructor(props){
        super(props);
        this.state = {
            did: "",
            uid: "",
            workspace: "",
            workspacexml: "",
            alertSeverity: "",
            alertMsg: "",
        }
        this.designObj = [];
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
            readOnly: false,
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

    toPrettyText = (event)=>{
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        let text = Blockly.Xml.domToPrettyText(xml)
        if(text=="<xml xmlns=\"http://www.w3.org/1999/xhtml\">\n  <variables></variables>\n</xml>") 
            return ""
        else
            return text
    }

    // set data from child to DesignChallenge
    setDesignObj = (designObj, event)=>{
        this.designObj = designObj;
    }

    doSave = (event)=>{
        // if create mode then save data
        if(this.state.did==undefined){
            const saveDesignJSON = {
                method: "POST",
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({
                    uid: this.state.uid,
                    workspace: this.toPrettyText(),
                    title: this.designObj['title'],
                    difficulty: this.designObj['difficulty'],
                    creator: this.designObj['creator'],
                    desc: this.designObj['desc'],
                    hint: this.designObj['hint'],
                }),
            };
            fetch(`/api/saveDesign`, saveDesignJSON).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        this.setState({did: data['did']})
                        this.setState({alertSeverity: "success", alertMsg: "Saved challenge successfully."})
                    })
                else 
                    this.setState({alertSeverity: "error", alertMsg: "Opps, failed to save challenge!"})
            })
        }
        // if edit mode or saved after create mode then update data
        else if(this.state.did!=""){
            const updateDesignJSON = {
                method: "POST",
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({
                    did: this.state.did,
                    uid: this.state.uid,
                    workspace: this.toPrettyText(),
                    title: this.designObj['title'],
                    difficulty: this.designObj['difficulty'],
                    creator: this.designObj['creator'],
                    desc: this.designObj['desc'],
                    hint: this.designObj['hint'],
                }),
            };
            fetch(`/api/updateDesign`, updateDesignJSON).then((response)=>{
                if(response.ok)
                    this.setState({alertSeverity: "success", alertMsg: "Updated challenge successfully."})
                else 
                    this.setState({alertSeverity: "error", alertMsg: "Opps, failed to update challenge!"})
            })
        }
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
                    <TabSection uid={this.state.uid} did={this.state.did} workspace={this.workspace} setDesignObj={this.setDesignObj} /></div>
                <div id="buttonDiv">
                    <Box style={{textAlign: "center", marginTop: "2em"}}>
                        <Button color="primary" variant="contained" style={{marginRight: "5em"}} onClick={this.doSave}>
                            {"Save"}
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

export default withParams(CreateChallenge)