import React, {Component} from "react";
import {Grid, TextField, MenuItem, Select, InputLabel, FormControl, Box, Switch, Accordion, AccordionSummary, AccordionDetails,
    Typography, Divider} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"

const styles = (theme) =>({
    expanded: {
        '&$expanded': {
            transform: "rotate(0)",
        },
    },
    content: {},
});

class ChallengeDescription extends Component {
    constructor(props){
        super(props);
        this.state = {
            did: "",    // to refer if it is saved after create mode
            title: "",
            difficulty: "",
            creator: "",
            desc: "",
            hint: "",
            showHint: true,
            creationdate: "",
        }
    }

    componentDidMount(){
        // if create mode then get username and set creator
        if(this.props.did==undefined){
            fetch(`/api/getUsername?uid=${this.props.uid}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        this.setState({creator: data})
                    })
                else 
                    window.location = "/error"
            })
        }
        // if edit mode or saved after create mode then get all design data
        else if(this.props.did!="" || this.state.did!=""){
            let did = (this.props.did!="")?this.props.did:this.state.did
            fetch(`/api/getDesign?did=${did}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        this.setState({
                            did: data['did'],
                            title: data['title'],
                            difficulty: data['difficulty'],
                            creator: data['creator'],
                            desc: data['desc'],
                            hint: data['hint'],
                            creationdate: data['creationdate'],
                        })
                        var xml = Blockly.Xml.textToDom(data['workspace']);
                        this.props.workspace.clear()
                        Blockly.Xml.appendDomToWorkspace(xml, this.props.workspace);
                    })
                else 
                    window.location = "/error"
            })
        }
    }

    // update data to parent DesignChallenge
    componentDidUpdate(){
        this.props.setDesignObj(this.state)
    }

    setTitle = (event)=>{
        this.setState({title: event.target.value})
    }

    setDifficulty = (event)=>{
        this.setState({difficulty: event.target.value})
    }
    
    setDescription = (event)=>{
        this.setState({desc: event.target.value})
    }

    showHint = (event)=>{
        this.setState({showHint: !this.state.showHint})
    }

    setHint = (event)=>{
        this.setState({hint: event.target.value})
    }

    render(){
        const {classes} = this.props
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
                        <AccordionDetails>
                            <FormControl required={true} style={{width: "7em"}}>
                                <InputLabel>Difficulty</InputLabel>
                                <Select
                                    id="demo-simple-select"
                                    value={this.state.difficulty}
                                    onChange={this.setDifficulty}
                                >
                                    <MenuItem value={"Easy"}>Easy</MenuItem>
                                    <MenuItem value={"Medium"}>Medium</MenuItem>
                                    <MenuItem value={"Hard"}>Hard</MenuItem>
                                </Select>
                            </FormControl>
                            <Divider orientation="vertical" variant="middle" flexItem />
                            <Typography variant="caption" style={{marginTop: "1.5em", marginRight: "1em"}}>{`by`}</Typography>
                            <Typography variant="body1" style={{marginTop: "1.5em"}}>{this.state.creator}</Typography>
                            <Divider orientation="vertical" variant="middle" flexItem style={{display: (this.state.creationdate!="")?"inline":"none"}}/>
                            <Typography variant="caption" style={{marginTop: "1.5em", marginRight: "1em", display: (this.state.creationdate!="")?"inline":"none"}}>
                                {`from`}</Typography>
                            <Typography variant="body1" style={{marginTop: "1.5em", display: (this.state.creationdate!="")?"inline":"none"}}>
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
                        <AccordionDetails>
                            <TextField
                                inputProps={{maxLength: 1000}}
                                fullWidth
                                multiline
                                minRows={10}
                                maxRows={10}
                                required={true}
                                value={this.state.desc}
                                onChange={this.setDescription}
                                type="text"
                                variant="outlined"
                                placeholder="Insert Description"/>
                        </AccordionDetails>
                    </Accordion>
                            
                    <Accordion expanded={this.state.showHint}>
                        <AccordionSummary
                            classes={{content: classes.content, expanded: classes.expanded}}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                            expandIcon={<Switch checked={this.state.showHint} color="primary" onChange={this.showHint}/>}
                        >
                            <Typography variant="h6" style={{marginRight: "1em", fontWeight: "700",}}>Hint:</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                inputProps={{maxLength: 1000}}
                                fullWidth
                                multiline
                                maxRows={5}
                                minRows={5}
                                value={this.state.hint}
                                onChange={this.setHint}
                                type="text"
                                variant="outlined"
                                placeholder="Insert Hint"/>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Grid>
        )
    }
}

export default withStyles(styles)(ChallengeDescription)