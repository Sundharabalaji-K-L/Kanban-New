// components/ConfirmationDialog/ConfirmationDialog.tsx
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, makeStyles
} from '@material-ui/core';

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const useStyles = makeStyles((theme) => ({
    message: {
        color: '#000', // Black color
        fontWeight: 500,
    },
    confirmButton: {
        color: theme.palette.error.contrastText, // White color
        backgroundColor: '#dc3545', // Bootstrap's red color
        '&:hover': {
            backgroundColor: '#c82333', // Darker red on hover
        },
    },
    cancelButton: {
        color: theme.palette.primary.contrastText, // White color
        backgroundColor: '#007bff', // Bootstrap's primary blue color
        '&:hover': {
            backgroundColor: '#0056b3', // Darker blue on hover
        },
    },
}));

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
                                                                   open,
                                                                   onClose,
                                                                   onConfirm,
                                                                   title,
                                                                   message,
                                                               }) => {
    const classes = useStyles();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <Typography id="alert-dialog-description" className={classes.message}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} className={classes.cancelButton}>
                    No
                </Button>
                <Button onClick={onConfirm} className={classes.confirmButton} autoFocus>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;