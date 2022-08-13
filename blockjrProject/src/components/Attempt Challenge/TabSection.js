import * as React from 'react';
import PropTypes from 'prop-types';
import {Box, Tab, Tabs} from "@material-ui/core";
import ChallengeDescription from './ChallengeDescription';
import SubmissionResult from './SubmissionResult';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}>
            {value === index && (
                <Box sx={{ paddingTop: 12}}>
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
        <Box sx={{ width: '100%'}}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Challenge Description" {...a11yProps(0)} />
                    <Tab label="Submission Result" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <ChallengeDescription did={props.did}/>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <SubmissionResult submissionObj={props.submissionObj} workspace={props.workspace}/>
            </TabPanel>
        </Box>
    );
}
