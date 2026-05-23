import { Router } from "express";
import { UserRoute } from "../modules/users/user.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { IssueRouter } from "../modules/issues/issue.route";
import { MetricsRoute } from "../modules/metrics/metrics.route";

export const router = Router()

const moduleRoute = [
    {
        path:"/user",
        route:UserRoute
    },{
        path:"/auth",
        route:AuthRoute
    },
    {
        path:"/issues",
        route:IssueRouter 
    },
    {
        path: "/metrics",
        route: MetricsRoute
    }
]

moduleRoute.forEach((route)=>{
    router.use(route.path,route.route)
})





