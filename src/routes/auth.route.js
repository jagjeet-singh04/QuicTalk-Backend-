import express from "express";
import { signup , login , logout , updateProfile , checkAuth} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router() ; 


// this should not be get it should be post as it require getting some data to be sent 
router.post('/signup' ,  signup)

// this should not be get it should be post as it require getting some data to be sent 
router.post('/login' , login )

router.post('/logout' , logout)

router.put("/update-profile" ,protectRoute ,  updateProfile)

router.get('/check' , protectRoute , checkAuth)


export default router ; 