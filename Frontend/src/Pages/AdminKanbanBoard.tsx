import TaskContainer from "../components/TaskContainer";
import User from "../models/User";
import { useEffect, useState, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import Loader from "../components/Loader/Loader";
import { Snackbar, Button, Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { TaskRequest, Task } from "../models/Task";
import AddUserModal from "../components/AddUserModal";
import { makeStyles } from "@material-ui/core/styles";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupIcon from '@material-ui/icons/Group';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import FilterByUser from "../components/FilterByUser";
import UserListModal from "../components/UserListModal"; // Import the new modal component
import AddMentorModal from "../components/AddMentorModal";
import MentorListModal from "../components/MentorListModal"; // Import MentorListModal

interface TaskResponse {
    count: number;
    data: Task[];
}

interface UserResponse {
    count: number;
    data: User[];
}

interface MentorResponse {
    count: number;
    data: User[];
}

const useStyles = makeStyles((theme) => ({
    buttonRow: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
    addButton: {
        backgroundColor: "black",
        color: "white",
        "&:hover": {
            backgroundColor: "#333",
        },
        padding: "8px 16px",
        marginLeft: theme.spacing(1),
    },
}));

const AdminKanbanBoard = () => {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [todoTasks, setTodos] = useState<Task[]>([]);
    const [doingTasks, setDoingTasks] = useState<Task[]>([]);
    const [completeTasks, setCompleteTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filterUsers, setFilterUsers] = useState<User[]>([]);
    const [selectedFilterUser, setSelectedFilterUser] = useState<string | null>('All');
    const [mentors, setMentors] = useState<User[]>([]);
    const [addMentorModalOpen, setAddMentorModalOpen] = useState(false);
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [userListModalOpen, setUserListModalOpen] = useState(false);
    const [mentorListModalOpen, setMentorListModalOpen] = useState(false);


    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const taskResponse = await axios.get<TaskResponse>("http://localhost:5555/task");
            const userResponse = await axios.get<UserResponse>("http://localhost:5555/user");
            const mentorResponse = await axios.get<MentorResponse>("http://localhost:5555/mentor");

            const tasks: Task[] = taskResponse.data.data;
            const usersData: User[] = userResponse.data.data;
            const mentorData: User[] = mentorResponse.data.data;



            const newTodoTasks: Task[] = tasks.filter((task: Task) => task.type === 'todo');
            const newDoingTasks: Task[] = tasks.filter((task: Task) => task.type === 'doing');
            const newCompleteTasks: Task[] = tasks.filter((task: Task) => task.type === 'complete');

            setMentors(mentorData);
            setTodos(newTodoTasks);
            setDoingTasks(newDoingTasks);
            setCompleteTasks(newCompleteTasks);
            setUsers(usersData);
            setFilterUsers(usersData);



        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                // Handle axios specific errors
                const axiosError = error as AxiosError;
                setError(axiosError.message);

            } else if (error instanceof Error) {
                // Handle JavaScript errors
                setError(error.message);
            } else {
                // Handle other types of errors
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
        try {
            const response = await axios.post("http://localhost:5555/task/create", task);
            if (response.status === 201) {
                setTodos(prevTodoTasks => [...prevTodoTasks, response.data]);
                showSnackbar("Task added successfully", "success");
                fetchAllData()
            } else {
                setError("Failed to add task");
                showSnackbar("Failed to add task", "error");
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                // Handle axios specific errors
                const axiosError = error as AxiosError;
                setError(axiosError.message);
                showSnackbar(axiosError.message, "error")

            } else if (error instanceof Error) {
                // Handle JavaScript errors
                setError(error.message);
                showSnackbar(error.message, "error")
            } else {
                // Handle other types of errors
                setError("An unknown error occurred.");
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


        if (task.type === "todo") setTodos(prevTodoTasks => [...prevTodoTasks, task]);
        if (task.type === "doing") setDoingTasks(prevDoingTasks => [...prevDoingTasks, task]);
        if (task.type === "complete") setCompleteTasks(prevCompleteTasks => [...prevCompleteTasks, task]);

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
                // Handle axios specific errors
                const axiosError = error as AxiosError;
                showSnackbar(axiosError.message, "error");

            } else if (error instanceof Error) {
                // Handle JavaScript errors
                showSnackbar(error.message, "error");
            } else {
                // Handle other types of errors
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
                //fetchAllData()
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
                // Handle axios specific errors
                const axiosError = error as AxiosError;
                showSnackbar(axiosError.message, "error");

            } else if (error instanceof Error) {
                // Handle JavaScript errors
                showSnackbar(error.message, "error");
            } else {
                // Handle other types of errors
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

        if (task.type === "todo") setTodos(prevTodoTasks => [...prevTodoTasks, task]);
        if (task.type === "doing") setDoingTasks(prevDoingTasks => [...prevDoingTasks, task]);
        if (task.type === "complete") setCompleteTasks(prevCompleteTasks => [...prevCompleteTasks, task]);

        try {
            const response = await axios.put(`http://localhost:5555/task/update/${task._id}`, task);
            if (response.status === 200) {
                showSnackbar("Task updated successfully", "success");
                //fetchAllData()
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
                // Handle axios specific errors
                const axiosError = error as AxiosError;
                showSnackbar(axiosError.message, "error");
            } else if (error instanceof Error) {
                // Handle JavaScript errors
                showSnackbar(error.message, "error");
            } else {
                // Handle other types of errors
                showSnackbar("An unknown error occurred", "error");
            }
        }
    };
    const handleFilterChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        setSelectedFilterUser(event.target.value as string | null);
    };


    // Filter Tasks function
    const filterTasksByOwner = (tasks: Task[]): Task[] => {
        if (selectedFilterUser === 'All') return tasks; // If no filter is selected, return all tasks
        return tasks.filter((task: Task) => task.owner === selectedFilterUser)
    }
    const handleAddUserModalOpen = () => {
        setAddUserModalOpen(true);
    };
    const handleAddUserModalClose = () => {
        setAddUserModalOpen(false);
    };
    const handleAddMentorModalOpen = () => {
        setAddMentorModalOpen(true);
    };
    const handleAddMentorModalClose = () => {
        setAddMentorModalOpen(false);
    };


    const handleUserListModalOpen = () => {
        setUserListModalOpen(true);
    };

    const handleUserListModalClose = () => {
        setUserListModalOpen(false);
    };
    const handleMentorListModalOpen = () => {
        setMentorListModalOpen(true);
    };
    const handleMentorListModalClose = () => {
        setMentorListModalOpen(false);
    };

    const handleUserAdded = async (newUser: User) => {
        setUsers(prevUsers => [...prevUsers, newUser]);
    };
    const handleUserUpdated = async (updatedUser: User) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
        );
    };
    const handleUserDeleted = async (userId: string) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    };
    const handleMentorAdded = async (newMentor: User) => {
        setMentors(prevMentors => [...prevMentors, newMentor]);
    };
    const handleMentorUpdated = async (updatedMentor: User) => {
        setMentors((prevMentors) =>
            prevMentors.map((mentor) => (mentor._id === updatedMentor._id ? updatedMentor : mentor))
        );
    };
    const handleMentorDeleted = async (mentorId: string) => {
        setMentors((prevMentors) => prevMentors.filter((mentor) => mentor._id !== mentorId));
    };


    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    return (
        <>
            <Box mb={2} display="flex" justifyContent="space-between" style={{ marginRight: '50px', marginLeft: '50px' }}>
                <FilterByUser filterUsers={filterUsers} selectedFilterUser={selectedFilterUser} onFilterChange={handleFilterChange} />

                <Box>

                    <Button
                        variant="contained"
                        className={classes.addButton}
                        onClick={handleAddMentorModalOpen}
                        startIcon={<PersonAddIcon />}
                    >
                        Add Mentor
                    </Button>

                    <Button
                        variant="contained"
                        className={classes.addButton}
                        onClick={handleMentorListModalOpen}
                        startIcon={<GroupIcon />}
                    >
                        Show Mentors
                    </Button>

                    <Button
                        variant="contained"
                        className={classes.addButton}
                        onClick={handleAddUserModalOpen}
                        startIcon={<PersonAddIcon />}
                    >
                        Add User
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.addButton}
                        onClick={handleUserListModalOpen}
                        startIcon={<GroupIcon />}
                    >
                        Show Users
                    </Button>


                    <Button
                        variant="contained"
                        className={classes.addButton}
                        onClick={() => console.log('create meeting')}
                        startIcon={<VideoCallIcon />} // Changed to VideoCallIcon
                    >
                        Create Meeting
                    </Button>
                </Box>

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
            <AddMentorModal
                open={addMentorModalOpen}
                onClose={handleAddMentorModalClose}
                onMentorAdded={handleMentorAdded}
                showSnackbar={showSnackbar}
            />
            <AddUserModal
                open={addUserModalOpen}
                onClose={handleAddUserModalClose}
                mentors={mentors}
                onUserAdded={handleUserAdded}
                showSnackbar={showSnackbar}
            />
            <UserListModal
                open={userListModalOpen}
                onClose={handleUserListModalClose}
                users={users}
                onUserUpdated={handleUserUpdated}
                onUserDeleted={handleUserDeleted}
                showSnackbar={showSnackbar}
                mentors={mentors}
            />
            <MentorListModal
                open={mentorListModalOpen}
                onClose={handleMentorListModalClose}
                mentors={mentors}
                onMentorUpdated={handleMentorUpdated}
                onMentorDeleted={handleMentorDeleted}
                showSnackbar={showSnackbar}
            />
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} style={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};


export default AdminKanbanBoard;