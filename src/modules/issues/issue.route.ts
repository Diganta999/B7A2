import { Router } from "express";
import { IssueController } from "./issue.controller";
import checkAuth from "../../middleware/checkAuth";
import { Role } from "../users/user.interface";

const router =Router()

router.post('/',checkAuth(Role.CONTRIBUTOR,Role.MAINTAINER),IssueController.createIssue)

export const IssueRouter = router;