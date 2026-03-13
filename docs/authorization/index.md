# Authorization API

LumoAuth provides powerful authorization capabilities that go beyond simple role checks. 
    This guide explains the different authorization models and helps you choose the right approach.

:::note[Base URL]
All API endpoints are relative to your tenant's base URL:
`https://app.lumoauth.dev/t/{tenantSlug}/api/v1/`
:::


## Authentication vs Authorization

Before diving in, let's clarify these often-confused terms:

    
    
        
            
            Authorization (AuthZ)
        
        
            **"What can you do?"**

            Determining permissions for actions on resources. 
            Results in: "User #123 can edit Document #456."
        
    

LumoAuth's [OAuth API](/oauth) handles authentication. 
    This Authorization API handles the "what can they do?" question.

## Authorization Models

LumoAuth supports three complementary authorization models. You can use them individually 
    or combine them:

### 1. RBAC (Role-Based Access Control)

The traditional model where users are assigned roles, and roles have permissions.

    
        example
    
    
```
User "john" → Role "Editor" → Permissions ["document.edit", "document.view"]

Question: Can John edit documents?
Answer: Yes, because John has the Editor role, which includes document.edit
```

**Best for:** Simple permission structures, enterprise applications with clear role hierarchies.

### 2. ABAC (Attribute-Based Access Control)

Decisions based on attributes of the user, resource, and environment.

    
        example
    
    
```
Rule: Users can edit documents they own

Context:
  - user.id: 123
  - document.owner_id: 123
  - user.department: "engineering"

Question: Can user 123 edit this document?
Answer: Yes, because user.id == document.owner_id
```

**Best for:** Complex policies involving resource ownership, time-based access, location restrictions.

### 3. ReBAC / Zanzibar (Relationship-Based Access Control)

Access based on relationships between objects – the model used by Google Drive, GitHub, and more.

    
        example
    
    
```
Relationships:
  - document:readme#owner@user:alice
  - folder:projects#viewer@team:engineering#member
  - document:readme#parent@folder:projects

Question: Can Bob (engineering team member) view the readme?
Answer: Yes, because:
  1. Bob is a member of team:engineering
  2. team:engineering viewers can view folder:projects
  3. document:readme is in folder:projects
  4. Therefore, Bob can view document:readme
```

**Best for:** Hierarchical resources, shared folders, organization structures, any "sharing" model.

## Understanding Zanzibar

Zanzibar is Google's global authorization system, and LumoAuth implements its core concepts. 
    If you're new to Zanzibar, don't worry – it's simpler than it sounds.

### The Core Idea

Zanzibar stores **relationships** between things. A relationship is a simple statement:

:::tip
:::


### Anatomy of a Relationship

| Part | Example | Meaning |
| --- | --- | --- |
| `object` | `document:readme` | The resource being protected (type:id) |
| `relation` | `editor` | The type of access or relationship |
| `subject` | `user:alice` | Who has this relationship (type:id) |

### Real-World Example: Google Drive

Let's model Google Drive sharing with Zanzibar relationships:

    
        relationships
    
    
```
# Alice owns a folder
folder:shared#owner@user:alice

# Bob can view the folder (Alice shared it)
folder:shared#viewer@user:bob

# A document is inside the folder
document:report#parent@folder:shared

# Relation rules (schema):
# - Viewers of a folder can view documents in that folder
# - Editors of a folder can edit documents in that folder
# - The owner is also an editor
```

**Question:** Can Bob view the report?

**Answer:** Yes! LumoAuth traces the relationships:

1. Bob is a `viewer` of `folder:shared`
2. `document:report` has `parent` = `folder:shared`
3. By the schema rules, folder viewers can view contained documents
4. Therefore, Bob can view the report ✓

### Why Zanzibar?

| Benefit | Description |
| --- | --- |
| **Inheritance** | Permissions automatically flow through hierarchies (folders → files) |
| **Scalability** | Handles billions of relationships (used by Google globally) |
| **Flexibility** | Model any access pattern: sharing, teams, organizations, workflows |
| **Auditability** | Clear answer to "why can this user access this?" |

## Available Endpoints

    
        **POST** 
        `/api/v1/authz/check`
    
    
Check a single permission for the authenticated user.
        [View details →](/authorization/check)

    
        **POST** 
        `/api/v1/authz/check-bulk`
    
    
Check multiple permissions at once. Returns individual results.
        [View details →](/authorization/check)

    
        **POST** 
        `/api/v1/authz/check-any`
    
    
Check if user has at least one of the permissions (OR logic).
        [View details →](/authorization/check)

    
        **POST** 
        `/api/v1/authz/check-all`
    
    
Check if user has all of the permissions (AND logic).
        [View details →](/authorization/check)

    
        **POST** 
        `/api/v1/zanzibar/check`
    
    
Zanzibar-style relationship check: "Is user X a viewer of document Y?"
        [View details →](/authorization/zanzibar)

    
        **GET** 
        `/api/v1/authz/permissions`
    
    
List all permissions granted to the authenticated user.
        [View details →](/authorization/permissions)

## Choosing the Right Model

| Use Case | Recommended Model |
| --- | --- |
| "Can this admin manage users?" | **RBAC** – Check if user has admin role |
| "Can this user edit their own profile?" | **ABAC** – Check user.id == profile.owner_id |
| "Can this user view this shared folder?" | **Zanzibar** – Check viewer relationship |
| "Can users in the Sales team access leads?" | **Zanzibar** – Team membership → resource access |
| "Can this user access during business hours?" | **ABAC** – Include time context in check |
