# Groups

Groups let you organize users into logical collections - by team, department, project, or any other criteria. Roles assigned to a group are inherited by all group members, simplifying permission management at scale.

---

## How Groups Work

```
Group: Engineering
  ├── Role: editor
  └── Members:
      ├── alice@acme.com  → inherits editor role
      ├── bob@acme.com    → inherits editor role
      └── carol@acme.com  → inherits editor role
```

When you assign a role to a group, every member of that group automatically receives the role's permissions. When a user is removed from the group, they lose those permissions (unless the role is also directly assigned).

---

## Managing Groups

### Create a Group

1. Go to `/t/{tenantSlug}/portal/access-management/groups`
2. Click **Create Group**
3. Enter group details:

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | `Engineering` |
| **Slug** | Machine-readable identifier | `engineering` |
| **Description** | Group purpose | `Engineering team members` |

### Add Members

1. Open the group
2. Click **Add Members**
3. Search and select users to add

### Assign Roles to a Group

1. Open the group
2. Click the **Roles** tab
3. Add roles that all group members should inherit

---

## API Examples

```bash
# Create a group
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/groups \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering",
    "slug": "engineering",
    "description": "Engineering team"
  }'

# Add a user to a group
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/groups/{groupId}/members \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid"}'

# Assign a role to a group
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/groups/{groupId}/roles \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"roleId": "role-uuid"}'
```

---

## Permission Resolution

A user's effective permissions come from:

1. **Directly assigned roles** - Roles assigned to the user
2. **Group-inherited roles** - Roles assigned to groups the user belongs to

```
User: alice@acme.com
  ├── Direct Role: auditor
  │   └── audit-logs:read, users:read
  └── Group: Engineering
      └── Role: editor
          └── users:read, users:write, applications:read

Effective: audit-logs:read, users:read, users:write, applications:read
```

---

## Use Cases

| Scenario | Groups Setup |
|----------|-------------|
| **Team-based access** | One group per team (Engineering, Marketing, Sales) |
| **Project-based access** | One group per project with project-specific roles |
| **Department hierarchy** | Groups for departments, sub-groups for teams |
| **Temporary access** | Add user to a group for temporary elevated access, remove later |
| **Onboarding** | Add new employee to their team's group - they inherit all needed roles |

---

## Related Guides

- [Roles & Permissions](roles-permissions.md) - Define roles and permissions
- [ABAC](abac.md) - Use group membership as an attribute in policies
- [Access Control Overview](overview.md) - Compare all authorization models
