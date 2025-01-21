import mongoose from 'mongoose';

const mentorSchema = mongoose.Schema({
        name: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)



export const Mentor = mongoose.model("mentors", mentorSchema);