import React, {Component} from "react";
import {Grid, Box} from "@material-ui/core";
import Navbar from "../Navbar";
import BrowseCoursesTable from "./BrowseCoursesTable";

export default class BrowseCourses extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div><Navbar/>
                <Grid container spacing={0}>
                    <Grid item xs={12} align="left">
                        <Box component="form" sx={{ maxWidth: '100%', mt: 5,}}>
                            <BrowseCoursesTable/>
                        </Box>
                    </Grid>
                </Grid>
            </div>
        )
    }
}