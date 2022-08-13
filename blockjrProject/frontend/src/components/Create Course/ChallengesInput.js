import React, {Component} from "react";
import {Grid, List, ListItem, ListItemIcon, ListItemText, Checkbox, Button, Card, CardHeader, Divider, Snackbar} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {withStyles} from '@material-ui/core/styles';

const styles = (theme) =>({
    listItemText:{
        fontSize:'0.8em',
    },
    button:{
        marginBottom: "1em",
        backgroundColor: '#FFFFFF',
        fontWeight: "900"
    }
});

class ChallengesInput extends Component {
    constructor(props){
        super(props);
        this.state = {
            checked: [],
            left: [],
            right: [],
            designObj: [],
            leftChecked: [],
            rightChecked: [],
            alertSeverity: "",
            alertMsg: "",
        }
    }

    // for refer usage in did -> challenges' title
    setDesignObj = (designObj, event)=>{
        this.setState({designObj: designObj})
    }

    setLeft = (left, event)=>{
        this.setState({left: left})
    }

    setRight = (right, event)=>{
        this.setState({right: right})
    }

    // to set or clear checked, leftchecked and rightchecked
    setChecked = (newChecked, event)=>{
        this.setState({checked: newChecked})
        this.setState({leftChecked: this.intersection(newChecked, this.state.left)})
        this.setState({rightChecked: this.intersection(newChecked, this.state.right)})
    }

    not = (a, b)=>{
        return a.filter((value) => b.indexOf(value) === -1);
    }
    
    intersection = (a, b) => {
        return a.filter((value) => b.indexOf(value) !== -1);
    }

    componentDidMount(){
        // if create mode then get all challenges and set as left
        if(this.props.cid==undefined){
            fetch(`/api/getDesign?uid=${this.props.uid}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        let didList = []
                        data['designData'].map((data)=>didList.push(data.did))
                        this.setLeft(didList)
                        this.setDesignObj(data['designData'])
                    })
                else if (response.status==404)
                    this.setState({alertSeverity: "error", alertMsg: "Opps, you have no coding challenge to create coding course."})
                else if(response.status==400)
                    window.location = "/error"
            })
        }
        // if edit mode then get all challenges and selected challenges and set as left and right 
        else if(this.props.cid!=undefined){
            var didList = [];
            fetch(`/api/getDesign?uid=${this.props.uid}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        data['designData'].map((data)=>didList.push(data.did))
                        this.setDesignObj(data['designData'])
                    })
                else if (response.status==404)
                    this.setState({alertSeverity: "error", alertMsg: "Opps, you have no coding challenge to create coding course."})
                else if(response.status==400)
                    window.location = "/error"
            })
            fetch(`/api/getCourse?cid=${this.props.cid}`).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        this.setRight(data['courseData']['challenges'])
                        this.setLeft(this.not(didList, data['courseData']['challenges']))
                        this.props.setChallenges(data['courseData']['challenges'])
                    })
                else
                    window.location = "/error"
            })
        }
    }
    
    giveDisplayTitle = (designObj, value)=>{
        for (var row of Object.keys(designObj))
            if (designObj[row].did == value)
                return designObj[row].title
    }

    giveTitle = (designObj, right)=>{
        let title = [];
        for (var ind = 0; ind < right.length; ind++)
            for (var row of Object.keys(designObj))
                if (designObj[row].did == right[ind]){
                    title.push(designObj[row].title)
                    break;
                }
        return title
    }

    handleToggle = (did, event)=>{
        const currentIndex = this.state.checked.indexOf(did);
        const newChecked = [...this.state.checked];
        if (currentIndex === -1) {
            newChecked.push(did);
        } 
        else {
            newChecked.splice(currentIndex, 1);
        }
        this.setChecked(newChecked);
    }

    handleAllRight = (event)=>{
        this.props.setChallenges(this.state.right.concat(this.state.left))
        this.setRight(this.state.right.concat(this.state.left));
        this.setLeft([]);
        this.setChecked([]);
    }

    handleCheckedRight = (event)=>{
        this.props.setChallenges(this.state.right.concat(this.state.leftChecked))
        this.setRight(this.state.right.concat(this.state.leftChecked));
        this.setLeft(this.not(this.state.left, this.state.leftChecked));
        this.setChecked(this.not(this.state.checked, this.state.leftChecked));
    }

    handleCheckedLeft = (event)=>{
        this.props.setChallenges(this.not(this.state.right, this.state.rightChecked))
        this.setLeft(this.state.left.concat(this.state.rightChecked));
        this.setRight(this.not(this.state.right, this.state.rightChecked));
        this.setChecked(this.not(this.state.checked, this.state.rightChecked));
    }

    handleAllLeft = (event)=>{
        this.props.setChallenges([])
        this.setLeft(this.state.left.concat(this.state.right));
        this.setRight([]);
        this.setChecked([]);
    }

    customList = (challengesDid, header, classes) => (
        <Card>
            <CardHeader title={header} style={{textAlign: 'center'}}/>
            <Divider/>
            <List dense component="div" role="list" style={{width: "300px"}}>
                {challengesDid.map((value) => {
                    const labelId = `transfer-list-item-${value}-label`;
                    return (
                        <ListItem
                            key={value}
                            role="listitem"
                            button
                            onClick={()=>this.handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    disabled
                                    size='small'
                                    checked={this.state.checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{'aria-labelledby': labelId}}/>
                            </ListItemIcon>
                            <ListItemText id={labelId} style={{wordWrap: "break-word", width:"100%"}}
                                className={classes.listItemText} disableTypography>
                                {this.giveDisplayTitle(this.state.designObj, value)}</ListItemText>
                        </ListItem>
                    );
                })}
            </List>
        </Card>
    );

    closeAlert = (event, reason)=>{
        if (reason === 'clickaway')
            return;
        this.setState({alertMsg: ""})
    };

    render(){
        const {classes} = this.props;
        return (
            <Grid container spacing={1} justifyContent="center" alignItems="center">
                <Snackbar open={this.state.alertMsg!=""} autoHideDuration={4000} onClose={this.closeAlert} anchorOrigin={{ vertical: "bottom",  horizontal: "left" }}>
                    <Alert variant="filled" onClose={this.closeAlert} severity={this.state.alertSeverity}>{this.state.alertMsg}</Alert>
                </Snackbar>
                <Grid item>{this.customList(this.state.left, "Available Challenges", {classes})}</Grid>
                <Grid item>
                    <Grid container direction="column" alignItems="center">
                        <Button variant="outlined" size="medium" onClick={this.handleAllRight} className={classes.button}
                            disabled={this.state.left.length === 0} aria-label="move all right"
                        >≫ </Button>
                        <Button variant="outlined" size="medium" onClick={this.handleCheckedRight} className={classes.button}
                            disabled={this.state.leftChecked.length === 0} aria-label="move selected right"
                        >&gt; </Button>
                        <Button variant="outlined" size="medium" onClick={this.handleCheckedLeft} className={classes.button}
                            disabled={this.state.rightChecked.length === 0} aria-label="move selected left"
                        >&lt; </Button>
                        <Button variant="outlined" size="medium" onClick={this.handleAllLeft} className={classes.button}
                            disabled={this.state.right.length === 0} aria-label="move all left"
                        >≪</Button>
                    </Grid>
                </Grid>
                <Grid item>{this.customList(this.state.right, "Added", {classes})}</Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(ChallengesInput)