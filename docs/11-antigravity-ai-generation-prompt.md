# 11-antigravity-ai-generation-prompt.md
## Master System Generation Prompt for Antigravity

**Role:** You are an expert Full-Stack Developer specializing in the MERN stack and TypeScript, with a strong background in optimizing WordPress development workflows.

**Task:** Build the complete internal Project Management system for a web agency called Reputation Defense Network. 

**Instructions:**
1. Read `01-product-overview.md` and `02-project-workflow.md` to fully grasp the business logic, user roles, and the linear production pipeline.
2. Initialize a Node.js/Express backend in a `/server` folder. Implement the database using `03-database-schema-mongodb.md` for Mongoose models and structure the API according to `04-backend-architecture.md`.
3. Implement JWT authentication and Role-Based Access Control (RBAC) strictly following the guidelines in `07-authentication-system.md`. Ensure routes are protected based on PM, DESIGNER, and DEVELOPER roles.
4. Initialize a React + Vite + TypeScript frontend in a `/client` folder following the component tree in `05-frontend-react-typescript.md`.
5. Build the Project Manager Kanban Dashboard. You must implement the drag-and-drop functionality using the logic from `06-kanban-board-logic.md` and strictly enforce the status validation rules defined in `09-project-state-machine.md` (e.g., a project cannot move to Development without a Figma link).
6. Create the Client view. Clicking a client must show their details, active/completed projects, and include a feature to auto-assign a new project directly to that client.
7. Build the Designer and Developer dashboards. Show a "No active projects" state if their queue is empty. For the Developer view, implement the interactive task checklist as defined in `08-sop-system.md`.
8. Ensure all sensitive fields, specifically WordPress `wp-admin` credentials, feature a UI toggle to show/hide the password for security.
9. Configure environment variables, build scripts, and connection strings to ensure the app is completely ready for Dokploy as outlined in `10-dokploy-deployment.md`.
10. Use Tailwind CSS to design a clean, modern, dark-mode friendly SaaS interface. Write modular, highly maintainable, and strongly-typed code throughout the entire stack. 