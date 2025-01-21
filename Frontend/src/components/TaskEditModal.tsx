// components/TaskContainer/TaskEditModal.tsx
import React, { useState, useEffect } from 'react';
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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import User from "../models/User";
import {Task} from "../models/Task";


interface Props {
    open: boolean;
    onClose: () => void;
    onEditTask: (task: Task) => void;
    users: User[];
    task: Task
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
    saveButton: {
        backgroundColor: theme.palette.grey[900], // Black color
        color: theme.palette.getContrastText(theme.palette.grey[900]), // Ensuring contrast text
        '&:hover': {
            backgroundColor: theme.palette.grey[700],  // Darker black on hover
        }
    }
}));


const TaskEditModal = ({ open, onClose, onEditTask, users, task }: Props) => {
    const classes = useStyles();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [owner, setOwner] = useState(task.owner);
    const [deadline, setDeadline] = useState(task.deadline || '');


    // New state for formatted date string
    const [formattedDeadline, setFormattedDeadline] = useState<string>('');


    // Format deadline for display in the edit form
    useEffect(() => {
        if (task.deadline) {
            try {
                const date = new Date(task.deadline);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                const day = String(date.getDate()).padStart(2, '0');
                setFormattedDeadline(`${year}-${month}-${day}`);

            } catch (error) {
                setFormattedDeadline('');
            }

        }else {
            setFormattedDeadline('');
        }
    }, [task.deadline]);
    // Update deadline state when formatted deadline changes in the UI
    useEffect(() => {
        setDeadline(formattedDeadline);
    }, [formattedDeadline]);

    const handleSubmit = () => {
        const updatedTask: Task = {
            ...task,
            title,
            description,
            owner,
            deadline
        }
        onEditTask(updatedTask);
        handleClose(); // Close modal after submit
    };


    const handleClose = () => {
        setTitle(task.title);
        setDescription(task.description);
        setOwner(task.owner);
        setDeadline(task.deadline || '');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogContent>
                <Box>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
                        className={classes.inputField}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
                        className={classes.inputField}

                    />

                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel id="owner-select-label">Owner</InputLabel>
                        <Select
                            labelId="owner-select-label"
                            id="owner-select"
                            value={owner}
                            onChange={(e) => setOwner((e.target as HTMLSelectElement).value)}
                            label="Owner"
                        >
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Deadline"
                        type="date"
                        variant="outlined"
                        fullWidth
                        defaultValue={formattedDeadline} // Initialize with formatted date
                        onChange={(e) => setFormattedDeadline((e.target as HTMLInputElement).value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className={classes.inputField}
                    />
                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="contained" className={classes.cancelButton}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" className={classes.saveButton}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskEditModal;