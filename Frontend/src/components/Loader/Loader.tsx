import React from 'react';
import { Box, Typography, makeStyles } from '@material-ui/core';
import './Loader.css'; // Import the CSS file

const useStyles = makeStyles((theme) => ({
    loaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'rgba(255,255,255,0.8)',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: theme.spacing(2),
        color: theme.palette.text.secondary,
    },
    ballsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    }
}));

const Loader = () => {
    const classes = useStyles();

    return (
        <Box className={classes.loaderContainer}>
            <div className={classes.ballsContainer}>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
            </div>
            <Typography variant="body1" className={classes.loadingText}>
                Loading tasks...
            </Typography>
        </Box>
    );
};

export default Loader;