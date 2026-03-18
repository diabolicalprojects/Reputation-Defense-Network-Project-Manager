# 04-backend-architecture.md
## Express & Node.js Structure

**Directory Structure:**
/src
  /controllers
    authController.ts
    projectController.ts
    clientController.ts
    userController.ts
  /models
    User.ts
    Client.ts
    Project.ts
  /routes
    authRoutes.ts
    projectRoutes.ts
    clientRoutes.ts
    userRoutes.ts
  /middlewares
    authMiddleware.ts (JWT verification)
    roleMiddleware.ts (RBAC check)
  /utils
    dbConnect.ts

**Key Endpoints:**
- `GET /api/clients/:id/projects` - Fetch all projects for a specific client.
- `PATCH /api/projects/:id/status` - Update project pipeline stage.
- `POST /api/clients/:id/projects` - Create project auto-assigned to client.