import type { Request, Response } from "express";

const createIssue =async(req:Request,res:Response)=>{
    console.log(req.headers.authorization)
    console.log(req.body)
}

export const IssueController ={
    createIssue
}