# Zanzibar Relationship Checks

Check authorization using Google Zanzibar-style relationship-based access control. 
    Perfect for hierarchical resources, sharing models, and complex permission inheritance.

    
        **POST** 
        `/api/v1/zanzibar/check`
    

## How Zanzibar Checks Work

Unlike simple permission checks that ask "does this user have permission X?", Zanzibar checks ask:

:::note
:::


LumoAuth traverses the relationship graph to answer this question, following inheritance rules 
    and computed relationships.

## Request Format

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `object` | string | Yes | Resource being accessed (`namespace:id`) |
| `relation` | string | Yes | Type of access (e.g., `viewer`, `editor`, `owner`) |
| `user` | string | Yes | Subject requesting access (`namespace:id` or `namespace:id#relation`) |

### Basic Example

```bash
curl -X POST https://api.example.com/api/v1/zanzibar/check \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "document:annual-report",
    "relation": "editor",
    "user": "user:alice"
  }'
```

```json
{
  "allowed": true,
  "object": "document:annual-report",
  "relation": "editor",
  "user": "user:alice"
}
```

## Understanding the Format

### Objects

Objects are resources in your system. Format: `namespace:id`

| Example | Meaning |
| --- | --- |
| `document:readme` | A document with ID "readme" |
| `folder:projects` | A folder named "projects" |
| `organization:acme` | Organization "acme" |
| `repository:myapp` | A repository named "myapp" |

### Relations

Relations define the type of access or connection. Common relations include:

| Relation | Typical Use | Usually Implies |
| --- | --- | --- |
| `owner` | Full control over a resource | editor, viewer |
| `editor` | Can modify a resource | viewer |
| `viewer` | Read-only access | - |
| `member` | Belongs to a group/org | viewer (of group resources) |
| `admin` | Administrative access | owner, member |
| `parent` | Hierarchical containment | Permission inheritance |

### Subjects (Users)

Subjects are entities requesting access. They can be:

| Format | Example | Meaning |
| --- | --- | --- |
| `namespace:id` | `user:alice` | A specific user |
| `namespace:id#relation` | `team:engineering#member` | All members of the engineering team |
| `namespace:id#relation` | `organization:acme#admin` | All admins of the Acme org |

## Advanced: Userset Subjects

The power of Zanzibar comes from **usersets** – checking access through group membership.

### Example: Team-Based Access

Suppose you have these relationships stored:

```bash
curl -X POST https://api.example.com/api/v1/zanzibar/check \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "document:api-docs",
    "relation": "viewer",
    "user": "user:bob"
  }'
```

LumoAuth will return `allowed: true` because:

1. Bob is a member of `team:engineering`
2. `team:engineering#member` is a viewer of `document:api-docs`
3. Therefore, Bob is a viewer of `document:api-docs`

## Real-World Examples

### Example 1: Document Sharing (Google Docs Style)

```bash
# Can Carol view the Q4 report?
curl -X POST https://api.example.com/api/v1/zanzibar/check \
  -d '{"object": "document:q4-report", "relation": "viewer", "user": "user:carol"}'
# Result: allowed: true (Carol is on finance team, which has viewer access)

# Can Carol edit the Q4 report?
curl -X POST https://api.example.com/api/v1/zanzibar/check \
  -d '{"object": "document:q4-report", "relation": "editor", "user": "user:carol"}'
# Result: allowed: false (Carol only has view access via team membership)
```

### Example 2: Folder Hierarchy

```bash
# Can Alice view the readme?
curl -X POST https://api.example.com/api/v1/zanzibar/check \
  -d '{"object": "document:readme", "relation": "viewer", "user": "user:alice"}'
# Result: allowed: true (Alice owns the parent folder)
```

### Example 3: GitHub-Style Repository Access

    
        relationships
    
    
```
# Org structure
organization:acme#admin@user:ceo
organization:acme#member@user:developer

# Team in org
team:platform#parent@organization:acme
team:platform#member@user:developer

# Repo owned by team
repository:api-service#owner@team:platform#member

# Schema: org admins are admins of all repos
# Schema: team members who own a repo are maintainers
```

## Comparison: Zanzibar vs RBAC

| Aspect | RBAC Check | Zanzibar Check |
| --- | --- | --- |
| Question | Does user have permission? | Does user have relation to object? |
| Example | `document.edit` | `document:123#editor@user:456` |
| Resource Aware | No (global permission) | Yes (specific resource) |
| Inheritance | Role hierarchy only | Object + relation hierarchy |
| Best For | Admin features, global actions | Shared resources, hierarchies |
