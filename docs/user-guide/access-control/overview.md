# Access Control

LumoAuth provides multiple authorization models that can be used independently or combined to meet any access control requirement - from simple role checks to complex, context-aware policies.

---

## Authorization Models

| Model | Best For | Complexity |
|-------|----------|------------|
| **[RBAC](roles-permissions.md)** | Simple role-based access | Low |
| **[Groups](groups.md)** | Organizing users by team/department | Low |
| **[ABAC](abac.md)** | Context-aware, attribute-based decisions | Medium |
| **[Zanzibar](zanzibar.md)** | Fine-grained relationship-based access (Google Zanzibar) | High |
| **[AI Policy Authoring](ai-policy-authoring.md)** | Natural language policy creation | Low (input), High (output) |

---

## How They Work Together

```
User Request
    │
    ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   RBAC      │    │    ABAC      │    │   Zanzibar   │
│  Role check │    │  Attribute   │    │ Relationship  │
│             │    │  evaluation  │    │   check      │
└──────┬──────┘    └──────┬───────┘    └──────┬───────┘
       │                  │                    │
       ▼                  ▼                    ▼
   ┌──────────────────────────────────────────────┐
   │            Combined Access Decision           │
   │     (configurable: AND / OR / first-match)    │
   └──────────────────────────────────────────────┘
```

You can use one model or layer them. For example:
- **RBAC only** - Assign users to roles like `admin`, `editor`, `viewer`
- **RBAC + Groups** - Assign roles to groups, users inherit permissions via group membership
- **RBAC + ABAC** - Base access on roles, with attribute conditions (e.g., "editors can only edit during business hours")
- **Zanzibar** - Model complex relationships (e.g., "user can edit document if they own it or if it's shared with their team")

---

## Quick Comparison

| Feature | RBAC | Groups | ABAC | Zanzibar |
|---------|------|--------|------|----------|
| Role-based decisions | ✅ | ✅ (via groups) | ❌ | ❌ |
| Attribute conditions | ❌ | ❌ | ✅ | ❌ |
| Relationship-based | ❌ | ❌ | ❌ | ✅ |
| Hierarchical | ❌ | ✅ | ❌ | ✅ |
| Context-aware | ❌ | ❌ | ✅ | ❌ |
| Scalable to millions of objects | ❌ | ❌ | ❌ | ✅ |

---

## Permission Testing

LumoAuth includes a **Permission Tester** that lets you evaluate access decisions in real-time without affecting production:

**URL:** `/t/{tenantSlug}/portal/access-management/permission-tester`

The permission tester lets you:
- Select a user and a resource
- Choose an action (read, write, delete, etc.)
- See which policies match and what the decision would be
- Debug why access was granted or denied

---

## Portal Locations

All access control features are managed under:

```
/t/{tenantSlug}/portal/access-management/
├── users              # User management with role assignments
├── roles              # RBAC role definitions
├── groups             # Group management
├── permissions        # Permission definitions
├── zanzibar           # Zanzibar relationship tuples
├── abac               # ABAC policy rules
├── policy-author      # AI-assisted policy creation
└── permission-tester  # Test access decisions
```

---

## In This Section

| Guide | Description |
|-------|-------------|
| [Roles & Permissions](roles-permissions.md) | Define roles, assign permissions, manage RBAC |
| [Groups](groups.md) | Organize users and assign roles to groups |
| [ABAC](abac.md) | Attribute-based access control policies |
| [Zanzibar](zanzibar.md) | Fine-grained relationship-based access control |
| [AI Policy Authoring](ai-policy-authoring.md) | Create access policies using natural language |
