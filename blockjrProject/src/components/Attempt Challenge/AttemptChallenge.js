import React, {Component} from "react";
import {Button, Box, Snackbar} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {useParams} from "react-router-dom";
import getCookie from "../getCookie";
import Navbar from "../Navbar";
import TabSection from "./TabSection";

function withParams(Component){
    return props => <Component {...props} params={useParams()}/>
}

class AttemptChallenge extends Component {
    constructor(props){
        super(props);
        this.state = {
            uid: "",
            cid: "",
            did: "",
            workspace: "",
            submissionObj: [],
            alertSeverity: "",
            alertMsg: "",
        }
        this.workspace = "";
    }

    UNSAFE_componentWillMount(){
        let {params} = this.props.params;

        // var url = new URL(location.href).searchParams.get('course')
        // console.log('course', url.replaceAll('-', ' '))
        // var url = new URL(location.href).searchParams.get('design')
        // console.log('design', url.replaceAll('-', ' '))


        let uid = getCookie(document.cookie,"uid=")
        if (uid==undefined || uid=="")
            window.location = "/error"
        else
            this.setState({uid: uid, cid: params.slice(0, 6), did: params.slice(6, 12)}) // cut cid and did from params
        fetch(`/api/getSubmission?uid=${uid}&cid=${params.slice(0, 6)}&did=${params.slice(6, 12)}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    this.setState({submissionObj: data.reverse()})
                })
            else if(response.status==400)
                window.location = "/error"
        })
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
        // save workspace as stateful
        this.setState({workspace: this.workspace})
    }

    toPrettyText = (event)=>{
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        let text = Blockly.Xml.domToPrettyText(xml)
        if(text == "<xml xmlns=\"http://www.w3.org/1999/xhtml\">\n  <variables></variables>\n</xml>") 
            return ""
        else
            return text
    }

    doSubmit = (event)=>{
        let workspace = this.toPrettyText()
        if(workspace == "")
            this.setState({alertSeverity: "error", alertMsg: "Coding block answer cannot be empty!"})
        else{
            const saveSubmissionJSON = {
                method: "POST",
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({
                    uid: this.state.uid,
                    cid: this.state.cid,
                    did: this.state.did,
                    workspace: workspace,
                }),
            };
            fetch(`/api/saveSubmission`, saveSubmissionJSON).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        this.setState({alertSeverity: "success", alertMsg: "Submitted answer successfully."})
                        this.setState({submissionObj: data.reverse()})
                    })
                else 
                    this.setState({alertSeverity: "error", alertMsg: "Opps, failed to submit the answer!"})
            })
        }
    }

    doNextChallenge = (event)=>{
        fetch(`/api/requestNextChallenge?uid=${this.state.uid}&cid=${this.state.cid}&did=${this.state.did}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    window.location = `/attemptChallenge/${this.state.cid}${data}`
                })
            else if(response.status==401)
                return response.json().then((data)=>{
                    this.setState({alertSeverity: "error", alertMsg: `You must score at least ${data}!`})
                })
            else if(response.status==404)
                this.setState({alertSeverity: "info", alertMsg: "Congrats, you have reached the end of course!"})
            else if(response.status==400)
                this.setState({alertSeverity: "error", alertMsg: "Opps, failed to proceed next challenge!"})
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
                    <TabSection did={this.state.did} submissionObj={this.state.submissionObj} workspace={this.workspace}/></div>
                <div id="buttonDiv">
                    <Box style={{textAlign: "center", marginTop: "2em"}} >
                        <Button color="primary" variant="contained" style={{marginRight: "5em"}} onClick={this.doSubmit}>
                            {"Submit"}
                        </Button>
                        <Button color="primary" variant="contained" style={{margin: "0 5em 0 5em"}} onClick={this.doNextChallenge}>
                            {"Next Challenge"}
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

export default withParams(AttemptChallenge)