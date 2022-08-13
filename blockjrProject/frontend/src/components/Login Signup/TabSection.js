import * as React from 'react';
import PropTypes from 'prop-types';
import {Box, Tab, Tabs, Grid, Typography, Icon, Divider} from "@material-ui/core";
import Login from "./Login"
import Signup from "./Signup"

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}>
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}
  
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function TabSection(props) {
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div>
            <Box style={{backgroundColor: '#3BCDFD'+'95', padding: "1em", }}>
                <Typography  align="center" variant="h5" >
                    {`Welcome to blockJr `}
                    <Icon><img src={"../static/images/logo.png"} height={21} width={21}/></Icon>
                </Typography>
            </Box>
        <Grid container spacing={0} alignItems="center" justifyContent="center" style={{minHeight: '100vh'}}>
            <Box style={{backgroundColor: '#3DCCDE'+'90', padding: "1em", width: "30%"}}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Log In" {...a11yProps(0)} />
                    <Tab label="Create Account" {...a11yProps(1)} />
                </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <Login/>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <Signup/>
                </TabPanel>
            </Box>
        </Grid>
        </div>
    );
}

