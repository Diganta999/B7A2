import { Router } from "express";
import { IssueController } from "./issue.controller";

const router =Router()

router.post('/',IssueController.createIssue)

export const IssueRouter = router;