# 09-project-state-machine.md
## Status Transition Rules

To maintain data integrity, transitions require specific data:

- `NEW` -> `DESIGN`: Requires `designerId` to be populated.
- `DESIGN` -> `DESIGN_REVIEW`: Requires `figmaLink` to be populated by the Designer.
- `DESIGN_REVIEW` -> `DEVELOPMENT`: Requires PM to populate `wpAdminUser`, `wpAdminPassword`, `domainUrl`, and `developerId`.
- `DEVELOPMENT` -> `INTERNAL_REVIEW`: Requires all items in the `sop` checklist to be `isCompleted: true`.
- `INTERNAL_REVIEW` -> `COMPLETED`: PM final approval.