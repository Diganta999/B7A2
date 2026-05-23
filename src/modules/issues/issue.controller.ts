import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { IssueServices } from "./issue.service";
import type { IUser } from "../users/user.interface";

const createIssue =async(req:Request,res:Response)=>{
   try {
    const user = req.user as IUser;
    if(!user){
        throw new Error("user is not exist :issue")
    }
    const result = await IssueServices.createIssue(user,req.body)
    sendResponse(res,{
        message:"Issue created successfully",
        statusCode:400,
        success:true,
        data:result.rows[0]
    })
   } catch (error:any) {
    sendResponse(res,{
        message:error.message,
        statusCode:400,
        success:false
    })
   }
}

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const issues = await IssueServices.getAllIssues(req.query);

        sendResponse(res, {
            message: "Issues retrieved successfully",
            statusCode: 200,
            success: true,
            data: issues
        });
    } catch (error: any) {
        sendResponse(res, {
            message: error.message,
            statusCode: 500,
            success: false
        });
    }
};

const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const id  = req.params.id as string;
        const issue = await IssueServices.getSingleIssue(id);

        if (!issue) {
            return sendResponse(res, {
                message: "Issue not found",
                statusCode: 404,
                success: false
            });
        }

        sendResponse(res, {
            message: "Issue retrieved successfully",
            statusCode: 200,
            success: true,
            data: issue
        });
    } catch (error: any) {
        sendResponse(res, {
            message: "Failed to retrieve issue",
            statusCode: 500,
            success: false
        });
    }
};

const updateIssue = async (req: Request, res: Response) => {
    try {
        const issueId = req.params.id as string;
        const currentUser = req.user as IUser;
        
        if (!currentUser) {
            throw new Error("User does not exist in request context");
        }

        // Pass the request data to the service for validation and database updates
        const updatedIssue = await IssueServices.updateIssue(issueId, currentUser, req.body);

        sendResponse(res, {
            message: "Issue updated successfully",
            statusCode: 200,
            success: true,
            data: updatedIssue
        });
    } catch (error: any) {
        // Map service layer errors to appropriate HTTP status codes
        let statusCode = 400; // Bad Request defaults
        
        if (error.message === "Issue not found") {
            statusCode = 404; // Not Found
        } else if (error.message.includes("permission")) {
            statusCode = 403; // Forbidden
        }

        sendResponse(res, {
            message: error.message,
            statusCode: statusCode,
            success: false
        });
    }
};

export const IssueController ={
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue
}