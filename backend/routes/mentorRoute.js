import express from "express";
import {Mentor} from "../models/MentorModel.js";
import {User} from "../models/userModel.js";
const mentorRouter  = express.Router();

mentorRouter.get('', async(req, res) => {
    try{
        const mentors = await Mentor.find({});
        return res.status(200).json({
            count: mentors.length,
            data: mentors
        });
    }

    catch(err){
        res.status(500).send({message: 'Something went wrong'});
    }
})

mentorRouter.post('/create', async(req, res) => {
    try {
        if(!req.body.name) {
            return res.status(400).send({message: 'Required name field'});
        }

        const newMentor = {
            name: req.body.name,
        };

        const name = await Mentor.create(newMentor);
        return res.status(201).send(name);
    }
    catch (error) {
        return res.status(500).send({message: error.message});
    }
})


mentorRouter.put('/update/:id', async(req, res) => {
    try{
        if(!req.body.name) {
            res.status(404).send({message: 'Required name field'});
        }

        const {id} = req.params;

        const updatedMentor = {
            name: req.body.name,
        }

        const result  = await Mentor.findByIdAndUpdate(id, updatedMentor, {new: true});

        if(!result) {
            return res.status(404).send({message: 'Mentor not found'});
        }
        return res.status(200).send({message: 'Mentor has been updated', data: result});
    }

    catch(err){
        res.status(500).send({message: err.message});
    }

})

mentorRouter.delete('/delete/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const result = await Mentor.findByIdAndDelete(id);

        if(!result) {
            return res.status(404).send({message: 'Mentor not found'});
        }
        return res.status(200).send({message: 'Mentor has been deleted'});
    }

    catch(err){
        res.status(500).send({message: err.message});
    }
})


export default mentorRouter;