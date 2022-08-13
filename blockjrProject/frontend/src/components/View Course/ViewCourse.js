import React, {Component} from "react";
import {Grid, Box, Button, Typography, Chip, Divider, Card, CardContent, List, ListItem, ListItemText, Accordion,
    AccordionSummary, AccordionDetails, Snackbar} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {useParams} from "react-router-dom";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import LockIcon from '@material-ui/icons/Lock';
import getCookie from "../getCookie";
import Navbar from "../Navbar"

function withParams(Component){
    return props => <Component {...props} params={useParams()}/>
}

class ViewCourse extends Component {
    constructor(props){
        super(props);
        this.state = {
            uid: "",
            role: "",
            mode: "",   // for student, join or continue mode of course action
            cid: "",
            title: "",
            tags: [],
            passing: "",
            creator: "",
            desc: "",
            challenges: [],
            challengesTitle: [],
            creationdate: "",
            status: "",
            scoreList: [],
            submissiondateList: [],
            alertSeverity: "",
            alertMsg: "",
        }
    }

    UNSAFE_componentWillMount(){
        let {cid} = this.props.params;
        let uid = getCookie(document.cookie,"uid=")
        if (uid==undefined || uid=="")
            window.location = "/error"
        else
            this.setState({uid: uid, cid: cid})
        fetch(`/api/getCourse?cid=${cid}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    this.setState({
                        title: data['courseData']['title'],
                        tags: data['courseData']['tags'],
                        passing: data['courseData']['passing'],
                        creator: data['courseData']['creator'],
                        desc: data['courseData']['desc'],
                        challenges: data['courseData']['challenges'],
                        challengesTitle: data['titleList'],
                        creationdate: data['courseData']['creationdate'],
                        status: data['courseData']['status']
                    })
                    if(data['courseData']['status']=="deactivated")
                        this.setState({alertSeverity: "info", alertMsg: `This course has been deactivated.`})
                })
            else 
                window.location = "/error"
        })
        fetch(`/api/getRole?uid=${uid}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    this.setState({role: data})
                    // if user is student then check participation and submission
                    if(data=="Student"){
                        fetch(`/api/getParticipation?uid=${uid}&cid=${cid}`).then((response)=>{
                            if(response.ok){
                                this.setState({mode: "Continue"})
                                fetch(`/api/getHighScore?uid=${uid}&cid=${cid}`).then((response)=>{
                                    if(response.ok)
                                        return response.json().then((data)=>{
                                            this.setState({scoreList: data['scoreList'], submissiondateList: data['submissiondateList']})
                                        })
                                    else
                                        window.location = "/error"
                                })
                            }
                            else if(response.status==404)
                                this.setState({mode: "Join"})
                            else if (response.status==400)
                                window.location = "/error"
                        })
                    }
                })
            else 
                window.location = "/error"
        })
    }

    openChallenge = (index, event)=>{
        // if student clicking then check participation
        if(this.state.role=="Student"){
            // if no participation then disallow to proceed
            if(this.state.mode=="Join")
                this.setState({alertSeverity: "error", alertMsg: "You must join the course first!"})
            // if participation exist then decide based on submission score
            if(this.state.mode=="Continue"){
                // if the challenge is first one or previous challenge's score >= passing score then navigate to attempt challenge
                if(index==0 || this.state.scoreList[index-1]>=this.state.passing)
                    window.location = `/attemptChallenge/${this.state.cid}${this.state.challenges[index]}`
                // if previous challenge's score is < passing score then disallow to proceed
                else if(this.state.scoreList[index-1]=="-" || this.state.scoreList[index-1]<this.state.passing)
                    this.setState({alertSeverity: "error", alertMsg: `You must score at least ${this.state.passing} in previous challenge(s)!`})
            }
        }
        // if teacher clicking then navigate to view challenge
        else if(this.state.role=="Teacher")
            window.location = `/viewChallenge/${this.state.challenges[index]}`
    }
    
    doEdit = (event)=>{
        fetch(`/api/requestEditCourse?uid=${this.state.uid}&cid=${this.state.cid}`).then((response)=>{
            if(response.ok)
                window.location = `/createCourse/${this.state.cid}`
            else if(response.status==400)
                window.location = "/error"
            else if(response.status==401)
                this.setState({alertSeverity: "error", alertMsg: "Only the original creator can edit this course."})
        })
    }

    doJoin = (event)=>{
        const saveParticipationJSON = {
            method: "POST",
            headers: {"Content-Type": 'application/json'},
            body: JSON.stringify({
                uid: this.state.uid,
                cid: this.state.cid,
            }),
        };
        fetch(`/api/saveParticipation`, saveParticipationJSON).then((response)=>{
            if(response.ok)
                window.location = `/attemptChallenge/${this.state.cid}${this.state.challenges[0]}`
            else
                this.setState({alertSeverity: "error", alertMsg: "Opps, failed to join course!"})
        })
    }

    doContinue = (event)=>{
        if(this.state.status=="active"){
            fetch(`/api/getLatestSubmission?uid=${this.state.uid}&cid=${this.state.cid}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        window.location = `/attemptChallenge/${this.state.cid}${data}`
                    })
                else if(response.status==404)
                    window.location = `/attemptChallenge/${this.state.cid}${this.state.challenges[0]}`
                else if(response.status==400)
                    this.setState({alertSeverity: "error", alertMsg: "Opps, failed to continue last session!"})
            })
        }
        else if(this.state.status=="deactivated")
            this.setState({alertSeverity: "error", alertMsg: "This course has been deactivated."})
    }

    doHome = (event)=>{
        window.location = "/home"
    }

    getIcon(index){
        // if the course is active
        if(this.state.status=="active"){
            // if no participation then set all lock icon
            if(this.state.mode=="Join")
                return <LockIcon style={{marginRight: "0.5em"}} fontSize="small"/>
            // if participated then set icon based on submission
            else if(this.state.mode=="Continue"){
                // if the challenge >= the passing score
                if(this.state.scoreList[index]>=this.state.passing)
                    return <CheckCircleIcon style={{marginRight: "0.5em"}} fontSize="small"/>
                // if the challenge is first or the previous challenge >= the score
                else if(index==0 || this.state.scoreList[index-1]>=this.state.passing)
                    return <NewReleasesIcon style={{marginRight: "0.5em"}} fontSize="small"/>
                // if the challenge < the score and previous challenge < the score or the challenge has not attempted yet
                else if(this.state.scoreList[index]<this.state.passing && this.state.scoreList[index-1]<this.state.passing || this.state.scoreList[index]=="-")
                    return <LockIcon style={{marginRight: "0.5em"}} fontSize="small"/>
            }
        }
        // if the course is deactivated
        else if(this.state.status=="deactivated"){
            return <RemoveCircleOutlineIcon style={{marginRight: "0.5em"}} fontSize="small"/>
        }
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
                    <Grid container spacing={0} style={{ backgroundColor: '#FFFFFF'+'99', width: '100%'}}>
                        <Box sx={{ width: '96%', mx: 2, my: 2,}}>
                            <Accordion defaultExpanded>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography variant="h6" style={{marginRight: "1em", fontWeight: "700",}}>Title:</Typography>
                                    <Typography variant="h6" style={{wordWrap: "break-word", width:"100%"}}>{this.state.title}</Typography>
                                </AccordionSummary>
                                    {this.state.tags.map((tag, index) => (
                                        <Chip key={index} size="small" label={tag} style={{margin: "0 0.3em 0.5em 1em"}}/>))}
                                <AccordionDetails>
                                    <Typography variant="caption" style={{marginRight: "1em"}}>{`Passing Score`}</Typography>
                                    <Typography variant="body1">{this.state.passing}</Typography>
                                    <Divider orientation="vertical" variant="middle" flexItem />
                                    <Typography variant="caption" style={{marginRight: "1em"}}>{`by`}</Typography>
                                    <Typography variant="body1">{this.state.creator}</Typography>
                                    <Divider orientation="vertical" variant="middle" flexItem />
                                    <Typography variant="caption" style={{marginRight: "1em"}}>{`from`}</Typography>
                                    <Typography variant="body1" >{new Date(this.state.creationdate).toLocaleString()}</Typography>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion defaultExpanded>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography variant="h6" style={{marginRight: "1em", fontWeight: "700",}}>Description:</Typography>
                                </AccordionSummary>
                                <AccordionDetails >
                                    <Typography variant="body1" style={{whiteSpace: 'pre-line', wordWrap: "break-word", width:"100%"}}>
                                        {this.state.desc}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    </Grid>
                </div>
                <div id="rightDiv">
                        <Grid container spacing={0} style={{ backgroundColor: '#FFFFFF'+'99', width: '100%'}}>
                            <Box sx={{ width: '96%', mx: 2, my: 2,}}>
                            <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" style={{fontWeight: "700"}}>
                                            Challenges:</Typography>
                                        <Divider orientation="horizontal" style={{marginTop: "0.7em"}}/>
                                        <List dense component="div" role="list">
                                            {this.state.challengesTitle.map((title, index) => {
                                                const labelId = `transfer-list-item-${index}-label`;
                                                return (
                                                    <ListItem
                                                        key={index}
                                                        role="listitem"
                                                        button
                                                        onClick={()=>this.openChallenge(index)}
                                                        disabled={this.state.status=="deactivated"}
                                                    >
                                                        <ListItemText id={labelId} style={{wordWrap: "break-word", width:"100%"}}>
                                                            <Grid container direction="row" style={{justifyContent: "space-between"}}>
                                                                <Grid item xs={7}>
                                                                    <Typography variant="body1" style={{marginTop: "0.5em", alignItems: 'center', display: "flex"}}>
                                                                        {(this.state.role=="Student")?this.getIcon(index):`${index+1}. `}
                                                                        {`${title}`}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={2} style={{display: (this.state.role=="Student")?"inline":"none"}}>
                                                                    <Typography variant="caption">{`High Score: `}</Typography>
                                                                    <Typography variant="body2">{(this.state.mode=="Join" || this.state.scoreList[index]=="-")?`-`:`${this.state.scoreList[index]}%`}</Typography>
                                                                </Grid>
                                                                <Grid item xs={3} style={{display: (this.state.role=="Student")?"inline":"none"}}>
                                                                    <Typography variant="caption">{`Submitted on: `}</Typography>
                                                                    <Typography variant="body2">
                                                                        {(this.state.mode=="Join" || (this.state.mode=="Continue" && this.state.submissiondateList[index]==""))?
                                                                            `-`:new Date(this.state.submissiondateList[index]).toLocaleString()}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </ListItemText>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                </div>
                <div id="buttonDiv">
                    <Box style={{textAlign: "center", marginTop: "2em"}}>
                        {(this.state.role=="Teacher")?(
                            <Button color="primary" variant="contained" style={{marginRight: "5em"}} onClick={this.doEdit}>
                                {"Edit"}
                            </Button>
                        ):(
                            <Button color="primary" variant="contained" style={{marginRight: "5em"}}
                                onClick={(this.state.mode=="Join")?this.doJoin:this.doContinue}>
                                {this.state.mode}
                            </Button>
                        )}
                        <Button color="secondary" variant="contained" style={{marginLeft: "5em"}} onClick={this.doHome}>
                            {"Home"}
                        </Button>
                    </Box>
                </div>
            </div>
        )
    }
}

export default withParams(ViewCourse)