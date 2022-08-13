import React, {Component} from "react";
import {Grid, Box, Button, Snackbar} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {useParams} from "react-router-dom";
import getCookie from "../getCookie";
import Navbar from "../Navbar"
import CourseDescription from "./CourseDescription";
import ChallengesInput from "./ChallengesInput";

function withParams(Component){
    return props => <Component {...props} params={useParams()}/>
}

class CreateCourse extends Component {
    constructor(props){
        super(props);
        this.state = {
            cid: "",
            uid: "",
            challenges: [],
            alertSeverity: "",
            alertMsg: "",
        }
        this.courseObj = [];
    }

    UNSAFE_componentWillMount(){
        let {cid} = this.props.params;
        let uid = getCookie(document.cookie,"uid=")
        if (uid==undefined || uid=="")
            window.location = "/error"
        else
            this.setState({uid: uid, cid: cid})
    }

    // set data from child to CreateCourse
    setCourseObj = (courseObj, event)=>{
        this.courseObj = courseObj;
    }

    setChallenges = (challenges)=>{
        this.setState({challenges: challenges})
    }

    doSave = (event)=>{
        if(this.courseObj['tags'].length==0)
            this.setState({alertSeverity: "error", alertMsg: "Must have at least one tag!"})
        else if(this.state.challenges.length==0)
            this.setState({alertSeverity: "error", alertMsg: "Must have at least one challenge!"})
        else{
            // if session is create mode then save data
            if(this.state.cid==undefined){
                const saveCourseJSON = {
                    method: "POST",
                    headers: {"Content-Type": 'application/json'},
                    body: JSON.stringify({
                        uid: this.state.uid,
                        title: this.courseObj['title'],
                        tags: this.courseObj['tags'],
                        passing: this.courseObj['passing'],
                        creator: this.courseObj['creator'],
                        desc: this.courseObj['desc'],
                        challenges: this.state.challenges,
                    }),
                };
                fetch(`/api/saveCourse`, saveCourseJSON).then((response)=>{
                    if(response.ok)
                        return response.json().then((data)=>{
                            this.setState({cid: data['cid']})
                            this.setState({alertSeverity: "success", alertMsg: "Saved course successfully."})
                        })
                    else 
                        this.setState({alertSeverity: "error", alertMsg: "Opps, failed to save course!"})
                })
            }
            // if session is saved after create mode or edit mode then update data
            else if(this.state.cid!=undefined){
                const updateCourseJSON = {
                    method: "POST",
                    headers: {"Content-Type": 'application/json'},
                    body: JSON.stringify({
                        cid: this.state.cid,
                        uid: this.state.uid,
                        title: this.courseObj['title'],
                        tags: this.courseObj['tags'],
                        passing: this.courseObj['passing'],
                        creator: this.courseObj['creator'],
                        desc: this.courseObj['desc'],
                        challenges: this.state.challenges,
                    }),
                };
                fetch(`/api/updateCourse`, updateCourseJSON).then((response)=>{
                    if(response.ok)
                        this.setState({alertSeverity: "success", alertMsg: "Updated course successfully."})
                    else 
                        this.setState({alertSeverity: "error", alertMsg: "Opps, failed to update challenge!"})
                })
            }
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
                <div id="leftDiv">
                    <CourseDescription uid={this.state.uid} cid={this.state.cid} setCourseObj={this.setCourseObj}/>
                </div>
                <div id="rightDiv">
                    <Grid container spacing={0} style={{ backgroundColor: '#FFFFFF'+'99', width: '100%'}}>
                        <Box sx={{ width: '96%', mx: 2, my: 2,}}>
                            <ChallengesInput uid={this.state.uid} cid={this.state.cid} setChallenges={this.setChallenges}/>
                        </Box>
                    </Grid>
                </div>
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

export default withParams(CreateCourse)