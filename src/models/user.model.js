import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type:String , 
            required: true , 
            unique: true , 
            trim: true ,
            lowercase: true ,
        }, 
        fullName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-z0-9._]+$/, // Optional: enforce pattern in schema too
        },
        password:{
            type:String , 
            required: true , 
            trim: true ,
            minlength: 6 , 
        },
        profilePic:{
            type:String , 
            default: "" , 
        },
    }, 
    {timestamps : true }
)

const User = mongoose.model("User" , userSchema ) ; 

export default User ; 