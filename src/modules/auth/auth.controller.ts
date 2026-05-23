import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

const signupUser = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.signupUser(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        })
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 400,
            message: "Failed to register user",
            success: false,
            errors: error instanceof Error ? error.message : "An unknown error occurred"

        })
    }
}
const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.loginUser(req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: result,
        })
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 401,
            message: "Login failed",
            success: false,
            errors: error instanceof Error ? error.message : "An unknown error occurred"

        })
    }
}



export const AuthController = {
    signupUser,
    loginUser
}