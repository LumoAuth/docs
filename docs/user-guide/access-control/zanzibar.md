# Zanzibar (Fine-Grained Authorization)

LumoAuth implements Google's Zanzibar authorization model for fine-grained, relationship-based access control. Zanzibar scales to billions of access checks and models complex permission hierarchies that RBAC alone cannot express.

---

## What is Zanzibar?

Zanzibar is a relationship-based authorization system originally developed by Google. Instead of assigning roles to users globally, Zanzibar defines **relationships** between users and specific objects.

| Traditional RBAC | Zanzibar |
|-------------------|----------|
| "Alice is an **editor**" (globally) | "Alice is an **editor** of **Document X**" |
| "Bob is a **viewer**" (globally) | "Bob is a **member** of **Team A**, and Team A has **view** access on **Project Y**" |

This enables questions like:
- *"Can Alice edit this specific document?"*
- *"Can Bob view this project because his team has access?"*
- *"Who can access this file?"*

---

## Core Concepts

### Relation Tuples

A **relation tuple** is the fundamental unit of Zanzibar. It describes a relationship between a subject and an object:

```
object#relation@subject
```

| Component | Description | Example |
|-----------|-------------|---------|
| **Object** | The resource being accessed | `document:readme` |
| **Relation** | The type of relationship | `editor` |
| **Subject** | The user or group | `user:alice` |

Example tuples:

```
document:readme#editor@user:alice          # Alice is editor of readme
document:readme#viewer@group:engineering   # Engineering group can view readme
folder:docs#owner@user:bob                 # Bob owns the docs folder
team:backend#member@user:carol             # Carol is a member of backend team
```

### Namespace Definitions

A **namespace** defines the valid relations and permission rules for a type of object:

```yaml
namespace: document
  relations:
    owner:
      - user
    editor:
      - user
      - group#member
    viewer:
      - user
      - group#member
  permissions:
    can_edit:
      union:
        - owner
        - editor
    can_view:
      union:
        - can_edit
        - viewer
    can_delete:
      - owner
```

This defines:
- **owner**, **editor**, **viewer** are valid relations for documents
- **can_edit** = owner OR editor
- **can_view** = can_edit OR viewer (so editors can also view)
- **can_delete** = owner only

### Permission Inheritance

Zanzibar supports permission inheritance through graphs:

```
folder:docs#owner@user:bob
folder:docs#parent@folder:root
document:readme#parent@folder:docs

# If folder owners can view all documents in the folder:
# Bob can view document:readme through the folder relationship
```

---

## Managing Zanzibar

### Portal

Navigate to `/t/{tenantSlug}/portal/access-management/zanzibar`:

- **Namespaces** - Define object types and their relations
- **Relation Tuples** - Create and manage relationships
- **Check** - Test if a subject has a permission on an object
- **Expand** - See all subjects with a given permission on an object
- **List Objects** - Find all objects a subject can access

### Creating Relation Tuples

1. Go to `/t/{tenantSlug}/portal/access-management/zanzibar`
2. Click **Create Tuple**
3. Enter:
   - **Object** - The resource (e.g., `document:readme`)
   - **Relation** - The relationship (e.g., `editor`)
   - **Subject** - The user or group (e.g., `user:alice`)

### Via API

```bash
# Create a relation tuple
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/zanzibar/tuples \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "document:readme",
    "relation": "editor",
    "subject": "user:alice"
  }'

# Check permission
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/zanzibar/check \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "document:readme",
    "permission": "can_edit",
    "subject": "user:alice"
  }'
# Response: {"allowed": true}

# List objects a user can access
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/zanzibar/list-objects \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "user:alice",
    "permission": "can_view",
    "object_type": "document"
  }'
```

---

## Real-World Examples

### Google Drive-Style Sharing

```
# Bob owns a folder
folder:shared-docs#owner@user:bob

# Alice can edit files in the folder
folder:shared-docs#editor@user:alice

# The engineering group can view
folder:shared-docs#viewer@group:engineering

# A document is in the folder
document:design-doc#parent@folder:shared-docs
```

### Organization Hierarchy

```
# Carol is a member of the backend team
team:backend#member@user:carol

# Backend team belongs to the engineering organization
org:engineering#team@team:backend

# Engineering org has access to the production environment
environment:production#accessor@org:engineering#member

# Carol can access production through: team → org → environment
```

### Multi-Tenant SaaS

```
# Acme Corp's workspace
workspace:acme#admin@user:alice
workspace:acme#member@user:bob

# Project within the workspace
project:api-v2#parent@workspace:acme
project:api-v2#lead@user:bob

# Bob is project lead AND workspace member
# Alice is workspace admin, so she can access all projects
```

---

## Zanzibar vs. RBAC

| Aspect | RBAC | Zanzibar |
|--------|------|----------|
| Granularity | Role-level | Object-level |
| Scale | Hundreds of roles | Billions of relationships |
| Questions answered | "What can this user do?" | "Can this user do X to object Y?" |
| Maintenance | Manage roles and assignments | Manage relationship tuples |
| Best for | Application-wide permissions | Per-resource permissions |

---

## Best Practices

| Practice | Description |
|----------|-------------|
| **Design namespaces carefully** | Model your domain objects and their natural relationships |
| **Use permission inheritance** | Avoid duplicating tuples - use parent relationships |
| **Leverage groups** | Assign access to groups rather than individual users |
| **Test with the Permission Tester** | Validate your model before deploying |
| **Start simple** | Begin with basic relations and extend as needed |

---

## Related Guides

- [Roles & Permissions](roles-permissions.md) - Application-wide RBAC
- [ABAC](abac.md) - Attribute-based contextual policies
- [AI Policy Authoring](ai-policy-authoring.md) - Create Zanzibar namespaces with natural language
- [Access Control Overview](overview.md) - Compare all authorization models
