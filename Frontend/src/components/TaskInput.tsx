// components/TaskInput.tsx
import React, { useState } from 'react';
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
import {TaskRequest} from "../models/Task";


interface Props {
    open: boolean;
    onClose: () => void;
    onAddTask: (task: TaskRequest) => void;
    users: User[];
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


const TaskInput = ({ open, onClose, onAddTask, users }: Props) => {
    const classes = useStyles();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [owner, setOwner] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = () => {
        const newTask: TaskRequest = {
            title,
            description,
            owner,
            type: "todo",
            deadline
        }
        onAddTask(newTask);
        handleClose(); // Close modal after submit
    };


    const handleClose = () => {
        setTitle('');
        setDescription('');
        setOwner('');
        setDeadline('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add New Task</DialogTitle>
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
                        rows={5}  // Changed from rows={3} to rows={5}
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
                        value={deadline}
                        onChange={(e) => setDeadline((e.target as HTMLInputElement).value)}
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
                <Button onClick={handleSubmit} variant="contained"  className={classes.addButton} >
                    Add Task
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskInput;