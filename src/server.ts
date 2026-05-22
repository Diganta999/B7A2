import { app } from "./app"
import envConfig from "./config"
import { initDB } from "./db"

const main =()=>{
    app.listen(envConfig.port,()=>{
        initDB()
        console.log(`Example app listening on port ${envConfig.port}`)
    })
}
main()