import { pool } from "../../db";

const getSystemMetrics = async () => {
    // 1. Fetch total users
    const usersCountResult = await pool.query(`SELECT COUNT(*) FROM users`);
    const totalUsers = parseInt(usersCountResult.rows[0].count, 10);

    // 2. Fetch total issues
    const issuesCountResult = await pool.query(`SELECT COUNT(*) FROM issues`);
    const totalIssues = parseInt(issuesCountResult.rows[0].count, 10);

    // 3. Fetch issue breakdown by status
    const statusResult = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM issues 
        GROUP BY status
    `);
    
    // Convert array of {status, count} to an object map
    const statusDistribution: Record<string, number> = {};
    statusResult.rows.forEach(row => {
        statusDistribution[row.status] = parseInt(row.count, 10);
    });

    return {
        totalUsers,
        totalIssues,
        statusDistribution
    };
};

export const MetricsService = {
    getSystemMetrics
};