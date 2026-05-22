import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

const signupUser = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.signupUser(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User created successfully",
            data: result,
        })
    } catch (error:any) {
sendResponse(res,{
    statusCode:400,
    message:error.message,
    success:false
    
})
    }
}



export const AuthController = {
    signupUser
}