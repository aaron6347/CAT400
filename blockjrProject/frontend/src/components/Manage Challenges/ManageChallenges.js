import React, {Component} from "react";
import {Grid, Box} from "@material-ui/core";
import getCookie from "../getCookie"
import Navbar from "../Navbar";
import ManageChallengesTable from "./ManageChallengesTable";

export default class ManageChallenges extends Component {
    constructor(props){
        super(props);
    }

    render(){
        let uid = getCookie(document.cookie, "uid=")
        return (
            <div><Navbar/>
                <Grid container spacing={0}>
                    <Grid item xs={12} align="left">
                        <Box component="form" sx={{ maxWidth: '100%', mt: 5,}}>
                            <ManageChallengesTable uid={uid}/>
                        </Box>
                    </Grid>
                </Grid>
            </div>
        )
    }
}