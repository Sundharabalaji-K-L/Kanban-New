import React, { useState, useRef, useEffect } from 'react';
import {
    Card, CardContent, Typography, Box, Paper, makeStyles, Modal, Backdrop, Fade, IconButton, Grid, Tooltip, Menu, MenuItem,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Task } from "../models/Task";
import User from "../models/User";
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import PersonIcon from '@material-ui/icons/Person';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { SvgIcon } from '@material-ui/core';
import { Draggable } from 'react-beautiful-dnd';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreVertIcon from '@material-ui/icons/MoreVert'; // Import three-dot icon
import ConfirmationDialog from "./ConfirmationDialog";


interface Props {
    task: Task;
    users: User[];
    index: number;
    onOpenEdit: () => void;
    onDeleteTask: (taskId: string) => void;
}

const useStyles = makeStyles((theme) => ({
    cardContainer: {
        minWidth: 280,
        maxWidth: 350,
        margin: theme.spacing(1),
        userSelect: 'none',
        position: 'relative', // Required for absolute positioning of menu
    },
    overdueCard: {
        backgroundColor: 'rgba(255, 0, 0, 0.2)', // Light red using rgba
    },
    warningCard: {
        backgroundColor: 'rgba(255, 165, 0, 0.2)', // Light orange using rgba
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(3),
        maxWidth: '70vw',
        width: '70%',
        overflow: 'auto',
        position: 'relative',
        boxShadow: theme.shadows[3],
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.shape.borderRadius,
    },
    modalSubHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    closeButton: {
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        color: theme.palette.action.active,
        zIndex: 1001, // Ensure it's above the modal content
    },
    statusContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    cardActions: {
        position: 'absolute',
        top: theme.spacing(0.5),
        right: theme.spacing(0.5),
        zIndex: 100,
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    }

}));


