import React, {Component} from "react";
import {Box, Grid, TextField, Button, Snackbar} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import AccountCircleIcon from "@material-ui/icons/AccountCircleRounded"
import LockIcon from "@material-ui/icons/LockTwoTone"

export default class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: null,
            password: null,
            alertSeverity: "",
            alertMsg: "",
        };
    }

    setUsername = (event)=>{
        this.setState({username: event.target.value,})
    }

    setPassword = (event)=>{
        this.setState({password: event.target.value,})
    }

    doLogin = (event)=>{
        const loginJSON = {
            method: "POST",
            headers: {"Content-Type": 'application/json'},
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
            }),
        };
        fetch('/api/login', loginJSON).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    document.cookie = `uid=${data}`
                    window.location = "/home"
                })
            else if(response.status==404)
                this.setState({alertSeverity: "error", alertMsg: "Wrong credential!"})
            else if(response.status==400)
                this.setState({alertSeverity: "error", alertMsg: "Opps, failed to login!"})
        })
    }

    closeAlert = (event, reason)=>{
        if (reason === 'clickaway')
            return;
        this.setState({alertMsg: ""})
    };

    render(){
        return (
            <Grid container spacing={0}>
                <Snackbar open={this.state.alertMsg!=""} autoHideDuration={4000} onClose={this.closeAlert} anchorOrigin={{ vertical: "bottom",  horizontal: "left" }}>
                    <Alert variant="filled" onClose={this.closeAlert} severity={this.state.alertSeverity}>{this.state.alertMsg}</Alert>
                </Snackbar>
                <Grid item xs={12} align="center">
                    <Box sx={{ maxWidth: '90%', mt: 5, mb: 2,}}>
                        <AccountCircleIcon style={{fontSize: '3.25em', marginRight: '1em'}}/>
                        <TextField
                            inputProps={{maxLength: 20}}
                            required={true}
                            onChange={this.setUsername}
                            type="text"
                            label="Username"
                            variant="outlined"/>
                    </Box>
                </Grid>
                <Grid item xs={12} align="center">
                    <Box sx={{ maxWidth: '90%', mb: 5,}}>
                        <LockIcon style={{fontSize: '3.25em', marginRight: '1em'}}/>
                        <TextField
                            inputProps={{maxLength: 20}}
                            required={true}
                            onChange={this.setPassword}
                            type="password"
                            label="Password"
                            variant="outlined"/>
                    </Box>
                </Grid>
                <Grid item xs={12} align="center">
                    <Box component="form" sx={{ maxWidth: '100%',}}>
                        <Button value="login" color="primary" variant="contained" onClick={this.doLogin}>Log in</Button>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}