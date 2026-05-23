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
        statusCode: 201,
        success:true,
        data:result.rows[0]
    })
   } catch (error: unknown) {
    sendResponse(res,{
        message:"Failed to create issue",
        statusCode:400,
        success:false,
        errors: error instanceof Error ? error.message : "Unknown error"
    })
   }
}

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const issues = await IssueServices.getAllIssues(req.query as Record<string, unknown>);

        sendResponse(res, {
            message: "Issues retrieved successfully",
            statusCode: 200,
            success: true,
            data: issues
        });
    } catch (error: unknown) {
        sendResponse(res, {
            message: "Failed to retrieve issues",
            statusCode: 500,
            success: false,
            errors: error instanceof Error ? error.message : "Unknown error"
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
                success: false,
                errors: "No issue exists with the provided ID"
            });
        }

        sendResponse(res, {
            message: "Issue retrieved successfully",
            statusCode: 200,
            success: true,
            data: issue
        });
    } catch (error: unknown) {
        sendResponse(res, {
            message: "Failed to retrieve issue",
            statusCode: 500,
            success: false,
            errors: error instanceof Error ? error.message : "Unknown error"
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
    } catch (error: unknown) {
        // Map service layer errors to appropriate HTTP status codes
        let statusCode = 400; // Bad Request defaults
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        if (errorMessage === "Issue not found") {
            statusCode = 404; // Not Found
        } else if (errorMessage.includes("permission")) {
            statusCode = 403; // Forbidden
        } else if (errorMessage.includes("resolved") || errorMessage.includes("conflict")) {
            statusCode = 409; // Conflict
        }

        sendResponse(res, {
            message: "Failed to update issue",
            statusCode: statusCode,
            success: false,
            errors: errorMessage
        });
    }
};

const deleteIssue = async (req: Request, res: Response) => {
    try {
        const issueId = req.params.id as string;
        
        await IssueServices.deleteIssue(issueId);

        sendResponse(res, {
            message: "Issue deleted successfully",
            statusCode: 200,
            success: true
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        sendResponse(res, {
            message: "Failed to delete issue",
            statusCode: errorMessage === "Issue not found" ? 404 : 500,
            success: false,
            errors: errorMessage
        });
    }
};

export const IssueController ={
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}