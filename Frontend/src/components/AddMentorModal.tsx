import React, { useState, ChangeEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import axios, { AxiosError } from 'axios';
import User from '../models/User';

interface AddMentorModalProps {
    open: boolean;
    onClose: () => void;
    onMentorAdded: (newMentor: User) => void;
    showSnackbar: (message: string, severity: "success" | "error" | "info" | "warning") => void;
}

const useStyles = makeStyles((theme) => ({
    inputField: {
        marginBottom: theme.spacing(2),
    },
    cancelButton: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
        }
    },
    addButton: {
        backgroundColor: theme.palette.grey[900], // Black color
        color: theme.palette.getContrastText(theme.palette.grey[900]), // Ensuring contrast text
        '&:hover': {
            backgroundColor: theme.palette.grey[700],  // Darker black on hover
        }
    }
}));


const AddMentorModal: React.FC<AddMentorModalProps> = ({ open, onClose, onMentorAdded, showSnackbar }) => {
    const classes = useStyles();
    const [newMentorName, setNewMentorName] = useState("");

    const handleNewMentorNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNewMentorName(event.target.value);
    };
    const handleAddMentor = async () => {
        try {
            const response = await axios.post("http://localhost:5555/mentor/create", {
                name: newMentorName,
            });
            if (response.status === 201) {
                showSnackbar("Mentor added successfully", "success");
                onMentorAdded(response.data); // Send new mentor data
                handleClose();
            } else {
                showSnackbar("Failed to add mentor", "error");
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                showSnackbar(axiosError.message, "error");
            } else if (error instanceof Error) {
                showSnackbar(error.message, "error");
            } else {
                showSnackbar("An unknown error occurred", "error");
            }
        } finally {
            setNewMentorName("");
        }
    };
    const handleClose = () => {
        setNewMentorName('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add New Mentor</DialogTitle>
            <DialogContent>
                <Box>

                    <TextField
                        label="Mentor Name"
                        variant="outlined"
                        fullWidth
                        value={newMentorName}
                        onChange={handleNewMentorNameChange}
                        className={classes.inputField}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="contained" className={classes.cancelButton}>
                    Cancel
                </Button>
                <Button onClick={handleAddMentor} variant="contained" className={classes.addButton}>
                    Add Mentor
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMentorModal;