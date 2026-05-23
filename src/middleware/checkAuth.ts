import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import envConfig from "../config";
import { pool } from "../db";
import { sendResponse } from "../utils/sendResponse";
const checkAuth = (...authRole: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.headers.authorization;

      if (!token) {
        return sendResponse(res,{
            message: "Missing or invalid JWT token",
            statusCode:401,
            success:false,
            errors: "Unauthorized"
        })
      }

      if (token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      let decodedToken;
      try {
        decodedToken = jwt.verify(
          token,
          envConfig.jwt_access_secret as string
        ) as JwtPayload;
      } catch (err: unknown) {
        return sendResponse(res, {
            message: "Expired or invalid JWT token",
            statusCode: 401,
            success: false,
            errors: err instanceof Error ? err.message : "Invalid token"
        });
      }

      const userData = await pool.query(
        `SELECT * FROM users WHERE id=$1`,
        [decodedToken.id]
      );

      const user = userData.rows[0];

      if (!user) {
        return sendResponse(res,{
             message: "User not found",
             statusCode:404,
             success:false,
             errors: "No user matching token"
        })
      }
      

      if (authRole.length && !authRole.includes(user.role)) {
        return sendResponse(res,{
            message: "Insufficient permissions" ,
            statusCode:403,
            success:false,
            errors: "Forbidden"
        })
      }

      req.user = user;

      next();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "invalid token";
      return sendResponse(res, {
        message: "Invalid or expired token",
        statusCode: 401,
        success: false,
        errors: errorMessage
      });
    }
  };
};
export default checkAuth;