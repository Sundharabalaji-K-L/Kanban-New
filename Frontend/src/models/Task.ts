export  interface Task {
    _id: string;
    title: string;
    owner: string;
    description: string;
    type: string;
    deadline?: string;
}

export  interface TaskRequest {
    title: string;
    owner: string;
    description: string;
    type: string;
    deadline?: string;
}

