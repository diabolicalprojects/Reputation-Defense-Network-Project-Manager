# 01-product-overview.md
## System: RDN Project Manager

### Objective
Create an internal web production management platform for Reputation Defense Network. The system streamlines the workflow from Design to Development, centralizing client data, project assets (Figma, Drive), WordPress credentials, and standard operating procedures (SOPs).

### Tech Stack
- Frontend: React + TypeScript (Vite), Tailwind CSS, TanStack Query.
- Backend: Node.js, Express.js.
- Database: MongoDB (Mongoose).
- Deployment: Dokploy.

### User Roles
1. **Project Manager (Admin):** Full CRUD access. Manages users, clients, and projects. Moves projects through the pipeline and assigns tasks.
2. **Web Designer:** Views assigned projects in the "Design" phase. Can access Drive links and submit Figma URLs to send the project to review.
3. **Web Developer:** Views assigned projects in the "Development" phase. Accesses WordPress `wp-admin` credentials, Figma links, and SOPs. Submits finished sites for review.

### Key Features
- **Client-Centric Views:** Clicking a client reveals all their projects and allows auto-assigned project creation.
- **Kanban Pipeline:** PM dashboard uses a drag-and-drop Kanban view for project phases.
- **WordPress SOPs:** Templates for development checklists.