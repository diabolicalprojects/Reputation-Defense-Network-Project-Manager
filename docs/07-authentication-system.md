# 07-authentication-system.md
## JWT & Role-Based Access Control

**Backend:**
- Login endpoint generates a JWT containing `{ userId, role }`.
- `authMiddleware` verifies the token in headers (`Authorization: Bearer <token>`).
- `roleMiddleware(['PM'])` protects sensitive routes (e.g., user creation, client deletion).

**Frontend:**
- Auth context stores the token and current user data.
- React Router uses Protected Routes based on roles.
- If `user.role === 'DESIGNER'`, redirect from `/pm-dashboard` to `/designer-dashboard`.