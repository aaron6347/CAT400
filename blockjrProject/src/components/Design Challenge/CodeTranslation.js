import React, {Component} from "react";
import {Grid, TextField, Box} from "@material-ui/core";

export default class CodeTranslation extends Component {
    constructor(props){
        super(props);
        this.state={
            translation: "No code block to translate.",
        }
    }

    componentDidMount(){
        this.props.workspace.addChangeListener(this.changeWorkspace)
        if (this.props.workspace.getTopBlocks().length != 0)
            this.changeWorkspace()
    }

    changeWorkspace = (event)=>{
        var xml = Blockly.Xml.workspaceToDom(this.props.workspace);
        this.translation(Blockly.Xml.domToPrettyText(xml))
    }

    translation(workspace){
        const translationJSON = {
            method: "POST",
            headers: {"Content-Type": 'application/json'},
            body: JSON.stringify({
                workspace: workspace,
            }),
        };
        fetch(`/api/getTranslation`, translationJSON).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    this.setState({translation: data['translation']})
                })
            else
                this.setState({translation: "No code block to translate."})
        })
    }

    render(){
        return (
            <Grid container spacing={0} style={{ backgroundColor: '#FFFFFF'+'99', width: '100%'}}>
                <Grid item xs={12} align="left">
                    <Box sx={{ maxWidth: '98%', mx: 1, my: 1,}}>
                        <TextField
                            InputProps={{
                                readOnly: true,
                                style: {fontFamily: "consolas",}}}
                            fullWidth
                            multiline
                            minRows={24}
                            maxRows={24}
                            value={this.state.translation}
                            type="text"
                            id="multiline-static"
                            variant="filled"
                        />
                    </Box>
                </Grid>
            </Grid>
        )
    }
}
