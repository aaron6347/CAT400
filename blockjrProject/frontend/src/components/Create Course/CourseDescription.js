import React, {Component} from "react";
import {Grid, Box, TextField, Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Slider} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import TagsInput from "./TagsInput";

export default class CourseDescription extends Component {
    constructor(props){
        super(props);
        this.state = {
            cid: "",
            title: "",
            tags: [],
            passing: 0,
            creator: "",
            desc: "",
            creationdate: "",
        }
    }

    componentDidMount(){
        // if create mode then get username and set creator
        if(this.props.cid==undefined){
            fetch(`/api/getUsername?uid=${this.props.uid}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        this.setState({creator: data})
                    })
                else
                    window.location = "/error"
            })
        }
        // if edit mode or saved after create mode then get all course data
        else if(this.props.cid!="" || this.state.cid!=""){
            let cid = (this.props.cid!="")?this.props.cid:this.state.cid
            fetch(`/api/getCourse?cid=${cid}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        this.setState({
                            cid: data['courseData']['cid'],
                            title: data['courseData']['title'],
                            tags: data['courseData']['tags'],
                            passing: data['courseData']['passing'],
                            creator: data['courseData']['creator'],
                            desc: data['courseData']['desc'],
                            creationdate: data['courseData']['creationdate'],
                        })
                    })
                else 
                    window.location = "/error"
            })
        }
    }

    // update data to parent CreateCourse
    componentDidUpdate(){
        this.props.setCourseObj(this.state)
    }
    
    setTitle = (event)=>{
        this.setState({title: event.target.value})
    }

    setTags = (event, tags)=>{
        this.setState({tags: tags})
    }
    
    handleSlider = (event, newValue)=>{
        this.setState({passing: newValue})
    }

    setPassing = (event, passing)=>{
        this.setState({passing: event.target.value})
    }

    setDescription = (event)=>{
        this.setState({desc: event.target.value})
    }

    render(){
        return (
            <Grid container spacing={0} style={{ backgroundColor: '#FFFFFF'+'99', width: '100%'}}>
                <Box sx={{ width: '96%', mx: 2, my: 2,}}>
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography variant="h6" style={{marginRight: "1em", fontWeight: "700",}}>Title:</Typography>
                            <TextField
                                onClick={(event) => event.stopPropagation()}
                                onFocus={(event) => event.stopPropagation()}
                                inputProps={{maxLength: 30}}
                                fullWidth
                                required={true}
                                onChange={this.setTitle}
                                value={this.state.title}
                                type="text"
                                variant="standard"
                                placeholder="Insert Title"/>
                        </AccordionSummary>
                            <Box style={{margin: "0 0 1em 1em"}}>
                                <TagsInput setTags={this.setTags} tags={this.state.tags}/>
                            </Box>
                        <AccordionDetails>
                            <Box style={{width: "10em"}}>
                                <TextField fullWidth required label="Passing Score" value={this.state.passing} onChange={this.setPassing}
                                    inputProps={{step: 10, min: 0, max: 100, type: 'number'}}/>
                                <Slider value={this.state.passing} onChange={this.handleSlider}/>
                            </Box>
                            <Divider orientation="vertical" variant="middle" flexItem />
                            <Typography variant="caption" style={{marginTop: "1.2em", marginRight: "1em"}}>{`by`}</Typography>
                            <Typography variant="body1" style={{marginTop: "1.2em"}}>{this.state.creator}</Typography>
                            <Divider orientation="vertical" variant="middle" flexItem style={{display: (this.state.creationdate!="")?"inline":"none"}}/>
                            <Typography variant="caption" style={{marginTop: "1.2em", marginRight: "1em", display: (this.state.creationdate!="")?"inline":"none"}}>
                                {`from`}</Typography>
                            <Typography variant="body1" style={{marginTop: "1.2em", display: (this.state.creationdate!="")?"inline":"none"}}>
                                {new Date(this.state.creationdate).toLocaleString()}</Typography>
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
                            <TextField
                                inputProps={{maxLength: 1000}}
                                fullWidth
                                multiline
                                minRows={15}
                                maxRows={15}
                                required={true}
                                value={this.state.desc}
                                onChange={this.setDescription}
                                type="text"
                                variant="outlined"
                                placeholder="Insert Description"/>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Grid>
        )
    }
}
