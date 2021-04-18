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
const db = new Repository();

const TABLE_USERS = 'mms_users';
const TABLE_PRODUCTS = 'mms_products';
const TABLE_SALES = 'mms_sales';

const drawerWidth = 240;

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
  const [customerDetails, setCustomerDetails] = React.useState({
    name: 'NO_NAME',
    created: new Date().toISOString(),
    isDeleted: false,
    type: 'CUSTOMER'
  });
  const [customerLists, setCustomerLists] = React.useState([]);
  const [productDetails, setProductDetails] = React.useState({});
  const [customerExist, setCustomerExist] = React.useState(false);
  const [productList, setProductList] = React.useState([]);

  const [productCart, setProductCart] = React.useState([]);

  React.useEffect(()=>{
    getCustomerList();
    getProductList()
  }, []);

  const getProductList = async () => {
    let result = await db.findMany(TABLE_PRODUCTS, {isDeleted: false});
    console.log('getProductList', result);
    setProductList(result);
  }

  const getCustomerList = async() => {
    let result =await db.findMany(TABLE_USERS, {type: 'CUSTOMER'});
    let no_name_customer = _.find(result, {name: 'NO_NAME'});
    if(no_name_customer) {
      setCustomerDetails(no_name_customer);
    }
    setCustomerLists(result);
  }

  const createNewCustomer = async (customerName) => {
    console.log('createNewCustomer', customerName);
    let obj = {
      _id: uuidv4(),
      name: customerName,
      created: new Date().toISOString(),
      isDeleted: false,
      type: 'CUSTOMER'
    };
    let result = await db.insert(TABLE_USERS, obj);
    setCustomerDetails(obj);
    getCustomerList();
  }

  const handleAddProduct = () => {
    let sellingCount = productDetails.sellingQuantity;
    let newProductList = _.map(productList, o => {
      if(o._id !== productDetails._id){
        return o
      } else {
        return {
          ...o,
          avlItemCount: o.avlItemCount - sellingCount
        }
      }
    });
    setProductList(newProductList);
    setProductCart( o => {return [...o, productDetails]});
    setProductDetails({});
    console.log('productList',productCart);
  }

  const handleSubmit = async () => {
    let productListToUpdate = _.map(productList, o => {
      return {
        _id: o._id,
        avlItemCount: o.avlItemCount
      }
    });
    console.log('productListToUpdate',productListToUpdate);

    let salesData = _.map(productCart, o => {
      return {
        _id: uuidv4(),
        customerID: customerDetails._id,
        productID: o._id,
        itemQuantity: o.sellingQuantity,
        amountPaid: o.pricePerItem * o.sellingQuantity,
        created: new Date().toISOString(),
        isDeleted: false,
        discount: o.discount,
        customerName: customerDetails.name
      }
    });
    console.log('salesData',salesData);
    let updateResult =await db.updateMany(TABLE_PRODUCTS, productListToUpdate);
    let insertResult = await db.insertMany(TABLE_SALES, salesData);
    console.log({updateResult, insertResult});
    await getCustomerList();
    await getProductList();
  }

  return (<>
    <Paper style={{padding:20}}>
        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>Product Sale</Typography>
        <div style={{marginTop:30}}>
          <Typography component="h4" variant="h8" color="inherit" noWrap className={classes.title}>Customer Details</Typography>
          <Grid container spacing={3} style={{marginTop:0}}>
            <Grid item xs>
              <TextField size="small" required id="standard-required" value={customerDetails && customerDetails._id?customerDetails._id.substr(0, 8).toUpperCase():''} disabled label="SalesID" fullWidth />
            </Grid>
            <Grid item xs>
              <Autocomplete
                id="size-small-standard"
                size="small"
                freeSolo
                required
                options={[...customerLists]}
                placeholder="Customer Name"
                getOptionLabel={(option) => option.name}
                value={customerDetails}
                onChange={(event, newValue) => {
                  if(typeof newValue === 'object'){
                    setCustomerDetails(newValue);
                  } else if (typeof newValue === 'string') {
                    createNewCustomer(event.target.value);
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Customer Name"/>
                )}
              />
            </Grid>
            <Grid item xs>
            </Grid>
            <Grid item xs>
            </Grid>
          </Grid>
        </div>
        <div style={{marginTop:30}}>
          <Typography component="h4" variant="h8" color="inherit" noWrap className={classes.title}>Add Product</Typography>
          <Grid container spacing={3} style={{marginTop:0}}>
            <Grid item xs>
            <InputLabel style={{fontSize:12}} required={true}>ProductID</InputLabel>
              <TextField size="small" required id="standard-required" value={productDetails.productCode} disabled label="" fullWidth />
            </Grid>
            <Grid item xs={3}>
            <InputLabel style={{fontSize:12}} required={true}>Name</InputLabel>
              <Autocomplete
                  id="size-small-standard"
                  size="small"
                  disableClearable
                  required
                  options={[...productList]}
                  getOptionLabel={(option) => option.name}
                  value={productDetails}
                  onChange={(event, newValue) => {
                    setProductDetails(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" />
                  )}
                />
            </Grid>
            <Grid item xs>
              <InputLabel style={{fontSize:12}} required={true}>Category</InputLabel>
              <TextField size="small" disabled id="filled-disabled" value={productDetails.category} label="" fullWidth />
            </Grid>
            <Grid item xs>
              <InputLabel style={{fontSize:12}} required={true}>Package</InputLabel>
              <TextField size="small" required id="standard-required" value={productDetails.packageCategory} disabled label="" fullWidth />            
              </Grid>
            <Grid item xs={1}>
              <InputLabel style={{fontSize:12}} required={true}>Avl Stock</InputLabel>
              <TextField size="small" required id="standard-required" value={productDetails.avlItemCount} disabled label="" fullWidth />            
              </Grid>
            <Grid item xs>
            <InputLabel style={{fontSize:12}} required={true}>Rack</InputLabel>
              <TextField size="small" required id="standard-required" value={productDetails.rackNo} disabled label="" fullWidth />           
              </Grid>
            <Grid item xs>
            <InputLabel style={{fontSize:12}} required={true}>Discount</InputLabel>
              <TextField size="small" required id="standard-required" value={productDetails.discount} disabled label="" fullWidth />            
              </Grid>
              <Grid item xs>
              <InputLabel style={{fontSize:12}} required={true}>Quantity</InputLabel>
              <TextField size="small" required id="standard-required" value={productDetails.sellingQuantity} onChange={e => {setProductDetails({...productDetails,sellingQuantity:Number(e.target.value) })}} label="" fullWidth />
              </Grid>
              <Grid item xs>
              <InputLabel style={{fontSize:12}} required={true}>Price</InputLabel>
              <TextField size="small" required id="standard-required" value={productDetails.sellingQuantity * productDetails.pricePerItem} disabled label="" fullWidth />      
              </Grid>
              <Grid item xs>
                  <Button variant="contained" color="primary" onClick={()=>{handleAddProduct()}}>Add</Button>
                </Grid>
          </Grid>
        </div>
        <div style={{marginTop:30}}>
          <Typography component="h4" variant="h8" color="inherit" noWrap className={classes.title}>Cart</Typography>
          <TableContainer component={Paper} style={{marginTop:10}}>
            <Table className={classes.table} stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell align="left">Product Code</StyledTableCell>
                        <StyledTableCell align="left">Product Name</StyledTableCell>
                        <StyledTableCell align="left">Unit Name</StyledTableCell>
                        <StyledTableCell align="left">Product Type</StyledTableCell>
                        <StyledTableCell align="left">Weight No</StyledTableCell>
                        <StyledTableCell align="left">Price</StyledTableCell>
                        <StyledTableCell align="left">Quantity</StyledTableCell>
                        <StyledTableCell align="left">Discount</StyledTableCell>
                        <StyledTableCell align="left">Expi Date</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {[...productCart].map((row) => (
                  <StyledTableRow key={row._id}>
                    <StyledTableCell align="left">{row.productCode}</StyledTableCell>
                    <StyledTableCell align="left">{row.name}</StyledTableCell>
                    <StyledTableCell align="left">{row.packageCategory}</StyledTableCell>
                    <StyledTableCell align="left">{row.category}</StyledTableCell>
                    <StyledTableCell align="left">{row.rackWeightCategory}</StyledTableCell>
                    <StyledTableCell align="left">₹ {row.pricePerItem * row.sellingQuantity}</StyledTableCell>
                    <StyledTableCell align="left">{row.sellingQuantity}</StyledTableCell>
                    <StyledTableCell align="left">{row.discount}</StyledTableCell>
                    <StyledTableCell align="left">{row.expiryDate}</StyledTableCell>
                  </StyledTableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
        </div>
        <div style={{marginTop:30}}>
          <Typography component="h4" variant="h8" color="inherit" noWrap className={classes.title}>Amount Total</Typography>
          <div style={{display:'flex', flexDirection:'row', marginTop:5}}>
          <Typography variant="h4" gutterBottom>Total: </Typography>
          <Typography variant="h4" style={{color:'green', marginLeft:5}} gutterBottom>{"₹"+_.sumBy(productCart, o => o.pricePerItem*o.sellingQuantity)}</Typography>
          </div>
          <div style={{width:'100%', display:'flex', justifyContent:'center', alignItems: 'center'}}>
            <Button variant="contained" color="primary" onClick={()=>{handleSubmit()}}>Submit</Button>
          </div>
        </div>
      </Paper>
    </>
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