const SingleTask = ({ task, users, index, onOpenEdit, onDeleteTask }: Props) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const ownerName = users.find((user) => user._id === task.owner)?.name || "Unknown";
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "No Due Date";
        try {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            return date.toLocaleDateString(undefined, options);
        } catch (error) {
            return "Invalid Date";
        }
    };

    const isOverdue = () => {
        if (!task.deadline) return false;
        try {
            const deadlineDate = new Date(task.deadline);
            const currentDate = new Date();

            // Set hours, minutes, seconds and milliseconds to 0 for accurate date comparison.
            deadlineDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            // Check if deadline is in the past or is same day as today.
            return deadlineDate <= currentDate;
        } catch (error) {
            return false;
        }
    };

    const isWithinThreeDays = () => {
        if (!task.deadline) return false;

        try {
            const deadlineDate = new Date(task.deadline);
            const currentDate = new Date();


            // Set hours, minutes, seconds and milliseconds to 0 for accurate date comparison.
            deadlineDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            const threeDaysFromNow = new Date(currentDate);
            threeDaysFromNow.setDate(currentDate.getDate() + 3);

            return deadlineDate > currentDate && deadlineDate <= threeDaysFromNow;

        }catch (error) {
            return false;
        }
    }


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation(); // Prevent click from triggering modal
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    const handleOpenDeleteConfirmation = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation(); // Prevent click from triggering modal
        handleMenuClose();
        setDeleteConfirmationOpen(true);
    };

    const handleCloseDeleteConfirmation = () => {
        setDeleteConfirmationOpen(false);
    };

    const handleConfirmDelete = () => {
        onDeleteTask(task._id);
        handleCloseDeleteConfirmation();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "todo":
                return <AssignmentOutlinedIcon className='icon-debug' fontSize="small" color="action" />;
            case "doing":
                return <HourglassEmptyIcon className='icon-debug' fontSize="small" color="action" />;
            case "complete":
                return <CheckCircleOutlineIcon className='icon-debug' fontSize="small" color="action" />;
            default:
                return <SvgIcon className='icon-debug' fontSize="small" color="action" />;
        }
    }


    // Add this to prevent the dragging from interupting the modal close event
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node) && open) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [modalRef, open]);


    const getCardStyle = () => {
        if(isOverdue()) {
            return classes.overdueCard;
        }
        if(isWithinThreeDays()) {
            return classes.warningCard;
        }
        return '';
    }


    return (
        <Draggable draggableId={String(task._id)} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Box
                        className={classes.cardContainer}
                        onClick={handleOpen}
                    >
                        <Paper elevation={2} >
                            <Card>
                                <CardContent className={getCardStyle()}>
                                    <Typography variant="h6" style={{ cursor: 'pointer' }} color="textPrimary">{task.title}</Typography>
                                    {task.deadline && <Grid container alignItems="center" spacing={1}>
                                        <Grid item><CalendarTodayIcon fontSize="small" color="action" /></Grid>
                                        <Grid item>  <Typography variant="subtitle2" color="textSecondary">Due Date: {formatDate(task.deadline)}</Typography></Grid>
                                    </Grid>}
                                    <Grid container alignItems="center" spacing={1}>
                                        <Grid item><PersonIcon fontSize="small" color="action" /></Grid>
                                        <Grid item> <Typography variant="subtitle2" color="textSecondary">Owner: {ownerName}</Typography></Grid>
                                    </Grid>
                                </CardContent>
                                <Box className={classes.cardActions}>
                                    <IconButton
                                        aria-label="more"
                                        size='small'
                                        onClick={handleMenuOpen}
                                    >
                                        <MoreVertIcon fontSize='small' />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right', // Align menu to the right of the button
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right', // Use top-right of the menu itself
                                        }}
                                    >
                                        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); onOpenEdit(); }} className={classes.menuItem}>
                                            <EditIcon fontSize='small' />
                                            Edit
                                        </MenuItem>
                                        <MenuItem onClick={handleOpenDeleteConfirmation} className={classes.menuItem}>
                                            <DeleteIcon fontSize='small' />
                                            Delete
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            </Card>
                        </Paper>
                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            className={classes.modal}
                            open={open}
                            onClose={handleClose}
                            closeAfterTransition
                            BackdropComponent={Backdrop}
                            BackdropProps={{
                                timeout: 500,
                            }}
                        >
                            <Fade in={open}>
                                <div ref={modalRef} className={classes.modalContent}>
                                    <IconButton aria-label="close" onClick={(e) => { e.stopPropagation(); handleClose(); }} className={classes.closeButton}>
                                        <CloseIcon />
                                    </IconButton>
                                    <Typography variant="h5" id="transition-modal-title" gutterBottom color="textPrimary">
                                        {task.title}
                                    </Typography>
                                    {task.description && <Typography variant="body1" color="textSecondary" id="transition-modal-description">
                                        {task.description}
                                    </Typography>}
                                    <div className={classes.modalSubHeader}>
                                        <PersonIcon fontSize="small" color="action" />
                                        <Typography variant="subtitle1" gutterBottom color="textSecondary">
                                            Owner : {ownerName}
                                        </Typography>
                                    </div>
                                    <div className={classes.modalSubHeader}>
                                        <CalendarTodayIcon fontSize="small" color="action" />
                                        <Typography variant="subtitle1" gutterBottom color="textSecondary">
                                            Due Date: {formatDate(task.deadline)}
                                        </Typography>
                                    </div>
                                    <div className={classes.statusContainer}>
                                        {getStatusIcon(task.type)}
                                        <Typography variant="body2" color="textSecondary">
                                            Status : {task.type}
                                        </Typography>
                                    </div>
                                </div>
                            </Fade>
                        </Modal>
                    </Box>
                    <ConfirmationDialog
                        open={deleteConfirmationOpen}
                        onClose={handleCloseDeleteConfirmation}
                        onConfirm={handleConfirmDelete}
                        title="Confirm Delete"
                        message="Are you sure you want to delete this task?"
                    />
                </div>
            )}
        </Draggable>
    );
};

export default SingleTask;