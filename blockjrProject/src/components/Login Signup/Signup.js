import React, {Component} from "react";
import {Box, Grid, TextField, Button, FormControlLabel, Switch, Snackbar} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import AccountCircleIcon from "@material-ui/icons/AccountCircleRounded"
import LockRoundedIcon from "@material-ui/icons/LockRounded"
import AlternateEmailRoundedIcon from "@material-ui/icons/AlternateEmailRounded"

export default class Signup extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: "",
            password: "",
            email: "",
            role: "Student",
            roleChange: false,
            gender: "Male",
            genderChange: false,
            alertSeverity: "",
            alertMsg: "",
        };
    }

    setUsername = (event)=>{
        this.setState({username: event.target.value})
    }

    setPassword = (event)=>{
        this.setState({password: event.target.value})
    }

    setEmail = (event)=>{
        this.setState({email: event.target.value})
    }

    setRole = (event)=>{
        this.setState({roleChange: !this.state.roleChange})
        if(this.state.role=="Student")
            this.setState({role: "Teacher"})
        else
            this.setState({role: "Student"})
    }

    setGender = (event)=>{
        this.setState({genderChange: !this.state.genderChange})
        if(this.state.gender=="Male")
            this.setState({gender: "Female"})
        else
            this.setState({gender: "Male"})
    }

    doSignup = (event)=>{
        if(this.state.username=="")
            this.setState({alertSeverity: "error", alertMsg: "Username cannot be empty!"})
        else if(this.state.password=="")
            this.setState({alertSeverity: "error", alertMsg: "Password cannot be empty!"})
        else if(this.state.email=="")
            this.setState({alertSeverity: "error", alertMsg: "Email cannot be empty!"})
        else{
            const signupJSON = {
                method: "POST",
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password,
                    email: this.state.email,
                    role: this.state.role,
                    gender: this.state.gender,
                }),
            };
            fetch('/api/signup', signupJSON).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        document.cookie = `uid=${data['uid']}`
                        window.location = "/home"
                    })
                else if(response.status==406)
                    this.setState({alertSeverity: "error", alertMsg: "Username has been taken!"})
                else if(response.status==400)
                    this.setState({alertSeverity: "error", alertMsg: "Opps, failed to sign up!"})
            })
        }
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
                    <Box sx={{ maxWidth: '90%', mb: 2,}}>
                        <LockRoundedIcon style={{fontSize: '3.25em', marginRight: '1em'}}/>
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
                    <Box sx={{ maxWidth: '90%', mb: 2,}}>
                        <AlternateEmailRoundedIcon style={{fontSize: '3.25em', marginRight: '1em'}}/>
                        <TextField
                            inputProps={{maxLength: 40}}
                            required={true}
                            onChange={this.setEmail}
                            type="text"
                            label="Email"
                            variant="outlined"/>
                    </Box>
                </Grid>
                <Grid item xs={12} align="center">
                    <Box sx={{ maxWidth: '90%', mb: 2,}}>
                        <Grid component="label" container alignItems="center" justifyContent="center">
                            <Grid item style={{marginRight: "1em", }} >
                                <Box component="span" fontWeight= {(this.state.role=="Student"?"600":"400")}>
                                    Student
                                </Box></Grid>
                            <Grid item>
                                <FormControlLabel control={<Switch checked={this.state.roleChange} onChange={this.setRole} />}/>
                            </Grid>
                            <Grid item>
                                <Box component="span" fontWeight= {(this.state.role=="Teacher"?"600":"400")}>
                                    Teacher
                                </Box></Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item xs={12} align="center">
                    <Box sx={{ maxWidth: '90%', mb: 5,}}>
                        <Grid component="label" container alignItems="center" justifyContent="center">
                            <Grid item style={{marginRight: "1em", }} >
                                <Box component="span" fontWeight= {(this.state.gender=="Male"?"600":"400")}>
                                    Male
                                </Box></Grid>
                            <Grid item>
                                <FormControlLabel control={<Switch checked={this.state.genderChange} onChange={this.setGender} />}/>
                            </Grid>
                            <Grid item>
                                <Box component="span" fontWeight= {(this.state.gender=="Female"?"600":"400")}>
                                    Female
                                </Box></Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item xs={12} align="center">
                    <Box component="form" sx={{ maxWidth: '100%',}}>
                        <Button value="signup" color="secondary" variant="contained" onClick={this.doSignup}>Sign up</Button>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}