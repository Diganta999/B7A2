import type { NextFunction, Request, Response } from "express";

const globalErrorHandler  = async(err: unknown,req:Request,res:Response,next:NextFunction)=>{
     const errorMessage = err instanceof Error ? err.message : "Unexpected server error";
     res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: errorMessage,
  });
}
export default globalErrorHandler;