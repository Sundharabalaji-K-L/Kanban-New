import TaskContainer from "../components/TaskContainer";
import User from "../models/User";
import { useEffect, useState, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import Loader from "../components/Loader/Loader";
import { Snackbar, Box, FormControl, InputLabel } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { TaskRequest, Task } from "../models/Task";
import FilterByUser from "../components/FilterByUser";
import { makeStyles } from '@material-ui/core/styles';

interface TaskResponse {
    count: number;
    data: Task[];
}

interface UserResponse {
    count: number;
    data: User[];
}

const useStyles = makeStyles((theme) => ({
    filterContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginRight: theme.spacing(4),
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
    },
    filter:{
        minWidth: '220px',
        maxWidth: '300px',

    }

}));


const KanbanBoard = () => {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [todoTasks, setTodos] = useState<Task[]>([]);
    const [doingTasks, setDoingTasks] = useState<Task[]>([]);
    const [completeTasks, setCompleteTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filterUsers, setFilterUsers] = useState<User[]>([]);
    const [selectedFilterUser, setSelectedFilterUser] = useState<string | null>("All");

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const taskResponse = await axios.get<TaskResponse>("http://localhost:5555/task");
            const userResponse = await axios.get<UserResponse>("http://localhost:5555/user");

            const tasks: Task[] = taskResponse.data.data;
            const usersData: User[] = userResponse.data.data;

            const newTodoTasks: Task[] = tasks.filter((task: Task) => task.type === 'todo');
            const newDoingTasks: Task[] = tasks.filter((task: Task) => task.type === 'doing');
            const newCompleteTasks: Task[] = tasks.filter((task: Task) => task.type === 'complete');

            setTodos(newTodoTasks);
            setDoingTasks(newDoingTasks);
            setCompleteTasks(newCompleteTasks);
            setUsers(usersData);
            setFilterUsers(usersData);
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                setError(axiosError.message);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);


    const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };


    const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const HandleAddTask = async (task: TaskRequest) => {
        // Optimistic update: Add task to state before backend call
        const newTask: Task = { ...task, _id: String(Date.now()), type: "todo" }; // Temporary ID for optimistic update
        setTodos(prevTodoTasks => [ newTask, ...prevTodoTasks]);

        try {
            const response = await axios.post("http://localhost:5555/task/create", task);
            if (response.status === 201) {
                // Replace temporary ID with actual ID from response
                setTodos(prevTodoTasks =>
                    prevTodoTasks.map(t => (t._id === newTask._id ? response.data : t))
                );
                showSnackbar("Task added successfully", "success");
                fetchAllData()
            } else {
                // Revert optimistic update
                setTodos(prevTodoTasks => prevTodoTasks.filter(t => t._id !== newTask._id));
                showSnackbar("Failed to add task", "error");
            }
        } catch (error: any) {
            // Revert optimistic update
            setTodos(prevTodoTasks => prevTodoTasks.filter(t => t._id !== newTask._id));

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                showSnackbar(axiosError.message, "error")

            } else if (error instanceof Error) {
                showSnackbar(error.message, "error")
            } else {
                showSnackbar("An unknown error occurred", "error")
            }
        }
    };

    const handleUpdateTask = async (task: Task) => {
        // Optimistic update: Update state before backend call
        let prevTodoTasks = [...todoTasks];
        let prevDoingTasks = [...doingTasks];
        let prevCompleteTasks = [...completeTasks];


        //remove the existing task and add it in the next state
        setTodos(prevTodoTasks => prevTodoTasks.filter(t => t._id !== task._id));
        setDoingTasks(prevDoingTasks => prevDoingTasks.filter(t => t._id !== task._id));
        setCompleteTasks(prevCompleteTasks => prevCompleteTasks.filter(t => t._id !== task._id));


        if (task.type === "todo") setTodos(prevTodoTasks => [task, ...prevTodoTasks]);
        if (task.type === "doing") setDoingTasks(prevDoingTasks => [task, ...prevDoingTasks]);
        if (task.type === "complete") setCompleteTasks(prevCompleteTasks => [task, ...prevCompleteTasks]);

        try {
            const response = await axios.put(`http://localhost:5555/task/update/${task._id}`, task);
            if (response.status === 200) {
                showSnackbar("Task updated successfully", "success");
            } else {
                // Revert optimistic update
                setTodos(prevTodoTasks);
                setDoingTasks(prevDoingTasks);
                setCompleteTasks(prevCompleteTasks);
                showSnackbar("Failed to update task", "error");
            }


        } catch (error: any) {
            // Revert optimistic update
            setTodos(prevTodoTasks);
            setDoingTasks(prevDoingTasks);
            setCompleteTasks(prevCompleteTasks);

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

    const handleDeleteTask = async (taskId: string) => {
        // Optimistic update: Remove task from state before backend call
        let prevTodoTasks = [...todoTasks];
        let prevDoingTasks = [...doingTasks];
        let prevCompleteTasks = [...completeTasks];

        setTodos(prevTodoTasks => prevTodoTasks.filter(t => t._id !== taskId));
        setDoingTasks(prevDoingTasks => prevDoingTasks.filter(t => t._id !== taskId));
        setCompleteTasks(prevCompleteTasks => prevCompleteTasks.filter(t => t._id !== taskId));


        try {
            const response = await axios.delete(`http://localhost:5555/task/delete/${taskId}`);
            if (response.status === 200) {
                showSnackbar("Task deleted successfully", "success");
            }
            else {
                // Revert optimistic update
                setTodos(prevTodoTasks);
                setDoingTasks(prevDoingTasks);
                setCompleteTasks(prevCompleteTasks);
                showSnackbar("Failed to delete task", "error");
            }
        } catch (error: any) {
            // Revert optimistic update
            setTodos(prevTodoTasks);
            setDoingTasks(prevDoingTasks);
            setCompleteTasks(prevCompleteTasks);

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
    const handleEditTask = async (task: Task) => {
        // Optimistic update
        let prevTodoTasks = [...todoTasks];
        let prevDoingTasks = [...doingTasks];
        let prevCompleteTasks = [...completeTasks];

        //remove the existing task and add it in the next state
        setTodos(prevTodoTasks => prevTodoTasks.filter(t => t._id !== task._id));
        setDoingTasks(prevDoingTasks => prevDoingTasks.filter(t => t._id !== task._id));
        setCompleteTasks(prevCompleteTasks => prevCompleteTasks.filter(t => t._id !== task._id));

        if (task.type === "todo") setTodos(prevTodoTasks => [task, ...prevTodoTasks]);
        if (task.type === "doing") setDoingTasks(prevDoingTasks => [task, ...prevDoingTasks]);
        if (task.type === "complete") setCompleteTasks(prevCompleteTasks => [task, ...prevCompleteTasks]);

        try {
            const response = await axios.put(`http://localhost:5555/task/update/${task._id}`, task);
            if (response.status === 200) {
                showSnackbar("Task updated successfully", "success");
            } else {
                // Revert optimistic update
                setTodos(prevTodoTasks);
                setDoingTasks(prevDoingTasks);
                setCompleteTasks(prevCompleteTasks);
                showSnackbar("Failed to update task", "error");
            }

        } catch (error: any) {
            // Revert optimistic update
            setTodos(prevTodoTasks);
            setDoingTasks(prevDoingTasks);
            setCompleteTasks(prevCompleteTasks);

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
    const handleFilterChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        setSelectedFilterUser(event.target.value as string | null);
    };


    // Filter Tasks function
    const filterTasksByOwner = (tasks: Task[]): Task[] => {
        if (selectedFilterUser == 'All') return tasks; // If no filter is selected, return all tasks
        return tasks.filter((task: Task) => task.owner === selectedFilterUser)
    }

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div>Error: {error}</div>
    }


    return (
        <>
            <Box className={classes.filterContainer}>
                <div className={classes.filter}>
                    <FilterByUser filterUsers={filterUsers} selectedFilterUser={selectedFilterUser} onFilterChange={handleFilterChange} />
                </div>
            </Box>
            <TaskContainer
                todo={filterTasksByOwner(todoTasks)}
                doing={filterTasksByOwner(doingTasks)}
                complete={filterTasksByOwner(completeTasks)}
                onAddTask={HandleAddTask}
                users={users}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
            />
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} style={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    )
}

export default KanbanBoard;