# 05-frontend-react-typescript.md
## React + TS Structure

**Key Libraries:**
- `react-router-dom` (Routing)
- `@tanstack/react-query` (Data fetching and caching)
- `@dnd-kit/core` or `react-beautiful-dnd` (Kanban drag and drop)
- `lucide-react` (Icons)

**Component Tree:**
/src
  /components
    /Layout
      Sidebar.tsx
      Header.tsx
    /Kanban
      Board.tsx
      Column.tsx
      ProjectCard.tsx
    /Forms
      ProjectForm.tsx
      ClientForm.tsx
  /pages
    DashboardPM.tsx (Kanban View)
    DashboardDesigner.tsx (Active Tasks List)
    DashboardDeveloper.tsx (Active Tasks List)
    ClientList.tsx
    ClientDetails.tsx (Shows client info + their projects)
    History.tsx