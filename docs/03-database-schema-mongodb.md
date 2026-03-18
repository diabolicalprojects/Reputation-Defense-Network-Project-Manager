# 03-database-schema-mongodb.md
## Mongoose Schemas (TypeScript Interfaces)

### User Schema
- `name` (String)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (Enum: 'PM', 'DESIGNER', 'DEVELOPER', 'BOTH')
- `isActive` (Boolean)

### Client Schema
- `companyName` (String)
- `contactName` (String)
- `email` (String)
- `phone` (String)
- `notes` (String)
- `projects` (Array of Project ObjectIds)

### Project Schema
- `title` (String)
- `client` (ObjectId -> Client)
- `status` (Enum: 'NEW', 'DESIGN', 'DESIGN_REVIEW', 'DEVELOPMENT', 'INTERNAL_REVIEW', 'COMPLETED')
- `designerId` (ObjectId -> User, nullable)
- `developerId` (ObjectId -> User, nullable)
- `assets`: 
  - `driveLink` (String)
  - `figmaLink` (String)
- `developmentData`:
  - `domainUrl` (String)
  - `wpAdminUser` (String)
  - `wpAdminPassword` (String, encrypted/hidden UI)
- `sop` (Array of Strings/Tasks)