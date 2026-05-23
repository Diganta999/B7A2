# DevPulse – Internal Tech Issue & Feature Tracker

**DevPulse** is a collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## 🔗 Live URL
**Live API Link:** [Insert Your Live URL Here]  
*(Replace the link above with your actual deployed Vercel/Render URL before submission)*

## ✨ Features
- **User Authentication:** Secure JWT-based registration and login system.
- **Role-Based Access Control (RBAC):** Distinct permissions for `contributor` and `maintainer`.
- **Issue Management:** Full CRUD operations for tracking bugs and feature requests.
- **Advanced Filtering & Sorting:** Fetch issues matching specific types, statuses, and sort order.
- **Admin Dashboard Data (Metrics):** Dedicated system reporting endpoint for maintainers.
- **Robust Security:** Passwords hashed with `bcrypt`, endpoints protected by JWT validation.
- **Strict Data Handling:** Built completely without ORMs or SQL JOINs, utilizing custom `Map` data structures in JavaScript to connect relations.

## 🛠️ Technology Stack
- **Runtime:** Node.js (LTS)
- **Language:** TypeScript 
- **Framework:** Express.js (Modular router architecture)
- **Database:** PostgreSQL (Native `pg` driver, Raw SQL only)
- **Security:** `bcrypt`, `jsonwebtoken`
- **Typing:** Strict Type Checking (No `any` types)

## 🚀 Setup Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd b7a2-assignment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root folder and configure the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgres://username:password@localhost:5432/devpulse
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Run the application:**
   ```bash
   # To compile TypeScript and run the built app:
   npm run build
   npm start
   
   # OR to run in development mode (if ts-node-dev/nodemon is configured):
   npm run dev
   ```

## 📡 API Endpoint List

### **Authentication**
- `POST /api/auth/signup` - Register a new user (`contributor` or `maintainer`).
- `POST /api/auth/login` - Authenticate and receive a JWT.

### **Issues**
- `POST /api/issues` - Create a new issue (Auth required).
- `GET /api/issues` - Get all issues (Supports query params: `sort`, `type`, `status`).
- `GET /api/issues/:id` - Get full details of a specific issue.
- `PATCH /api/issues/:id` - Update an issue (Auth required; specific rules based on role/status).
- `DELETE /api/issues/:id` - Delete an issue (`maintainer` only).

### **System Metrics**
- `GET /api/metrics` - Access internal system metrics (`maintainer` only).

## 🗄️ Database Schema Summary

### **Table: `users`**
| Field | Data Type | Requirement |
| :--- | :--- | :--- |
| `id` | `SERIAL` | Auto-incrementing, Primary Key |
| `name` | `VARCHAR` | Full display name |
| `email` | `VARCHAR` | Valid login address, Unique |
| `password` | `VARCHAR` | Encrypted string (bcrypt) |
| `role` | `VARCHAR` | `contributor` or `maintainer` (Default: `contributor`) |
| `created_at` | `TIMESTAMP` | Auto-generated insertion time |
| `updated_at` | `TIMESTAMP` | Auto-refreshed update time |

### **Table: `issues`**
| Field | Data Type | Requirement |
| :--- | :--- | :--- |
| `id` | `SERIAL` | Auto-incrementing, Primary Key |
| `title` | `VARCHAR(150)` | Short description |
| `description` | `TEXT` | Detailed explanation (Min 20 chars) |
| `type` | `VARCHAR` | `bug` or `feature_request` |
| `status` | `VARCHAR` | `open`, `in_progress`, `resolved` (Default: `open`) |
| `reporter_id` | `INTEGER` | ID of the issue creator (References `users(id)`) |
| `created_at` | `TIMESTAMP` | Auto-generated insertion time |
| `updated_at` | `TIMESTAMP` | Auto-refreshed update time |
