import * as React from 'react';
import PropTypes from 'prop-types';
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel,
    Toolbar, Typography, Chip} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';

const styles = (theme) =>({
    header: {
        "& .MuiTableCell-head": {
            color: "black",
            backgroundColor: "#FDA284",
            fontWeight: 700,
        },
    },
    subheader: {
		color: "black",
		backgroundColor: "#F97C53",
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
  	return order === 'desc'? (a, b)=>descendingComparator(a, b, orderBy):(a, b)=>-descendingComparator(a, b, orderBy);
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
    {id: 'creationdate', label: 'Created on'},
];

function EnhancedTableHead(props) {
	const { order, orderBy, onRequestSort } = props;
	const createSortHandler = (property) => (event) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow style={{"height": '35px'}}>
				<TableCell  align={'center'}>
					{"Number"}
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
	onRequestSort: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const {classes} = props;

	return (
		<Toolbar
			sx={{
				pl: { sm: 2 },
				pr: { xs: 1, sm: 1 },
			}} 
			className={classes.subheader}
		>
		<Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
			List of Coding Courses</Typography>
		</Toolbar>
	);
};

function BrowseCoursesTable(props) {
	const {classes} = props;
	const [order, setOrder] = React.useState('asc');
	const [orderBy, setOrderBy] = React.useState('cid');
	const [rowsPerPage, setRowsPerPage] = React.useState(0);
	const [table, setTable] = React.useState([]);

	React.useEffect(()=> {
		fetch(`/api/course`).then((response)=>response.json()).then((data)=>{
			setTable(data)
			setRowsPerPage(data.length)
		})
	}, [])

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const viewCourse = (event, cid)=>{
		window.location = `/viewCourse/${cid}`
	}

	return (
		<Box sx={{ width: '100%'}}>
			<Paper sx={{ width: '100%'}}>
				<EnhancedTableToolbar classes={classes}/>
				<TableContainer style={{ maxHeight: 480,}}>
					<Table stickyHeader aria-label="sticky table"
						sx={{ minWidth: 750 }}
						aria-labelledby="tableTitle"
						size='medium'
						className={classes.header}
					>
						<EnhancedTableHead
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
						/>
						<TableBody>
							{stableSort(table, getComparator(order, orderBy))
								.map((row, index) => {
									const labelId = `enhanced-table-checkbox-${index}`;
									return (
										<TableRow
											hover
											onClick={(event) => viewCourse(event, row.cid)}
											tabIndex={-1}
											key={row.cid}
										>
											<TableCell component="th" id={labelId} scope="row" padding="none" align="center">{index+1}</TableCell>
											<TableCell align="left" style={{wordWrap: "break-word"}}>{row.title}</TableCell>
											<TableCell align="left" style={{wordWrap: "break-word"}}>
												{row.tags.map((tag, index2) => (<Chip key={index2} label={tag} size={"small"} style={{marginRight: "0.5em"}}/>))}</TableCell>
											<TableCell align="center" style={{wordWrap: "break-word"}}>{row.passing}</TableCell>
											<TableCell align="left" style={{wordWrap: "break-word"}}>{row.creator}</TableCell>
											{/* <TableCell align="left" style={{overflow: "hidden", textOverflow: "ellipsis", maxWidth: "35em"}}>{row.desc}</TableCell> */}
											{/* <TableCell align="left" style={{overflow: "hidden", textOverflow: "ellipsis", maxWidth: "35em"}}>{row.challengesTitle.join(", ")}</TableCell> */}
											<TableCell align="center" style={{wordWrap: "break-word"}}>{new Date(row.creationdate).toLocaleString()}</TableCell>
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

export default withStyles(styles)(BrowseCoursesTable)