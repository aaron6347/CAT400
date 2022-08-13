import React, {Component} from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import TabSection from "./Login Signup/TabSection";
import Home from "./Home";
import BrowseChallenges from "./Browse Challenges/BrowseChallenges";
import ViewChallenge from "./View Challenge/ViewChallenge";
import DesignChallenge from "./Design Challenge/DesignChallenge";
import ManageChallenges from "./Manage Challenges/ManageChallenges";
import BrowseCourses from "./Browse Courses/BrowseCourses";
import ViewCourse from "./View Course/ViewCourse";
import CreateCourse from "./Create Course/CreateCourse";
import ManageCourses from "./Manage Courses/ManageCourses";
import AttemptChallenge from "./Attempt Challenge/AttemptChallenge";
import ViewParticipation from "./View Participation/ViewParticipation";
import Error from "./Error";

export default class Routing extends Component {
    constructor(props){
        super(props);
    }
    
    render(){
        return (
            <Router>
                <Routes>
                    {/* User */}
                    <Route path="/login/*" element={<TabSection/>}/>
                    <Route path="/home/*" element={<Home/>}/>


                    {/* Design */}
                    <Route path="/browseChallenges/*" element={<BrowseChallenges/>}/>
                    <Route path="/viewChallenge/:did" element={<ViewChallenge/>}/>
                    <Route path="/designChallenge/*" element={<DesignChallenge/>}/>
                    <Route path="/designChallenge/:did" element={<DesignChallenge/>}/>
                    <Route path="/manageChallenges/*" element={<ManageChallenges/>}/>


                    {/* Course */}
                    <Route path="/browseCourses/*" element={<BrowseCourses/>}/>     {/* teacher and student */}
                    <Route path="/viewCourse/:cid" element={<ViewCourse/>}/>    {/* teacher and student */}
                    <Route path="/createCourse/*" element={<CreateCourse/>}/>
                    <Route path="/createCourse/:cid" element={<CreateCourse/>}/>
                    <Route path="/manageCourses/*" element={<ManageCourses/>}/>
                    <Route path="/attemptChallenge/:params" element={<AttemptChallenge/>}/>  {/* student  */}


                    {/* Participation */}
                    <Route path="/viewParticipation/*" element={<ViewParticipation/>}/> {/* student  */}

                    
                    <Route path="/error/*" element={<Error/>}/>
                </Routes>
            </Router>
        )
    }
}

