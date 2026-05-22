import express, { type Application, type Request, type Response } from "express"
import { router } from "./router/route"
import globalErrorHandler from "./middleware/globalErrorHandler"

export const app:Application = express() 

app.use(express.json())
app.use('/api/',router)

app.get('/',(req:Request,res:Response)=>{
    res.send("Hello Developers")
})
app.use(globalErrorHandler)