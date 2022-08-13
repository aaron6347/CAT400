import * as React from 'react';
import PropTypes from 'prop-types';
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Checkbox, TableSortLabel,
    Toolbar, Typography, IconButton, Tooltip, Chip, Snackbar, Button} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {alpha, withStyles} from '@material-ui/core/styles';
import DeleteIcon from "@material-ui/icons/Delete"

const styles = (theme) =>({
    header: {
        "& .MuiTableCell-head": {
            color: "black",
            backgroundColor: "#FDCD84",
            fontWeight: 700,
        },
    },
    subheader: {
      color: "black",
      backgroundColor: "#FFB94E",
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
    {id: 'tags', label: 'Tags'},
    {id: 'passing', label: 'Passing Score'},
    {id: 'creator', label: 'Created by'},
    // {id: 'desc', label: 'Description'},
    {id: 'creationdate', label: 'Created on'},
    {id: 'student', label: 'Student Count'},
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
    const {numSelected, classes, del} = props;

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
                Coding Courses Management</Typography>
            )}
            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton onClick={del}>
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

function ManageCoursesTable(props) {
    const {classes} = props;
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('cid');
    const [selected, setSelected] = React.useState([]);
    const [rowsPerPage, setRowsPerPage] = React.useState(0);
    const [table, setTable] = React.useState([]);
    const [displayAlert, setDisplayAlert] = React.useState(false);
    const [alertSeverity, setAlertSeverity] = React.useState();
    const [alertMsg, setAlertMsg] = React.useState("");

    React.useEffect(()=> {
        fetch(`/api/getCourse?uid=${props.uid}`).then((response)=>{
            if(response.ok)
                return response.json().then((data)=>{
                    var courseObj = JSON.stringify(data['courseData'])
                    courseObj = JSON.parse(courseObj)
                    for (let i=0; i<data['studentList'].length; i++){
                        courseObj[i].student = data['studentList'][i]
                    }
                    setTable(courseObj)
                    setRowsPerPage(courseObj.length)
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
            const newSelecteds = table.map((row) => row.cid);
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
        else if (selectedIndex === 0)  // when the row is unselected and it was the only selected
            newSelected = newSelected.concat(selected.slice(1));
        else if (selectedIndex === selected.length - 1) // when the row is unselected and it was the last recent selected
            newSelected = newSelected.concat(selected.slice(0, -1));
        else if (selectedIndex > 0)  // when the row is unselected and it was not the last recent selected
            newSelected = newSelected.concat( selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1), );
        setSelected(newSelected);
    };

    const viewCourse = (event, cid) => {
        window.location = `/viewCourse/${cid}`
    }

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const deleteCourses = (event)=>{
        let message = `You are about to delete:`
        for (var i=0; i<selected.length; i++){
            let title = table.filter(function(item){
                return item.cid == selected[i]
            })[0]['title']
            message += `\n${i+1}. ${title}`
        }
        message += '\n\nThe changes will reflect on students\' participation.'
        setDisplayAlert(true)
        setAlertSeverity("warning")
        setAlertMsg(message)
    }

    const confirmDelete = (event, confirm)=>{
        if(confirm){
            let fetchurl = "/api/deleteCourse?";
            for(var i=0; i<selected.length; i++){
                fetchurl += `cid=${selected[i]}`
                if(i!=selected.length-1)
                    fetchurl += '&'
                else if(i==selected.length-1)
                    fetchurl += `&uid=${props.uid}`
            }
            // delete course then set remaining course
            fetch(fetchurl).then((response)=>{
                if(response.ok)
                    return response.json().then((data)=>{
                        // if there is any fail to be deleted challenge
                        if(data['failList'].length!=0){
                            let message = `Deleted course(s) successfully except:`
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
                            setAlertMsg("Deleted course(s) successfully.")
                        }
                        var courseObj = JSON.stringify(data['courseData'])
                        courseObj = JSON.parse(courseObj)
                        for (let i=0; i<data['studentList'].length; i++){
                            courseObj[i].student = data['studentList'][i]
                        }
                        setTable(courseObj)
                        setRowsPerPage(courseObj.length)
                        // setTable(data['courseData'])
                    })
                else{
                    setDisplayAlert(true)
                    setAlertSeverity("error")
                    setAlertMsg("Opps, failed to delete course!")
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
                <EnhancedTableToolbar numSelected={selected.length} classes={classes} del={deleteCourses}/>
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
                                    const isItemSelected = isSelected(row.cid);
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => viewCourse(event, row.cid)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.cid}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    onClick={(event) => handleClick(event, row.cid)}
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        'aria-labelledby': labelId,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell component="th" id={labelId} scope="row" padding="none" align="left" style={{wordWrap: "break-word"}}>{row.title}</TableCell>
                                            <TableCell align="left" style={{wordWrap: "break-word"}}>
                                                {row.tags.map((tag, index2) => (<Chip key={index2} label={tag} size={"small"} style={{marginRight: "0.5em"}}/>))}</TableCell>
                                            <TableCell align="center" style={{wordWrap: "break-word"}}>{row.passing}</TableCell>
                                            <TableCell align="left" style={{wordWrap: "break-word"}}>{row.creator}</TableCell>
                                            {/* <TableCell align="left" style={{overflow: "hidden", textOverflow: "ellipsis", maxWidth: "20em"}}>{row.desc}</TableCell> */}
                                            <TableCell align="center" style={{wordWrap: "break-word"}}>{new Date(row.creationdate).toLocaleString()}</TableCell>
                                            <TableCell align="center" style={{wordWrap: "break-word"}}>{row.student}</TableCell>
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

export default withStyles(styles)(ManageCoursesTable)