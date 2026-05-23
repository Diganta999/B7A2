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
            message:"unauthorized",
            statusCode:401,
            success:false

        })
      }

      if (token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      const decodedToken = jwt.verify(
        token,
        envConfig.jwt_access_secret as string
      ) as JwtPayload;

      const userData = await pool.query(
        `SELECT * FROM users WHERE id=$1`,
        [decodedToken.id]
      );

      const user = userData.rows[0];

      if (!user) {
        return res.status(401).json({ message: "user not found" });
      }
      

      if (authRole.length && !authRole.includes(user.role)) {
        return res.status(403).json({ message: "forbidden" });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "invalid token",
      });
    }
  };
};
export default checkAuth;