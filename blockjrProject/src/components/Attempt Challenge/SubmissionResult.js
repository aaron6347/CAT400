import React, {Component} from "react";
import {Grid, Box, Accordion, AccordionSummary, AccordionDetails, Typography, Button, Divider} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"

export default class SubmissionResult extends Component {
    constructor(props){
        super(props);
    }

    changeWorkspace = (workspace, event)=>{
        var xml = Blockly.Xml.textToDom(workspace);
        this.props.workspace.clear()
        Blockly.Xml.appendDomToWorkspace(xml, this.props.workspace);
    }

    render(){
        return (
            <Grid container spacing={0} style={{ backgroundColor: '#FFFFFF'+'99', width: '100%'}}>
                <Box sx={{ width: '96%', mx: 2, my: 2,}}>
                    {this.props.submissionObj.map((submission, index)=>{
                        return(
                            <Accordion key={submission["sid"]}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Grid container direction="row" style={{justifyContent: "space-between"}}>
                                        <Typography variant="h6">{new Date(submission["submissiondate"]).toLocaleString()}</Typography>
                                        <Typography variant="h6">{`Scores: ${submission["score"]}%`}</Typography>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails >
                                    <Box sx={{ width: '100%'}}>
                                        <Typography variant="h6" style={{whiteSpace: 'pre-line',}}>
                                            {`Submission:`}</Typography>
                                        <Divider orientation="horizontal" style={{margin: "0em 1em 0.5em 0"}}/>
                                        <Typography variant="body1" style={{whiteSpace: 'pre-line',}}>
                                            {submission["translation"]}</Typography>
                                        <Typography variant="h6" style={{whiteSpace: 'pre-line',}}>
                                            {`\nFeedback:`}</Typography>
                                        <Divider orientation="horizontal" style={{margin: "0em 1em 0.5em 0"}}/>
                                        <Typography variant="body1" style={{whiteSpace: 'pre-line',}}>
                                            {submission["feedback"]}</Typography>
                                        <Divider orientation="horizontal" style={{margin: "1em 1em 0.5em 0"}}/>
                                        <Button color="primary" variant="contained" onClick={()=>this.changeWorkspace(submission["workspace"])}>
                                            {"Display Submission"}</Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        )
                    })}
                </Box>
            </Grid>
        )
    }
}
