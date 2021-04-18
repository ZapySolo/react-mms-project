import React, {useEffect, useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
// import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { sha256, sha224 } from 'js-sha256';
import Repository from '../utilities/dynamodb/dynamoDB';
import { useSnackbar } from 'notistack';
const db = new Repository();

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Medicine Management System
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function SignInSide(props) {
  const classes = useStyles();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if(localStorage.getItem('@client_data')){
      props.onLogin(true);
    }
  });

  const handleLogin = async() => {
    setLoginError(false);
    try{
      let loginResult = await db.findMany('mms_users', {email: loginEmail, passwordHash: sha256(loginPassword)});
      if(loginResult.length){
        enqueueSnackbar('Login Success!', { variant: 'success', anchorOrigin:{vertical: 'top', horizontal: 'center'},autoHideDuration:2000 });
        props.onLogin(true)
        localStorage.setItem('@client_data', JSON.stringify(loginResult[0]));
      } else {
        setLoginError(true);
      }
    } catch(err){
      console.log('Error: ', err);
      enqueueSnackbar('Database Error!', { variant: 'error', anchorOrigin:{vertical: 'top', horizontal: 'center'}, autoHideDuration:5000 });
    }
    setLoading(false);

    // let updateResult = await db.update({
    //     TableName:"mms_users",
    //     Key:{
    //         "_id": "58246eb5-219d-4c29-9497-9d275133ac6d",
    //     },
    //     UpdateExpression: "set #name = :name",
    //     ExpressionAttributeNames: {'#name' : 'name'},
    //     ExpressionAttributeValues: {
    //         ':name' : "Zapy"
    //     },
    //     ReturnValues:"UPDATED_NEW"
    // });
    // console.log(await db.scan('mms_users'));
    
    // let result = await db.update('mms_users', {
    //     "_id": "afea8fh9ahef08ahf0a",
    //     "created": "2021-04-16T20:16:07.476Z",
    //     "password": "abcd",
    //     "email": "temp1@email.com",
    //     "name": "temp 1"
    // });
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              error={loginError}
              helperText={loginError?"Incorrect entry.":''}
              value={loginEmail}
              onChange={(o => setLoginEmail(o.target.value))}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              error={loginError}
              helperText={loginError?"Incorrect entry.":''}
              value={loginPassword}
              onChange={(o => setLoginPassword(o.target.value))}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              //type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={()=>{
                setLoading(true);
                handleLogin()
              }}
            > 
              {loading?<CircularProgress color="inherit" />:'Sign In'}
            </Button>
            <Copyright/>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}


const useStyles = makeStyles((theme) => ({
    root: {
      height: '100vh',
    },
    image: {
      backgroundImage: 'url(https://source.unsplash.com/1000x1000/?hospital)',
      backgroundRepeat: 'no-repeat',
      backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    paper: {
      margin: theme.spacing(8, 4),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));