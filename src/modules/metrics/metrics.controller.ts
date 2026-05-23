import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { MetricsService } from "./metrics.service";

const getSystemMetrics = async (req: Request, res: Response) => {
    try {
        const data = await MetricsService.getSystemMetrics();

        sendResponse(res, {
            message: "System metrics retrieved successfully",
            statusCode: 200,
            success: true,
            data
        });
    } catch (error: unknown) {
        sendResponse(res, {
            message: "Failed to retrieve system metrics",
            statusCode: 500,
            success: false,
            errors: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const MetricsController = {
    getSystemMetrics
};