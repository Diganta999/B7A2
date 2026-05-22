import dotenv from "dotenv"
import fs from "fs"
import path from 'path'

dotenv.config({
    path:path.join(process.cwd(),".env")
})


const envConfig ={
     connection_string : process.env.CONNECTION_STRING as string,
    port : process.env.PORT,
    salt_rounds : process.env.SALT_ROUNDS,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret:process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRED_TIME:process.env.ACCESS_TOKEN_EXPIRED_TIME,
    REFRESH_TOKEN_EXPIRED_TIME:process.env.REFRESH_TOKEN_EXPIRED_TIME
}

export default envConfig;