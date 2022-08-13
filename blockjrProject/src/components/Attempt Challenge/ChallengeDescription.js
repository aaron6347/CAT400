import React, {Component} from "react";
import {Grid, Box, Switch, Accordion, AccordionSummary, AccordionDetails, Typography, Divider} from "@material-ui/core";
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
            title: "",
            difficulty: "",
            creator: "",
            creationdate: "",
            desc: "",
            hint: "",
            showHint: false,
        }
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

    componentDidMount(){
        fetch(`/api/getDesign?did=${this.props.did}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    this.setState({
                        title: data['title'],
                        difficulty: data['difficulty'],
                        creator: data['creator'],
                        creationdate: data["creationdate"],
                        desc: data['desc'],
                        hint: data['hint'],
                    })
                })
            else 
                window.location = "/error"
        })
    }

    render(){
        const {classes} = this.props;
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
                            <Typography variant="h6">{this.state.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1">{this.state.difficulty}</Typography>
                            <Divider orientation="vertical" variant="middle" flexItem />
                            <Typography variant="caption" style={{marginRight: "1em"}}>{`by`}</Typography>
                            <Typography variant="body1">{this.state.creator}</Typography>
                            <Divider orientation="vertical" variant="middle" flexItem />
                            <Typography variant="caption" style={{marginRight: "1em"}}>{`from`}</Typography>
                            <Typography variant="body1">{new Date(this.state.creationdate).toLocaleString()}</Typography>
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
                            <Typography variant="body1" style={{whiteSpace: 'pre-line', wordWrap: "break-word", width:"100%"}}>
                                {this.state.desc}</Typography>
                        </AccordionDetails>
                    </Accordion>
                            
                    <Accordion expanded={this.state.showHint}>
                        <AccordionSummary
                            classes={{ content: classes.content, expanded: classes.expanded }}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                            expandIcon={<Switch checked={this.state.showHint} color="primary" onChange={this.showHint}/>}
                        >
                            <Typography variant="h6" style={{marginRight: "1em", fontWeight: "700",}}>Hint:</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" style={{whiteSpace: 'pre-line', wordWrap: "break-word", width:"100%"}} hidden={!this.state.showHint}>
                                {this.state.hint}</Typography>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Grid>
        )
    }
}

export default withStyles(styles)(ChallengeDescription)