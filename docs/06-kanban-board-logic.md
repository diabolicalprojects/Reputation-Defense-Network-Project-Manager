# 06-kanban-board-logic.md
## React Drag and Drop Implementation

**Logic Flow:**
1. PM fetches all projects.
2. Projects are grouped by `status` into columns: Draft, Design, Design Review, Development, Internal Review, Completed.
3. When a PM drags a card from 'Design' to 'Development', the frontend fires a `PATCH /api/projects/:id/status` with `{ status: 'DEVELOPMENT' }`.
4. **Validation:** The frontend should prevent dropping a card into 'Development' if the project does not have a `figmaLink` or a `developerId` assigned.
5. TanStack Query `useMutation` invalidates the `['projects']` query to refresh the board automatically.