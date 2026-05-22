import envConfig from "../../config";
import { pool } from "../../db";
import type { IUser } from "../users/user.interface";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const signupUser = async (payload: IUser) => {
    const { name, email, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, Number(envConfig.salt_rounds));
    const result = await pool.query(`
        
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING * 
        
        `,[name,email,hashPassword,role])

        delete result.rows[0].password 
        return result;
}

const loginUser = async(payload:Partial<IUser>)=>{
       const {email,password}=payload;
      const result = await pool.query(`
      SELECT * FROM users WHERE email = $1  
        `, [email])

        if(result.rows.length===0){
            throw new Error("Invalid credentials")
        }
        const user = result.rows[0];
        const matchPassword = await bcrypt.compare(password as string,user.password)
        if(!matchPassword){
             throw new Error("Invalid credentials")
        }
        delete result.rows[0].password 
        const jwtPayload = {
            id:user.id,
            name:user.name,
            role:user.role

        }
        const accessToken =  jwt.sign(jwtPayload,envConfig.jwt_access_secret as string,{ expiresIn:envConfig.ACCESS_TOKEN_EXPIRED_TIME } as jwt.SignOptions)
 
        const refreshToken = jwt.sign(jwtPayload, envConfig.jwt_refresh_secret as string, { expiresIn: envConfig.REFRESH_TOKEN_EXPIRED_TIME as string }as jwt.SignOptions)
        return {Token:{accessToken,refreshToken},user}
}



export const AuthService = {
    signupUser,
    loginUser
    
}