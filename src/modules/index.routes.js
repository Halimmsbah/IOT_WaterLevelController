import dotenv  from "dotenv"
import { globalError } from "../middleware/globalError.js"
import authRouter from "./auth/auth.routes.js"
import userRouter from "./user/user.routes.js"
import sensorRouter from "./sensors/sensor.routes.js"
export const bootstrap=(app)=>{
    dotenv.config()
    
    app.get('/', (req, res) => res.send('Hello World!'))
    app.use('/api/v1/users',userRouter)
    app.use('/api/v1/auth',authRouter) 
    app.use('/api/v1/sensor',sensorRouter) 
    app.use(globalError)
}