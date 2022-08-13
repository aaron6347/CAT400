import React, {Component} from "react";
import {Box, Typography, Button, IconButton, Icon, AppBar, Container, Toolbar, Menu, MenuItem, Avatar, Tooltip} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import getCookie from "./getCookie";

const teacherNav = ['Browse Challenges', 'Design New Challenge', 'Manage My Challenges', 'Browse Courses', 'Create New Course', 'Manage My Courses'];
const studentNav = ['Browse Courses', 'View My Participation'];
const settings = ['Profile & Dashboard', 'Log Out'];

export default class Navbar extends Component {
    constructor(props){
        super(props);
        this.state = {
            anchorElNav: null,
            anchorElUser: null,
            pages: [],
            uid: "",
        }
    }

    UNSAFE_componentWillMount(){
        let uid = getCookie(document.cookie, 'uid=')
        this.setState({uid: uid})
        fetch(`/api/getRole?uid=${uid}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    if(data=="Student")
                        this.setState({pages: studentNav})
                    else if(data=="Teacher")
                        this.setState({pages: teacherNav})
                })
            else
                window.location = "/error"
        })
    }

    goHome = (event)=>{
        window.location = "/home"
    }

    openNavMenu = (event)=>{
        this.setState({anchorElNav: event.currentTarget});
    }

    closeNavMenu = (event)=>{
        if(event.currentTarget.value=="Browse Challenges")
            window.location = `/browseChallenges`
        else if(event.currentTarget.value=="Design New Challenge")
            window.location = `/designChallenge`
        else if(event.currentTarget.value=="Manage My Challenges")
            window.location = `/manageChallenges`
        else if(event.currentTarget.value=="Browse Courses") // for both teacher and student
            window.location = `/browseCourses`
        else if(event.currentTarget.value=="Create New Course")
            window.location = `/createCourse`
        else if(event.currentTarget.value=="Manage My Courses")
            window.location = `/manageCourses`
        else if(event.currentTarget.value=="View My Participation")    // student
            window.location = `/viewParticipation`

        this.setState({anchorElNav: null});
    }

    openUserMenu = (event)=>{
        this.setState({anchorElUser: event.currentTarget});
    }

    closeUserMenu = (event, setting)=>{
        if(setting=="Profile & Dashboard")
            console.log("profile not done!")
        else if(setting=="Log Out"){
            document.cookie = `uid=${this.state.uid};expires=Wed, 31 Oct 2012 10:03:00 GMT;path=/`;
            window.location = "/login"
        }
        this.setState({anchorElUser: null});
    }

    render(){
        return (
            <AppBar position="static" style={{ background: '#32C3D5' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters={false}>
                    <IconButton onClick={this.goHome}>
                        <Icon><img src={"../static/images/logo.png"} height={25} width={25}/></Icon>
                    </IconButton>
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={this.openNavMenu}
                            color="inherit">
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={this.state.anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(this.state.anchorElNav)}
                            onClose={this.closeNavMenu}
                            sx={{display: { xs: 'block', md: 'none' },}}>
                            {this.state.pages.map((page) => (
                                <MenuItem key={page} onClick={(event)=>this.closeNavMenu(event)}>
                                    <Typography textalign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', } }}>
                        {this.state.pages.map((page) => (
                        <Button
                            key={page}
                            value={page}
                            onClick={(event)=>this.closeNavMenu(event)}
                            sx={{ my: 2, color: 'white', display: 'block',}}
                            style={{textTransform: 'none'}}>
                        {page}</Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Settings">
                            <IconButton
                              onClick={this.openUserMenu}
                                sx={{ p: 0 }}>
                                <Avatar alt="Blockly" src="/static/images/avatar/2.jpg" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={this.state.anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(this.state.anchorElUser)}
                            onClose={this.closeUserMenu}>
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={(e)=>this.closeUserMenu(e, setting)}>
                                    <Typography textalign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        )
    }
}