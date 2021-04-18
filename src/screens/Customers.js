import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Button, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { v4 as uuidv4 } from 'uuid';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { withStyles } from '@material-ui/core/styles';
import Repository from '../utilities/dynamodb/dynamoDB';
import { useSnackbar } from 'notistack';
import { Autocomplete } from '@material-ui/lab';
import _ from 'lodash';
import { getDefaultNormalizer } from '@testing-library/dom';
const db = new Repository();
const drawerWidth = 240;

const TABLE_USERS = 'mms_users';
const TABLE_PRODUCTS = 'mms_products';
const TABLE_SALES = 'mms_sales';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export default function Dashboard() {
  const classes = useStyles();
  const [salesData, setSalesData] = React.useState([]);
  const [dataToDisaply, setDataToDisaply] = React.useState([]);

  React.useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    let salesResult = await db.scan(TABLE_SALES);
    setSalesData(salesResult);
    let groupByCustomer = _.groupBy(salesResult, o => o.customerID);
    console.log('groupByCustomer',groupByCustomer);
    let newData = _.map(groupByCustomer, o => {
      return {
        customerID: _.get(o, '0.customerID', '').substr(0, 8).toUpperCase(),
        customerName: o[0].customerName,
        totalAmountPaid: _.sumBy(o, x => x.amountPaid)
      }
    });
    setDataToDisaply(newData);
  }

  return (
      <Paper style={{padding:20}}>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>Customers</Typography>
          <TableContainer component={Paper} style={{marginTop:10}}>
            <Table className={classes.table} stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell align="left">Customer ID</StyledTableCell>
                        <StyledTableCell align="left">Customer Name</StyledTableCell>
                        <StyledTableCell align="left">Amount Paid</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {dataToDisaply.map((row) => (
                  <StyledTableRow key={row._id}>
                    <StyledTableCell align="left">{row.customerID}</StyledTableCell>
                    <StyledTableCell align="left">{row.customerName}</StyledTableCell>
                    <StyledTableCell align="left">{row.totalAmountPaid}</StyledTableCell>
                  </StyledTableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );
}

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    toolbar: {
      paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    menuButtonHidden: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
    drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',
    },
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 240,
    },
  }));