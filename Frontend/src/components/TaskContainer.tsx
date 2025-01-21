import React, { useState } from 'react';
import { Grid, Typography, Box, Paper, Container, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SingleTask from "./SingleTask";
import { Task, TaskRequest } from '../models/Task';
import useStyles from "./TaskContainerStyles";
import User from "../models/User";
import TaskInput from "./TaskInput";
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import TaskEditModal from "./TaskEditModal";

// Import icons
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';


interface Props {
    todo: Task[];
    doing: Task[];
    complete: Task[];
    onAddTask: (task: TaskRequest) => Promise<void>;
    users: User[];
    onUpdateTask: (task: Task) => Promise<void>;
    onDeleteTask: (taskId: string) => Promise<void>;
    onEditTask: (task: Task) => Promise<void>;
}

const TaskContainer = ({ todo, doing, complete, onAddTask, users, onUpdateTask, onDeleteTask, onEditTask }: Props) => {
    const classes = useStyles();
    const [isInputTaskOpen, setIsInputTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleOpenInputTask = () => {
        setIsInputTaskOpen(true);
    };

    const handleCloseInputTask = () => {
        setIsInputTaskOpen(false);
    };


    const handleOpenEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsEditTaskOpen(true);
    };
    const handleCloseEditTask = () => {
        setSelectedTask(null);
        setIsEditTaskOpen(false);
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return; // Dragged outside of a droppable area
        }

        if (destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return; // No change in position
        }


        let movedTask: Task | undefined;

        // Find the moved task
        if (source.droppableId === "todo") {
            movedTask = todo.find((task) => String(task._id) === draggableId);
        } else if (source.droppableId === "doing") {
            movedTask = doing.find((task) => String(task._id) === draggableId);
        } else if (source.droppableId === "complete") {
            movedTask = complete.find((task) => String(task._id) === draggableId);
        }
        if (!movedTask) return;


        // Update task status
        let updatedTask = { ...movedTask, type: destination.droppableId };


        onUpdateTask(updatedTask);

    };



    // Function to select icons based on the title
    const getTitleIcon = (title: string) => {
        switch (title) {
            case "Todo":
                return <AssignmentOutlinedIcon fontSize="small" color="action" />;
            case "Doing":
                return <HourglassEmptyIcon fontSize="small" color="action" />;
            case "Complete":
                return <CheckCircleOutlineIcon fontSize="small" color="action" />;
            default:
                return null; // Return null if title doesn't match
        }
    };


    const renderListHeader = (title: string, tasks: Task[]) => {
        return (
            <div className={`${classes.listHeader} ${title.toLowerCase()}`}>
                {getTitleIcon(title)}
                <Typography variant="h6" align="center">
                    {title}
                </Typography>
                <span className={classes.taskCount}>{tasks.length}</span>
            </div>
        );
    };

    return (
        <Container style={{ marginTop: '50px' }}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Grid container className={classes.listContainerWrapper }>
                    <Grid item xs={12} sm={4} className={classes.listWrapper }>
                        {renderListHeader("Todo", todo)}
                        <Paper elevation={2} className={`${classes.listContainer} `}>
                            <Droppable droppableId="todo">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <Box
                                            className={classes.cardBox}
                                        >
                                            {todo.map((task, index) => (
                                                <SingleTask key={task._id} task={task} users={users} index={index}
                                                            onOpenEdit={() => handleOpenEditTask(task)}
                                                            onDeleteTask={onDeleteTask}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    </div>
                                )}
                            </Droppable>

                        </Paper>
                        <div >
                            <div  className={classes.addTaskButtonContainer} >
                                <a className={classes.addTaskButton} onClick={handleOpenInputTask}>
                                    <AddIcon className={classes.addTaskIcon} />
                                </a>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        {renderListHeader("Doing", doing)}
                        <Paper elevation={3} className={classes.listContainer}>

                            <Droppable droppableId="doing">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <Box
                                            className={classes.cardBox}
                                        >
                                            {doing.map((task, index) => (
                                                <SingleTask key={task._id} task={task} users={users} index={index}
                                                            onOpenEdit={() => handleOpenEditTask(task)}
                                                            onDeleteTask={onDeleteTask}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    </div>
                                )}
                            </Droppable>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        {renderListHeader("Complete", complete)}
                        <Paper elevation={3} className={classes.listContainer}>

                            <Droppable droppableId="complete">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <Box
                                            className={classes.cardBox}
                                        >
                                            {complete.map((task, index) => (
                                                <SingleTask key={task._id} task={task} users={users} index={index}
                                                            onOpenEdit={() => handleOpenEditTask(task)}
                                                            onDeleteTask={onDeleteTask}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    </div>
                                )}
                            </Droppable>
                        </Paper>
                    </Grid>
                </Grid>
            </DragDropContext>
            <TaskInput open={isInputTaskOpen} onClose={handleCloseInputTask} onAddTask={onAddTask} users={users} />
            {selectedTask && <TaskEditModal open={isEditTaskOpen} onClose={handleCloseEditTask} task={selectedTask} users={users} onEditTask={onEditTask} />}
        </Container>
    );
};

export default TaskContainer;