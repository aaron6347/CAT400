import React, {Component} from "react";
import {Grid, Box, Typography} from "@material-ui/core";
import Navbar from "./Navbar";
import getCookie from "./getCookie";

export default class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: "",
        }
    }

    UNSAFE_componentWillMount(){
        let uid = getCookie(document.cookie, "uid=")
        fetch(`/api/getUsername?uid=${uid}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    this.setState({username: data})
                })
            else 
                window.location = "/error"
        })
    }

    render(){
        return (
            <div><Navbar/>
                <Grid container spacing={0} alignItems="center" justifyContent="center" style={{minHeight: '90vh'}}>
                    <Box style={{backgroundColor: '#3BCDFD'+'80', padding: "4em", width: "70%",}}>
                        <Typography  align="center" variant="h1" style={{wordWrap: "break-word"}} >{`Welcome back ${this.state.username}!`}</Typography>
                    </Box>
                </Grid>
            </div>
        )
    }
}