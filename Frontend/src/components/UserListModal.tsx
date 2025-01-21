import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Paper
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import axios, { AxiosError } from 'axios';
import User from '../models/User';
import ConfirmationDialog from '../components/ConfirmationDialog';

interface UserListModalProps {
    open: boolean;
    onClose: () => void;
    users: User[];
    onUserUpdated: (updatedUser: User) => Promise<void>;
    onUserDeleted: (userId: string) => Promise<void>;
    showSnackbar: (message: string, severity: "success" | "error" | "info" | "warning") => void;
    mentors: User[];
}

const useStyles = makeStyles((theme) => ({
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing(1, 2),
        borderBottom: '1px solid #eee',
        '&:last-child': {
            borderBottom: 'none',
        },
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Adding a subtle shadow
        transition: 'transform 0.2s ease-in-out',
        '&:hover':{
            transform:'translateY(-2px)' ,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        },
    },
    editForm:{
        display:'flex',
        flexDirection:'column',
        width:'100%',
        gap: theme.spacing(1),
        marginTop: theme.spacing(1),

    },
    formControl: {
        marginBottom: theme.spacing(2),
        minWidth: '100%',
    },
    buttonGroup: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    editButton:{
        color: 'black'
    },
    deletePaper: {
        borderRadius: '4px',
        '&:hover': {
            backgroundColor: 'rgba(211,47,47,0.1)'
        }
    },
    deleteButton:{
        color: '#D32F2F', // Option 1: A more vivid red
        //  color: '#C62828',  // Option 2: A slightly darker red
        // color:'#E53935', //Option 3: A brighter red
    },
    nameCard: {
        padding: theme.spacing(1, 2),
        borderRadius: '4px',
    }

}));

const UserListModal: React.FC<UserListModalProps> = ({ open, onClose, users, onUserUpdated, onUserDeleted, showSnackbar, mentors }) => {
    const classes = useStyles();
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editedUserName, setEditedUserName] = useState("");
    const [editedUserMentor, setEditedUserMentor] = useState<string | null>(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);


    const handleEditUser = (user: User) => {
        setEditingUserId(user._id);
        setEditedUserName(user.name);
        setEditedUserMentor(user.mentor);
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditedUserName('');
        setEditedUserMentor(null);

    };
    const handleEditedUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedUserName(event.target.value);
    };

    const handleEditedUserMentorChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        setEditedUserMentor(event.target.value as string | null);
    };

    const handleUpdateUser = async (userId: string) => {
        try {

            const updatedUser = {name:editedUserName, mentor:editedUserMentor};
            const response = await axios.put(`http://localhost:5555/user/update/${userId}`,updatedUser );
            if (response.status === 200) {
                showSnackbar("User updated successfully", "success");
                onUserUpdated(response.data.data);
                setEditingUserId(null);
                setEditedUserName('');
                setEditedUserMentor(null);
            } else {
                showSnackbar("Failed to update user", "error");
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
        }
    };
    const handleDeleteUserConfirmation = (user: User) => {
        setUserToDelete(user);
        setDeleteConfirmationOpen(true);
    };

    const handleCancelDeleteConfirmation = () => {
        setDeleteConfirmationOpen(false);
        setUserToDelete(null);
    }


    const handleConfirmDeleteUser = async () => {
        if (userToDelete) {
            await handleDeleteUser(userToDelete._id);
            setDeleteConfirmationOpen(false);
            setUserToDelete(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await axios.delete(`http://localhost:5555/user/delete/${userId}`);
            if (response.status === 200) {
                showSnackbar("User deleted successfully", "success");
                onUserDeleted(userId); // Delete user
            } else {
                showSnackbar("Failed to delete user", "error");
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
        }
    };


    return (
        <>
            <ConfirmationDialog
                open={deleteConfirmationOpen}
                onClose={handleCancelDeleteConfirmation}
                onConfirm={handleConfirmDeleteUser}
                title="Confirm Delete User"
                message={`Are you sure you want to delete user "${userToDelete?.name}" ?`}
            />
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>User List</DialogTitle>
                <DialogContent>
                    <List>
                        {users.map((user) => (
                            <ListItem key={user._id} className={classes.listItem}>
                                {editingUserId === user._id ?
                                    (
                                        <form className={classes.editForm}>
                                            <TextField
                                                label="User Name"
                                                variant="outlined"
                                                fullWidth
                                                value={editedUserName}
                                                onChange={handleEditedUserNameChange}
                                            />
                                            <FormControl variant="outlined" className={classes.formControl}>
                                                <InputLabel id="mentor-select-label">Mentor</InputLabel>
                                                <Select
                                                    labelId="mentor-select-label"
                                                    id="mentor-select"
                                                    value={editedUserMentor || ""}
                                                    onChange={handleEditedUserMentorChange}
                                                    label="Mentor"
                                                >
                                                    {mentors.map((mentor) => (
                                                        <MenuItem key={mentor._id} value={mentor._id}>
                                                            {mentor.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Box className={classes.buttonGroup}>
                                                <Button onClick={()=> handleUpdateUser(user._id)} color="primary">Save</Button>
                                                <Button onClick={handleCancelEdit} color="secondary">Cancel</Button>
                                            </Box>
                                        </form>
                                    ) :(
                                        <>
                                            <Box className={classes.nameCard}>
                                                <ListItemText primary={user.name} secondary={`Mentor: ${mentors.find(m=> m._id === user.mentor)?.name || "No mentor"}`} />
                                            </Box>
                                            <Box className={classes.buttonGroup}>
                                                <IconButton onClick={() => handleEditUser(user)} className={classes.editButton}>
                                                    <EditIcon />
                                                </IconButton>
                                                <Paper className={classes.deletePaper} elevation={0}>
                                                    <IconButton onClick={() => handleDeleteUserConfirmation(user)} className={classes.deleteButton}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Paper>
                                            </Box>
                                        </>
                                    )
                                }
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserListModal;