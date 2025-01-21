import React, { useState, ChangeEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import axios, { AxiosError } from 'axios';
import User from '../models/User';

interface AddUserModalProps {
    open: boolean;
    onClose: () => void;
    mentors: User[];
    onUserAdded: (newUser: User) => void;
    showSnackbar: (message: string, severity: "success" | "error" | "info" | "warning") => void;
}

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginBottom: theme.spacing(2),
        minWidth: '100%',
    },
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

const AddUserModal: React.FC<AddUserModalProps> = ({ open, onClose, mentors, onUserAdded, showSnackbar }) => {
    const classes = useStyles();
    const [newUserName, setNewUserName] = useState("");
    const [newUserMentor, setNewUserMentor] = useState<string | null>(null);

    const handleNewUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNewUserName(event.target.value);
    };

    const handleNewUserMentorChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        setNewUserMentor(event.target.value as string | null);
    };


    const handleAddUser = async () => {
        try {
            const response = await axios.post("http://localhost:5555/user/create", {
                name: newUserName,
                mentor: newUserMentor,
            });
            if (response.status === 201) {
                showSnackbar("User added successfully", "success");
                onUserAdded(response.data); // Send new user data
                handleClose();

            } else {
                showSnackbar("Failed to add user", "error");
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
            setNewUserName("");
            setNewUserMentor(null);
        }

    };
    const handleClose = () => {
        setNewUserName('');
        setNewUserMentor(null);
        onClose();
    };


    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
                <Box>
                    <TextField
                        label="User Name"
                        variant="outlined"
                        fullWidth
                        value={newUserName}
                        onChange={handleNewUserNameChange}
                        className={classes.inputField}

                    />


                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel id="mentor-select-label">Mentor</InputLabel>
                        <Select
                            labelId="mentor-select-label"
                            id="mentor-select"
                            value={newUserMentor || ""}
                            onChange={handleNewUserMentorChange}
                            label="Mentor"
                        >
                            {mentors.map((mentor) => (
                                <MenuItem key={mentor._id} value={mentor._id}>
                                    {mentor.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="contained" className={classes.cancelButton}>
                    Cancel
                </Button>
                <Button onClick={handleAddUser} variant="contained" className={classes.addButton}>
                    Add User
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddUserModal;