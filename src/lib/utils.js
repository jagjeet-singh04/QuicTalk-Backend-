import jwt from "jsonwebtoken"

export const generateToken = (userId , res)=>{
    const token = jwt.sign({userId} , process.env.JWT_SECRET , {
        expiresIn:"7d"
    }
        
    ) ; 

    res.cookie("jwt" , token , {
        MaxAge: 7*24*60*60*1000 , //in MS the token expiry 
        httpOnly: true , //so that not accessible throgh javascript for cross side scripting attack XSS 
        sameSite: "strict" , //prevents CSRF attack corss site forgery attacks 
        secure: process.env.NODE_ENV !== "development"
    })
    return token 
    
}