//MentorListModal.tsx
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
    Box,
    Paper
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import axios, { AxiosError } from 'axios';
import User from '../models/User';
import ConfirmationDialog from "./ConfirmationDialog";


interface MentorListModalProps {
    open: boolean;
    onClose: () => void;
    mentors: User[];
    onMentorUpdated: (updatedMentor: User) => Promise<void>;
    onMentorDeleted: (mentorId: string) => Promise<void>;
    showSnackbar: (message: string, severity: "success" | "error" | "info" | "warning") => void;
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        },
    },
    editForm: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    buttonGroup: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    editButton: {
        color: 'black'  // style from UserListModal
    },
    deletePaper: {
        borderRadius: '4px',  // style from UserListModal
        '&:hover': {
            backgroundColor: 'rgba(211,47,47,0.1)'  // style from UserListModal
        }
    },
    deleteButton: {
        color: '#D32F2F',  // style from UserListModal
    },

}));


const MentorListModal: React.FC<MentorListModalProps> = ({ open, onClose, mentors, onMentorUpdated, onMentorDeleted, showSnackbar }) => {
    const classes = useStyles();
    const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
    const [editedMentorName, setEditedMentorName] = useState("");
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [mentorToDelete, setMentorToDelete] = useState<User | null>(null);


    const handleEditMentor = (mentor: User) => {
        setEditingMentorId(mentor._id);
        setEditedMentorName(mentor.name);
    };
    const handleCancelEdit = () => {
        setEditingMentorId(null);
        setEditedMentorName('');
    };

    const handleEditedMentorNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedMentorName(event.target.value);
    };

    const handleUpdateMentor = async (mentorId: string) => {
        try {
            const updatedMentor = { name: editedMentorName };
            const response = await axios.put(`http://localhost:5555/mentor/update/${mentorId}`, updatedMentor);
            if (response.status === 200) {
                showSnackbar("Mentor updated successfully", "success");
                onMentorUpdated(response.data.data)
                setEditingMentorId(null);
                setEditedMentorName('');
            } else {
                showSnackbar("Failed to update mentor", "error");
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

    const handleDeleteMentorConfirmation = (mentor: User) => {
        setMentorToDelete(mentor);
        setDeleteConfirmationOpen(true);
    };

    const handleCancelDeleteConfirmation = () => {
        setDeleteConfirmationOpen(false);
        setMentorToDelete(null);
    }

    const handleConfirmDeleteMentor = async () => {
        if (mentorToDelete) {
            await handleDeleteMentor(mentorToDelete._id);
            setDeleteConfirmationOpen(false);
            setMentorToDelete(null);
        }
    };

    const handleDeleteMentor = async (mentorId: string) => {
        try {
            const response = await axios.delete(`http://localhost:5555/mentor/delete/${mentorId}`);
            if (response.status === 200) {
                showSnackbar("Mentor deleted successfully", "success");
                onMentorDeleted(mentorId);
            } else {
                showSnackbar("Failed to delete mentor", "error");
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
                onConfirm={handleConfirmDeleteMentor}
                title="Confirm Delete Mentor"
                message={`Are you sure you want to delete mentor "${mentorToDelete?.name}" ?`}
            />
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>Mentor List</DialogTitle>
                <DialogContent>
                    <List>
                        {mentors.map((mentor) => (
                            <ListItem key={mentor._id} className={classes.listItem}>
                                {editingMentorId === mentor._id ?
                                    (
                                        <form className={classes.editForm}>
                                            <TextField
                                                label="Mentor Name"
                                                variant="outlined"
                                                fullWidth
                                                value={editedMentorName}
                                                onChange={handleEditedMentorNameChange}
                                            />
                                            <Button onClick={() => handleUpdateMentor(mentor._id)} color="primary">Save</Button>
                                            <Button onClick={handleCancelEdit} color="secondary">Cancel</Button>
                                        </form>
                                    ) : (
                                        <>
                                            <ListItemText primary={mentor.name} />
                                            <Box className={classes.buttonGroup}>
                                                <IconButton onClick={() => handleEditMentor(mentor)} className={classes.editButton}>
                                                    <EditIcon />
                                                </IconButton>
                                                <Paper className={classes.deletePaper} elevation={0}>
                                                    <IconButton onClick={() => handleDeleteMentorConfirmation(mentor)} className={classes.deleteButton}>
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

export default MentorListModal;