import type { IUser } from "../users/user.interface";

const signupUser =(payload:IUser)=>{
    console.log(payload)
}



export const AuthService = {
    signupUser
}