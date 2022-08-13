import * as React from 'react';
import PropTypes from 'prop-types';
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Checkbox, TableSortLabel,
    Toolbar, Typography, IconButton, Tooltip, Snackbar, Button, CircularProgress} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {alpha, withStyles} from '@material-ui/core/styles';
import DeleteIcon from "@material-ui/icons/Delete"

const styles = (theme) =>({
    header: {
        "& .MuiTableCell-head": {
            color: "black",
            backgroundColor: "#D8C3F6",
            fontWeight: 700,
        },
    },
    subheader: {
      color: "black",
      backgroundColor: "#CBA8FD",
    }
});

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'?(a, b)=>descendingComparator(a, b, orderBy):(a, b)=>-descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    {id: 'title', label: 'Title'},
    {id: 'difficulty', label: 'Difficulty'},
    {id: 'creator', label: 'Created by'},
    {id: 'creationdate', label: 'Created on'},
    {id: 'score', label: 'Average Score'},
    {id: 'submission', label: 'Total Submission'},
];

function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow style={{"height": '35px'}}>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" display="none">
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
    const {numSelected, classes, deleteChallenges} = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                bgcolor: (theme) =>
                    alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
            className={classes.subheader}
        >
            {numSelected > 0 ? (
                <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
                {numSelected} selected</Typography>
            ):(
                <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                Coding Challenges Management</Typography>
            )}
            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton onClick={deleteChallenges}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ):("")}
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

