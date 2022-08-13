import React, {Component} from "react";
import {Grid, Box, Typography, Button} from "@material-ui/core";
import getCookie from "./getCookie";

export default class Error extends Component {
    constructor(props){
        super(props);
    }

    UNSAFE_componentWillMount(){
        let uid = getCookie(document.cookie, 'uid=')
        document.cookie = `uid=${uid};expires=Wed, 31 Oct 2012 10:03:00 GMT;path=/`;
    }

    render(){
        return (
            <div>
                <Grid container spacing={0} alignItems="center" justifyContent="center" style={{minHeight: '90vh'}}>
                    <Box style={{backgroundColor: '#3BCDFD'+'80', padding: "2em", width: "50%"}} textAlign= "center">
                        <Typography  align="center" variant="h4" style={{wordWrap: "break-word"}} >{`Opps, something went wrong!`}</Typography>
                        <Button color="primary" variant="contained" style={{marginTop: "3em"}} onClick={()=>window.location="/login"}>
                            {"Relogin"}</Button>
                    </Box>
                </Grid>
            </div>
        )
    }
}