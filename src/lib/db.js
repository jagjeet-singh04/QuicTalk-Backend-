import mongoose from "mongoose" 

export const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI) ;
        console.log(`MongoDb Connected sucessfully ${conn.connection.host}`)
    }
    catch(err){
        console.log ("MongoDB connection error:" , err) ; 
    }
}