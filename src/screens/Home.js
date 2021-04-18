import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
// import Chart from './Chart';
// import Deposits from './Deposits';
// import Orders from './Orders';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
// import AssignmentIcon from '@material-ui/icons/Assignment';

import Sales from './Sales';
import Reports from './Reports';
import Customers from './Customers';
import AddProduct from './AddProduct';
import { Report } from '@material-ui/icons';
import Avatar from '@material-ui/core/Avatar';

import Button from '@material-ui/core/Button';

import _ from 'lodash';

const drawerWidth = 240;

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

export default function Dashboard() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(true);
    const [selectedTab, setSelectedTab] = React.useState(1);
    const [clientData, setClientData] = React.useState(null);
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };
        React.useEffect(() => {
            if(localStorage.getItem('@client_data')){
                setClientData(JSON.parse(localStorage.getItem('@client_data')));
            }
            console.log(JSON.parse(localStorage.getItem('@client_data')));
        }, []);
        
        const mainContainerItem = () => {
            switch(selectedTab) {
                case 0: 
                    return <AddProduct /> //<-- Code for Sales is sotre in AddProject.js
                case 1: 
                    return <Sales /> //<-- Code for AddProject is sotre in Sales.js
                case 2: 
                    return <Customers />
                case 3: 
                    return <Reports />    
                default:
                    <></>
            }
        }

    return (
        <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
            <Toolbar className={classes.toolbar}>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
            >
                <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                Dashboard
            </Typography>
            <IconButton color="inherit">
                <Typography style={{marginRight:10}}>{_.get(clientData, 'name', '')}</Typography>
                <Badge badgeContent={0} color="secondary">
                    <Avatar alt={_.get(clientData, 'name', '')} src="https://source.unsplash.com/100x100/?boy_face" />
                </Badge>
            </IconButton>
            </Toolbar>
        </AppBar>
        <Drawer
            variant="permanent"
            classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
            }}
            open={open}
        >
            <div className={classes.toolbarIcon}>
                <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                    MEDICAL STORE
                </Typography>
                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            <List>
                <div>
                    <ListItem button selected={selectedTab === 0} onClick={()=>setSelectedTab(0)}>
                        <ListItemIcon>
                        <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Sale" />
                    </ListItem>
                    <ListItem button selected={selectedTab === 1} onClick={()=>setSelectedTab(1)}>
                        <ListItemIcon>
                        <ShoppingCartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Add Products" />
                    </ListItem>
                    <ListItem button selected={selectedTab === 2} onClick={()=>setSelectedTab(2)}>
                        <ListItemIcon>
                        <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Customers" />
                    </ListItem>
                    <ListItem button selected={selectedTab === 3} onClick={()=>setSelectedTab(3)}>
                        <ListItemIcon>
                        <BarChartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Reports" />
                    </ListItem>
                </div>
            </List>
            <Divider />
            <div style={{display:'flex', flexGrow:1}}>
                {" "}
            </div>
            <Divider />
            <Button style={{marginBottom:30}} onClick={()=>{
                localStorage.removeItem('@client_data');
                window.location.reload(false);
                }}>
                Logout
            </Button>
        </Drawer>
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="lg" className={classes.container}>
            {mainContainerItem()}
            </Container>
        </main>
        </div>
    );
}