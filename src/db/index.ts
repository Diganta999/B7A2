import { Pool } from "pg"
import envConfig from "../config"
export const pool = new Pool({
    connectionString: envConfig.connection_string
})


export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(15) ,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            
            `)
            console.log("Database connected successfully")
    } catch (error) {
       console.log(error)
    }
} 