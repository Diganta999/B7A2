import { pool } from "../../db";
import type { IUser } from "../users/user.interface";
import type { IIssue } from "./issue.interface";

const createIssue = async (userData: IUser, data: IIssue) => {
    const { title, description, type } = data;
    
    if (!title || title.length > 150) {
        throw new Error("Validation Error: Title is required and must be maximum 150 characters.");
    }
    if (!description || description.length < 20) {
        throw new Error("Validation Error: Description is required and must be minimum 20 characters.");
    }
    if (type !== "bug" && type !== "feature_request") {
        throw new Error("Validation Error: Type must be either 'bug' or 'feature_request'.");
    }

    const reporter_id = userData.id;

    const result = await pool.query(`
        INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) 
        RETURNING *
    `, [title, description, type, reporter_id]);

    return result;
};

const getAllIssues = async (query: Record<string, unknown>) => {
    const { sort = "newest", type, status } = query;

    // Default sorting is newest (created_at DESC)
    const orderDirection = sort === "oldest" ? "ASC" : "DESC";

    // Build the WHERE clause dynamically
    const conditions = [];
    const values = [];

    if (type) {
        values.push(type);
        conditions.push(`type = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const queryText = `
        SELECT * FROM issues 
        ${whereClause} 
        ORDER BY created_at ${orderDirection}
    `;

    // 1. Get issues
    const issuesResult = await pool.query(queryText, values);
    const issues = issuesResult.rows;

    if (issues.length === 0) return [];

    // 2. Extract unique reporter IDs
    const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

    // 3. Fetch reporters 
    // Uses ANY($1::int[]) to find all users whose ID is in the array
    const reportersResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
        [reporterIds]
    );
    const reporters = reportersResult.rows;

    // Create a map to easily look up reporters by their ID
    const reporterMap = new Map();
    reporters.forEach((reporter) => {
        reporterMap.set(reporter.id, reporter);
    });

    // 4. Attach reporter data to issues and format the result
    const formattedIssues = issues.map((issue) => {
        // Extract out reporter_id and keep everything else
        const { reporter_id, ...issueData } = issue;
        return {
            ...issueData,
            reporter: reporterMap.get(reporter_id) // attach the reporter we found
        };
    });

    return formattedIssues;
};

const getSingleIssue = async (id: string) => {
    // 1. Fetch the specific issue
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
    const issue = issueResult.rows[0];

    if (!issue) {
        return null;
    }

    // 2. Fetch the reporter using the issue's reporter_id
    const reporterResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = $1`,
        [issue.reporter_id]
    );
    const reporter = reporterResult.rows[0];

    // 3. Format and attach reporter to the issue
    const { reporter_id, ...issueData } = issue;
    
    return {
        ...issueData,
        reporter
    };
};

/**
 * Updates an existing issue based on the user's role and ownership.
 * Maintainers can update any issue.
 * Contributors can only update their own issues, and only if the status is "open".
 */
const updateIssue = async (issueId: string, currentUser: IUser, updateData: Partial<IIssue>) => {
    // 1. Fetch the existing issue to check permissions and existence
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [issueId]);
    const existingIssue = issueResult.rows[0];

    if (!existingIssue) {
        throw new Error("Issue not found");
    }

    // 2. Authorization check
    const isMaintainer = currentUser.role === "maintainer";
    const isContributorOwnerAndOpen = 
        currentUser.role === "contributor" && 
        String(existingIssue.reporter_id) === String(currentUser.id) && 
        existingIssue.status === "open";

    // If neither condition is met, the user cannot update this issue
    if (!isMaintainer && !isContributorOwnerAndOpen) {
        throw new Error("You do not have permission to update this issue");
    }

    if (!isMaintainer && existingIssue.status === "resolved") {
        throw new Error("Cannot edit a resolved issue (conflict)");
    }

    // 3. Dynamically build the SQL update query based on provided fields
    const { title, description, type, status } = updateData;
    const queryFields: string[] = [];
    const queryValues: unknown[] = [];

    // Only add fields to the query if they were provided in the request
    if (title !== undefined) {
        if (title.length === 0 || title.length > 150) {
            throw new Error("Validation Error: Title must be maximum 150 characters.");
        }
        queryValues.push(title);
        queryFields.push(`title = $${queryValues.length}`);
    }
    
    if (description !== undefined) {
        if (description.length < 20) {
            throw new Error("Validation Error: Description must be minimum 20 characters.");
        }
        queryValues.push(description);
        queryFields.push(`description = $${queryValues.length}`);
    }
    
    if (type !== undefined) {
        if (type !== "bug" && type !== "feature_request") {
            throw new Error("Validation Error: Type must be either 'bug' or 'feature_request'.");
        }
        queryValues.push(type);
        queryFields.push(`type = $${queryValues.length}`);
    }

    if (status !== undefined) {
        if (!isMaintainer) {
            throw new Error("Validation Error: Only maintainers can change issue workflow status.");
        }
        if (status !== "open" && status !== "in_progress" && status !== "resolved") {
            throw new Error("Validation Error: Status must be 'open', 'in_progress', or 'resolved'.");
        }
        queryValues.push(status);
        queryFields.push(`status = $${queryValues.length}`);
    }

    // If no fields were provided to update, return the existing issue
    if (queryFields.length === 0) {
        return existingIssue;
    }

    // Automatically update the 'updated_at' timestamp
    queryFields.push(`updated_at = NOW()`);
    
    // Add the issue ID as the final parameter for the WHERE clause
    queryValues.push(issueId); 

    const updateQuery = `
        UPDATE issues 
        SET ${queryFields.join(", ")}
        WHERE id = $${queryValues.length} 
        RETURNING *
    `;

    // 4. Execute the update and return the modified issue
    const result = await pool.query(updateQuery, queryValues);
    const updatedIssue = result.rows[0];

    return updatedIssue;
};

/**
 * Permanently deletes an issue by its ID.
 */
const deleteIssue = async (issueId: string) => {
    // We execute the delete query and return the deleted row to check if it existed
    const result = await pool.query(`DELETE FROM issues WHERE id = $1 RETURNING *`, [issueId]);
    const deletedIssue = result.rows[0];

    if (!deletedIssue) {
        throw new Error("Issue not found");
    }

    return deletedIssue;
};

export const IssueServices = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}