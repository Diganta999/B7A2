import { Router } from "express";
import { IssueController } from "./issue.controller";
import checkAuth from "../../middleware/checkAuth";
import { Role } from "../users/user.interface";

const router =Router()

router.post('/',checkAuth(Role.CONTRIBUTOR,Role.MAINTAINER),IssueController.createIssue)
router.get('/', IssueController.getAllIssues)
router.get('/:id', IssueController.getSingleIssue)
router.patch('/:id', checkAuth(Role.CONTRIBUTOR, Role.MAINTAINER), IssueController.updateIssue)
router.delete('/:id', checkAuth(Role.MAINTAINER), IssueController.deleteIssue)

export const IssueRouter = router;