function ManageChallengesTable(props) {
    const {classes} = props;
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('did');
    const [selected, setSelected] = React.useState([]);
    const [rowsPerPage, setRowsPerPage] = React.useState(0);
    const [table, setTable] = React.useState([]);
    const [displayAlert, setDisplayAlert] = React.useState(false);
    const [alertSeverity, setAlertSeverity] = React.useState();
    const [alertMsg, setAlertMsg] = React.useState("");

    React.useEffect(()=> {
        fetch(`/api/getDesign?uid=${props.uid}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    var designObj = JSON.stringify(data['designData'])
                    designObj = JSON.parse(designObj)
                    for (let i=0; i<data['scoreList'].length; i++){
                        designObj[i].score = data['scoreList'][i]
                        designObj[i].submission = data['submissionList'][i]
                    }
                    setTable(designObj)
                    setRowsPerPage(designObj.length)
                })
            else if(response.status==400)
                window.location = "/error"
            else if (response.status==404){
                setDisplayAlert(true)
                setAlertSeverity("info")
                setAlertMsg("Opps, you have no coding challenge, start making one now.")
            }
            return Promise.reject(response.status)
        }).catch((e)=>{})
    }, [])

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = table.map((row) => row.did);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, rowid) => {
        event.stopPropagation()
        const selectedIndex = selected.indexOf(rowid);
        let newSelected = [];
        if (selectedIndex === -1)   // when the row is selected
            newSelected = newSelected.concat(selected, rowid);
        else if (selectedIndex === 0)   // when the row is unselected and it was the only selected
            newSelected = newSelected.concat(selected.slice(1));
        else if (selectedIndex === selected.length - 1) // when the row is unselected and it was the last recent selected
            newSelected = newSelected.concat(selected.slice(0, -1));
        else if (selectedIndex > 0)  // when the row is unselected and it was not the last recent selected
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1),);
        setSelected(newSelected);
    };

    const viewDesign = (event, did)=>{
        window.location = `/viewChallenge/${did}`
    }

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const deleteChallenges = (event)=>{
        let message = `You are about to delete:`
        for (var i=0; i<selected.length; i++){
            let title = table.filter(function(item){
                return item.did == selected[i]
            })[0]['title']
            message += `\n${i+1}. ${title}`
        }
        message += '\n\nThe changes will reflect on any related coding course.'
        setDisplayAlert(true)
        setAlertSeverity("warning")
        setAlertMsg(message)
    }

    const confirmDelete = (event, confirm)=>{
        if(confirm){
            let fetchurl = "/api/deleteDesign?";
            for(var i=0; i<selected.length; i++){
                fetchurl += `did=${selected[i]}`
                if(i!=selected.length-1)
                    fetchurl += '&'
                else if(i==selected.length-1)
                    fetchurl += `&uid=${props.uid}`
            }
            // delete design then set remaining design
            fetch(fetchurl).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        // if there is any fail to be deleted challenge
                        if(data['failList'].length!=0){
                            let message = `Deleted challenge(s) successfully except:`
                            for (var i=0; i<data['failList'].length; i++){
                                let title = table.filter(function(item){
                                    return item.did == data['failList'][i]
                                })[0]['title']
                                message += `\n${i+1}. ${title}`
                            }
                            setDisplayAlert(true)
                            setAlertSeverity("info")
                            setAlertMsg(message)
                        }
                        // if there is no fail to be deleted challenge
                        else if(data['failList'].length==0){
                            setDisplayAlert(true)
                            setAlertSeverity("success")
                            setAlertMsg("Deleted challenge(s) successfully.")
                        }
                        var designObj = JSON.stringify(data['designData'])
                        designObj = JSON.parse(designObj)
                        for (let i=0; i<data['scoreList'].length; i++){
                            designObj[i].score = data['scoreList'][i]
                            designObj[i].submission = data['submissionList'][i]
                        }
                        setTable(designObj)
                        setRowsPerPage(designObj.length)
                        // setTable(data['designData'])
                    })
                else{
                    setDisplayAlert(true)
                    setAlertSeverity("error")
                    setAlertMsg("Opps, failed to delete challenge!")
                }
                return Promise.reject(response.status)
            }).catch((e)=>{})
        }
        else
            setDisplayAlert(false)
        setSelected([])
    }

    const closeAlert = (event, reason)=>{
        if (reason === 'clickaway')
            return;
        setDisplayAlert(false)
    };

    return (
        <Box sx={{ width: '100%'}}>
            <Snackbar open={displayAlert} autoHideDuration={(alertSeverity=="warning")?null:4000} onClose={closeAlert} anchorOrigin={{ vertical: "bottom",  horizontal: "left" }}>
                {(alertSeverity=="warning")?(
                    <Alert variant="filled" severity={"warning"} style={{whiteSpace: 'pre-line'}}
                        action={
                            <Box>
                                <Button color="primary" variant="contained" size="small" onClick={(event)=>confirmDelete(event, true)}
                                    style={{marginRight: "0.5em"}}>Confirm</Button>
                                <Button color="secondary" variant="contained" size="small" onClick={(event)=>confirmDelete(event, false)}>
                                    Cancel</Button>
                            </Box>}>
                        {alertMsg}</Alert>
                ):(
                    <Alert variant="filled" onClose={closeAlert} severity={alertSeverity} style={{whiteSpace: 'pre-line'}}>{alertMsg}</Alert>
                )}
            </Snackbar>
            <Paper sx={{ width: '100%'}}>
                <EnhancedTableToolbar numSelected={selected.length} classes={classes} deleteChallenges={deleteChallenges}/>
                <TableContainer style={{ maxHeight: 480,}}>
                    <Table stickyHeader aria-label="sticky table"
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size='medium'
                        className={classes.header}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={table.length}
                        />
                        <TableBody>
                            {stableSort(table, getComparator(order, orderBy))
                                .map((row, index) => {
                                    const isItemSelected = isSelected(row.did);
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => viewDesign(event, row.did)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.did}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    onClick={(event) => handleClick(event, row.did)}
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        'aria-labelledby': labelId,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell component="th" id={labelId} scope="row" padding="none" align="left" style={{wordWrap: "break-word"}}>{row.title}</TableCell>
                                            <TableCell align="left" style={{wordWrap: "break-word"}}>{row.difficulty}</TableCell>
                                            <TableCell align="left" style={{wordWrap: "break-word"}}>{row.creator}</TableCell>
                                            <TableCell align="center" style={{wordWrap: "break-word"}}>{new Date(row.creationdate).toLocaleString()}</TableCell>
                                            <TableCell align="center" style={{wordWrap: "break-word"}}>
                                                <Box position="relative" display="inline-flex">
                                                    <CircularProgress variant="determinate" value={row.score}/>
                                                    <Box top={0} left={0} bottom={0} right={0}
                                                        position="absolute"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                    >
                                                        <Typography variant="body1" component="div">{`${row.score}`}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" style={{wordWrap: "break-word"}}>{row.submission}</TableCell>
                                        </TableRow>
                                    );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10]}
                    component="div"
                    count={table.length}
                    rowsPerPage={rowsPerPage}
                    page={0}
                    onPageChange={()=>{}}
                />
            </Paper>
        </Box>
    );
}

export default withStyles(styles)(ManageChallengesTable)