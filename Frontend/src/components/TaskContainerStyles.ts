import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({

    listContainerWrapper:{
        display: 'flex',
        gap: '16px',
        flexWrap: 'nowrap',
    },
    listWrapper:{
      position: 'relative',
    },
    listContainer: {
        height: '500px',
        transition: 'all 0.3s ease',
        scrollbarWidth: 'thin',
        backgroundColor: '#f0f2f5',
        borderRadius: '0px 0px 16px 16px',
        overflowY: 'scroll',
    },
    listHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: theme.spacing(1, 2),
        color: "#fff",
        fontWeight: 'bold',
        boxShadow: '0px 3px 3px -2px rgba(0, 0, 0, 0.2),' +
            ' 0px 3px 4px 0px rgba(0, 0, 0, 0.14),' +
            ' 0px 1px 8px 0px rgba(0, 0, 0, 0.12)',
        borderRadius: '16px 16px 0 0',
        width: '100%',
        zIndex: 1,
        transition: 'background-color 0.3s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxSizing: 'border-box',
        "& svg":{
            marginRight:theme.spacing(1)
        },
        '&.todo': {
            background: '#ff9800',
        },
        '&.doing': {
            background: '#2196f3',
        },
        '&.complete': {
            background: '#4caf50',
        },
    },
    taskCount: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        minWidth: 24,
        minHeight: 24,
        padding: theme.spacing(0.5),
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: 'inherit', // Inherit color from parent
    },
    cardBox: {
        padding: theme.spacing(1, 2),
        transition: 'all 0.3s ease',
        height: 'calc(100% - 100px)',
        overflowY: "auto",
        marginTop: '6px',
        paddingBottom: '20px', // Added bottom padding
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    },
    addTaskButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin:'0px 8px 8px 0px',
        position: 'absolute',
        bottom: 0,
        borderRadius:'50%',
        right: 0,
        // width: '100%',
        boxSizing: "border-box",
    },
    addTaskButton: {
        color: '#fff',
        padding:'6px 6px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border:'1px solid black',
        backgroundColor: 'black', // Keep the original black color
        // width: 'calc(100% - 32px)',
        borderRadius:'50%',
        '&:hover': {
            backgroundColor: '#333',
        },
    },
    addTaskIcon:{
        fontSize:'1.5rem',
        padding:'0px',
    },

}));

export default useStyles;