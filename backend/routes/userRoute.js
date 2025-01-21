import express from "express";
import {User} from "../models/userModel.js";

const userRouter  = express.Router();

userRouter.get('', async(req, res) => {
    try{
        const users = await User.find({});
        return res.status(200).json({
            count: users.length,
            data: users
        });
    }

    catch(err){
        res.status(500).send({message: 'Something went wrong'});
    }
})

userRouter.post('/create', async(req, res) => {
    try {
        if(!req.body.name) {
            return res.status(400).send({message: 'Required name field'});
        }

        const newUser = {
          name: req.body.name,
          mentor: req.body.mentor
        };

        const name = await User.create(newUser);
        return res.status(201).send(name);
    }
    catch (error) {
        return res.status(500).send({message: error.message});
    }
})


userRouter.put('/update/:id', async(req, res) => {
    try{
        if(!req.body.name) {
            res.status(404).send({message: 'Required name field'});
        }

        const {id} = req.params;

        const updatedUser = {
            name: req.body.name,
        }

        const result  = await User.findByIdAndUpdate(id, updatedUser, {new: true});

        if(!result) {
            return res.status(404).send({message: 'User not found'});
        }
        return res.status(200).send({message: 'User has been updated', data: result});
    }

    catch(err){
        res.status(500).send({message: err.message});
    }

})

userRouter.delete('/delete/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const result = await User.findByIdAndDelete(id);

        if(!result) {
            return res.status(404).send({message: 'User not found'});
        }
        return res.status(200).send({message: 'User has been deleted'});
    }

    catch(err){
        res.status(500).send({message: err.message});
    }
})

export default userRouter;