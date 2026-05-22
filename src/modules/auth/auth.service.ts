import envConfig from "../../config";
import { pool } from "../../db";
import type { IUser } from "../users/user.interface";
import bcrypt from "bcryptjs";

const signupUser = async (payload: IUser) => {
    const { name, email, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, Number(envConfig.salt_rounds));
    const result = await pool.query(`
        
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING * 
        
        `,[name,email,hashPassword,role])

        delete result.rows[0].password 
        return result;
}



export const AuthService = {
    signupUser
}