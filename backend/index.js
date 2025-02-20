import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import taskRouter from './routes/tasksRoute.js';
import userRouter from './routes/userRoute.js';
import mentorRouter from "./routes/mentorRoute.js";
import {PORT, mongoDBURL} from './config.js';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/task', taskRouter);
app.use('/user', userRouter);
app.use('/mentor', mentorRouter);


mongoose.connect(mongoDBURL)
.then(()=>{
    console.log("Database Connected");

    app.listen(PORT, ()=>{
        console.log(`App is listening to port ${PORT}`)
    })
})

.catch((error)=>{
    console.log("Failed to connect with database");
})