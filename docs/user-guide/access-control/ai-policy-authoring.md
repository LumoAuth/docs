# AI Policy Authoring

LumoAuth's AI Policy Author lets you create access control policies using natural language. Describe what you want in plain English, and the AI generates the corresponding RBAC roles, ABAC policies, or Zanzibar namespace definitions.

---

## How It Works

1. **Describe your policy** in natural language
2. **AI generates** the corresponding policy configuration
3. **Review** the generated policy
4. **Apply** the policy to your tenant

**URL:** `/t/{tenantSlug}/portal/access-management/policy-author`

---

## Examples

### RBAC Policy Generation

**Input:**
> "Create roles for a project management app. Project managers should be able to create, edit, and delete projects and assign team members. Team members can view projects and update tasks. Viewers can only see project details."

**Generated Output:**

```yaml
roles:
  - name: Project Manager
    slug: project-manager
    permissions:
      - projects:create
      - projects:edit
      - projects:delete
      - projects:assign-members
      - tasks:read
      - tasks:write

  - name: Team Member
    slug: team-member
    permissions:
      - projects:read
      - tasks:read
      - tasks:write

  - name: Viewer
    slug: viewer
    permissions:
      - projects:read
      - tasks:read
```

### ABAC Policy Generation

**Input:**
> "Only allow users with MFA enabled to access financial reports. Restrict access to business hours on weekdays. Block access from countries outside the US and EU."

**Generated Output:**

```yaml
policies:
  - name: Financial Reports - MFA Required
    subject: user.mfa_enabled = false
    resource: type = "financial-report"
    decision: DENY

  - name: Financial Reports - Business Hours
    resource: type = "financial-report"
    environment:
      - env.time < 09:00 OR env.time > 18:00
      - env.day_of_week in ["saturday", "sunday"]
    decision: DENY

  - name: Financial Reports - Geo Restriction
    resource: type = "financial-report"
    environment: env.country not in ["US", "DE", "FR", "GB", "NL", "IE", ...]
    decision: DENY
```

### Zanzibar Namespace Generation

**Input:**
> "Design a document sharing system. Documents belong to folders. Folders belong to workspaces. Workspace admins can do everything. Folder editors can edit documents in their folder. Document viewers can only read."

**Generated Output:**

```yaml
namespaces:
  workspace:
    relations:
      admin: [user]
      member: [user]
    permissions:
      can_manage: [admin]
      can_view: [admin, member]

  folder:
    relations:
      parent: [workspace]
      editor: [user, workspace#admin]
      viewer: [user, workspace#member]
    permissions:
      can_edit: [editor, parent.can_manage]
      can_view: [can_edit, viewer, parent.can_view]

  document:
    relations:
      parent: [folder]
      editor: [user, parent.editor]
      viewer: [user, parent.viewer]
    permissions:
      can_edit: [editor, parent.can_edit]
      can_view: [can_edit, viewer, parent.can_view]
      can_delete: [parent.can_manage]
```

---

## Using the Policy Author

### Step 1: Write Your Description

Be specific about:
- **Who** should have access (roles, groups, user attributes)
- **What** they should access (resources, actions)
- **When/Where** access is allowed (conditions, constraints)

### Step 2: Review Generated Policy

The AI generates a policy with:
- Clear structure matching your authorization model (RBAC, ABAC, or Zanzibar)
- Proper naming conventions
- Complete permission definitions

### Step 3: Edit if Needed

You can modify the generated policy before applying it. Adjust names, add conditions, or remove unnecessary rules.

### Step 4: Apply

Click **Apply Policy** to create the roles, permissions, ABAC rules, or Zanzibar tuples in your tenant.

---

## Tips for Better Results

| Tip | Example |
|-----|---------|
| **Be specific about actions** | "can create, edit, and delete" instead of "can manage" |
| **Name your roles** | "Project Managers should..." instead of "some users should..." |
| **Include edge cases** | "External contractors can view but not download" |
| **Specify conditions** | "only during business hours" or "only from corporate IPs" |
| **Reference existing resources** | "for the documents and folders in our file system" |

---

## Related Guides

- [Roles & Permissions](roles-permissions.md) - Understanding RBAC
- [ABAC](abac.md) - Attribute-based policies
- [Zanzibar](zanzibar.md) - Relationship-based access
- [Access Control Overview](overview.md) - Compare all models
