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

const TABLE_USERS = 'mms_users';
const TABLE_PRODUCTS = 'mms_products';
const TABLE_SALES = 'mms_sales';

const db = new Repository();

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

// import {
//     MuiPickersUtilsProvider,
//     KeyboardTimePicker,
//     KeyboardDatePicker,
//   } from '@material-ui/pickers';

const drawerWidth = 240;

export default function Dashboard() {
  const classes = useStyles();
  const [productList, setProductList] = React.useState([]);

  const [productDetails, setProductDetails] = React.useState({
    _id: uuidv4(),
    name: '',
    saleRate: 0,
    category: 'TABLET',
    packageCategory: 'BOX',
    rackNo: 'RACK1',
    rackWeightCategory: '',
    purchaseRate: 0,
    mrp: 0,
    noOfItemsInPack: 1,
    noOfSubItemsInPack: 0,
    quantity: 1,
    discount: 0,
    avlItemCount:0,
    manufacturingDate: new Date().toISOString().substr(0, 10),
    expiryDate: new Date().toISOString().substr(0, 10),
    created: new Date().toISOString(),
    productCode: '--',
    pricePerItem: 0,
    isDeleted: false
  });

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  React.useEffect(()=>{
    getProductList();
  }, [])

  const getProductList = async () => {
    let result = await db.scan(TABLE_PRODUCTS);
    setProductList(result);
  }

  // React.useEffect(()=>{
  //   setProductDetails( o => {
  //     return {

  //     }
  //   })
  // },[])

  React.useEffect(()=>{
    let noOfSubItemsInPack = productDetails.noOfSubItemsInPack > 0 ? productDetails.noOfSubItemsInPack : 1;
    setProductDetails({
      ...productDetails,
      avlItemCount: noOfSubItemsInPack * productDetails.noOfItemsInPack * productDetails.quantity,
      pricePerItem: productDetails.saleRate / (noOfSubItemsInPack * productDetails.noOfItemsInPack * productDetails.quantity)
    });
  }, [productDetails.quantity, productDetails.noOfItemsInPack, productDetails.noOfSubItemsInPack, productDetails.saleRate]);

  React.useEffect(()=>{
    let name = typeof productDetails.name === 'string' && productDetails.name.length > 0 ? productDetails.name.substr(0, 3) : '';
    let category = typeof productDetails.category === 'string' && productDetails.category.length > 0 ? productDetails.category.substr(0,1) : '';
    let productCategory = typeof productDetails.packageCategory === 'string' && productDetails.packageCategory.length > 0 ? productDetails.packageCategory.substr(0,1) : '';
    let _id = typeof productDetails._id === 'string' && productDetails._id.length > 0 ? productDetails._id.substr(0, 3) : '';
    let productCode = (name + '-' + category + productCategory + _id).toLocaleUpperCase()
    setProductDetails({
      ...productDetails, 
      productCode: productCode,
    });
  }, [productDetails.name, productDetails.category, productDetails._id, productDetails.productCategory]);

  const handleAddProduct = async () => {
    try{
      console.log('productDetails',productDetails);
      await db.insert(TABLE_PRODUCTS, productDetails);
      enqueueSnackbar('Product Added', { variant: 'success', anchorOrigin:{vertical: 'top', horizontal: 'center'},autoHideDuration:2000 });
      setProductDetails({
        _id: uuidv4(),
        name: '',
        saleRate: 0,
        category: 'TABLET',
        packageCategory: 'BOX',
        rackNo: 'RACK1',
        rackWeightCategory: '',
        purchaseRate: 0,
        mrp: 0,
        noOfItemsInPack: 1,
        noOfSubItemsInPack: 0,
        quantity: 1,
        discount: 0,
        avlItemCount:0,
        manufacturingDate: new Date().toISOString().substr(0, 10),
        expiryDate: new Date().toISOString().substr(0, 10),
        created: new Date().toISOString(),
        productCode: '--',
        isDeleted: false
      });
      getProductList();
    } catch (err){
      console.log('error occured', err);
    }
  }
  return (
    <>
    <Paper style={{padding:20}}>
        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>Product Master</Typography>
        <Grid container spacing={3}>
            <Grid item xs style={{marginTop:15}}>
                <div>
                    <TextField size="small" required id="filled-read-only-input" disabled label="ProductID" value={productDetails.productCode} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                  <TextField size="small" id="standard-select-currency" select label="Select Category"
                    value={productDetails.category}
                    onChange={e => setProductDetails({...productDetails, category: e.target.value})}
                    fullWidth
                    >
                    {['TABLET' ,'SYRUP', 'CREAM'].map((option) => (
                        <MenuItem key={option} value={option}>
                        {option}
                        </MenuItem>
                    ))}
                    </TextField>
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" value={productDetails.purchaseRate} onChange={e => {setProductDetails({...productDetails, purchaseRate: Number(e.target.value)})}} type="number" label="Purchase Rate" fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" type="number" label="No of Items in Pack" value={productDetails.noOfItemsInPack} onChange={e => {setProductDetails({...productDetails, noOfItemsInPack: Number(e.target.value)})}} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" type="number" label="No of Sub-Items in Item" value={productDetails.noOfSubItemsInPack} onChange={e => {setProductDetails({...productDetails, noOfSubItemsInPack: Number(e.target.value)})}} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" type="number" label="Quantity" value={productDetails.quantity} onChange={e => {setProductDetails({...productDetails, quantity: Number(e.target.value)})}} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <InputLabel style={{fontSize:12}} required={true}>Manufacturing Date</InputLabel>
                    <TextField size="small" required id="standard-required" type="date" value={productDetails.manufacturingDate} onChange={e => {setProductDetails({...productDetails, manufacturingDate: e.target.value})}} fullWidth />
                </div>
            </Grid>
            <Grid item xs>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" label="Product Name" value={productDetails.name} onChange={e => {setProductDetails({...productDetails, name: e.target.value})}} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                  <TextField size="small" id="standard-select-currency" select label="Package Category"
                    value={productDetails.packageCategory} onChange={e => {setProductDetails({...productDetails, packageCategory: e.target.value})}}
                    fullWidth
                    >
                    {['BOX' ,'ITEM'].map((option) => (
                        <MenuItem key={option} value={option}>
                        {option}
                        </MenuItem>
                    ))}
                    </TextField>
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" type="number" label="MRP Rate" value={productDetails.mrp} onChange={e => {setProductDetails({...productDetails, mrp: Number(e.target.value)})}} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" disabled required id="standard-required" type="number" label="Item Unit Cost" value={(Number(productDetails.saleRate)/Number(productDetails.noOfItemsInPack))} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" disabled required id="standard-required" type="number" label="Sub-Item Unit Cost" value={productDetails.noOfItemsInPack > 0 && productDetails.noOfItemsInPack > 0 ? productDetails.saleRate/productDetails.noOfItemsInPack/productDetails.noOfSubItemsInPack: 0} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" type="number" label="Total Item Count" value={productDetails.avlItemCount} disabled fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <InputLabel style={{fontSize:12}} required={true}>Expiry Date</InputLabel>
                    <TextField size="small" required id="standard-required" type="date" value={productDetails.expiryDate} onChange={e => {setProductDetails({...productDetails, expiryDate: e.target.value})}} fullWidth />
                </div>
            </Grid>
            <Grid item xs>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" type="number" label="Sale Rate" value={productDetails.saleRate} onChange={e => {setProductDetails({...productDetails, saleRate: Number(e.target.value)})}} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                  <TextField size="small" id="standard-select-currency" select label="Rack Label"
                    value={productDetails.rackNo}
                    onChange={e => setProductDetails({...productDetails, rackNo: e.target.value})}
                    fullWidth
                    >
                    {['RACK1' ,'RACK2', 'RACK3'].map((option) => (
                        <MenuItem key={option} value={option}>
                        {option}
                        </MenuItem>
                    ))}
                    </TextField>                
                </div>
                
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" label="Rack Weight Category" value={productDetails.rackWeightCategory} onChange={e => {setProductDetails({...productDetails, rackWeightCategory: e.target.value})}} fullWidth />
                </div>
                <div style={{marginTop:15}}>
                    <TextField size="small" required id="standard-required" type="number" label="Discount" value={productDetails.discount} onChange={e => {setProductDetails({...productDetails, discount: Number(e.target.value)})}} fullWidth />
                </div>
            </Grid>
        </Grid>
        <div style={{width:'100%', display:'flex', justifyContent:'center', alignItems:'center', marginTop:15}}>
            <Button
            variant="contained"
            style={{marginRight:10}}
            color="primary"
            className={classes.submit}
            >Reset</Button>
            <Button
            onClick={()=>{handleAddProduct()}}
            variant="contained"
            color="primary"
            className={classes.submit}
            >Save</Button>
        </div>
    </Paper>
    <Paper style={{padding:20, marginTop:20}}>
        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>Table</Typography>
        <TableContainer component={Paper}>
            <Table className={classes.table} stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell align="left">Product Code</StyledTableCell>
                        <StyledTableCell align="left">Product Name</StyledTableCell>
                        <StyledTableCell align="left">Unit Name</StyledTableCell>
                        <StyledTableCell align="left">Product Type</StyledTableCell>
                        <StyledTableCell align="left">Rack No</StyledTableCell>
                        <StyledTableCell align="left">Weight No</StyledTableCell>
                        <StyledTableCell align="left">Purchase Rate</StyledTableCell>
                        <StyledTableCell align="left">MRP Rate</StyledTableCell>
                        <StyledTableCell align="left">Sale Rate</StyledTableCell>
                        <StyledTableCell align="left">Items</StyledTableCell>
                        <StyledTableCell align="left">SubItem</StyledTableCell>
                        <StyledTableCell align="left">Quantity</StyledTableCell>
                        <StyledTableCell align="left">Avl Items</StyledTableCell>
                        <StyledTableCell align="left">Discount</StyledTableCell>
                        <StyledTableCell align="left">Manufacturing Date</StyledTableCell>
                        <StyledTableCell align="left">Expi Date</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {[...productList].map((row) => (
                  <StyledTableRow key={row._id}>
                    <StyledTableCell align="left">{row.productCode}</StyledTableCell>
                    <StyledTableCell align="left">{row.name}</StyledTableCell>
                    <StyledTableCell align="left">{row.packageCategory}</StyledTableCell>
                    <StyledTableCell align="left">{row.category}</StyledTableCell>
                    <StyledTableCell align="left">{row.rackNo}</StyledTableCell>
                    <StyledTableCell align="left">{row.rackWeightCategory}</StyledTableCell>
                    <StyledTableCell align="left">{row.purchaseRate}</StyledTableCell>
                    <StyledTableCell align="left">{row.mrp}</StyledTableCell>
                    <StyledTableCell align="left">{row.saleRate}</StyledTableCell>
                    <StyledTableCell align="left">{row.noOfItemsInPack}</StyledTableCell>
                    <StyledTableCell align="left">{row.noOfSubItemsInPack}</StyledTableCell>
                    <StyledTableCell align="left">{row.quantity}</StyledTableCell>
                    <StyledTableCell align="left">{row.avlItemCount}</StyledTableCell>
                    <StyledTableCell align="left">{row.discount}</StyledTableCell>
                    <StyledTableCell align="left">{row.manufacturingDate}</StyledTableCell>
                    <StyledTableCell align="left">{row.expiryDate}</StyledTableCell>
                  </StyledTableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
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