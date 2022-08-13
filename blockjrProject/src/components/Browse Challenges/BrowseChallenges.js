import React, {Component} from "react";
import {Grid, Box} from "@material-ui/core";
import Navbar from "../Navbar";
import BrowseChallengesTable from "./BrowseChallengesTable";

export default class BrowseChallenges extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div><Navbar/>
                <Grid container spacing={1}>
                    <Grid item xs={12} align="left">
                        <Box component="form" sx={{ maxWidth: '100%', mt: 5,}}>
                            <BrowseChallengesTable/>
                        </Box>
                    </Grid>
                </Grid>
            </div>
        )
    }
}