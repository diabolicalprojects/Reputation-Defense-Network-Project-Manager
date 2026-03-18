# 08-sop-system.md
## Developer SOP Management

**Concept:** Instead of typing the Standard Operating Procedure for every WordPress build, the PM has templates.

**Data Structure (Project Schema Extension):**
```json
"sop": [
  { "task": "Install base plugins (Elementor, WP Rocket)", "isCompleted": false },
  { "task": "Setup Cloudflare CDN", "isCompleted": false },
  { "task": "Configure RankMath SEO", "isCompleted": false },
  { "task": "Mobile QA Testing", "isCompleted": false }
]