import { Router } from "express";
import { MetricsController } from "./metrics.controller";
import checkAuth from "../../middleware/checkAuth";
import { Role } from "../users/user.interface";

const router = Router();

router.get('/', checkAuth(Role.MAINTAINER), MetricsController.getSystemMetrics);

export const MetricsRoute = router;