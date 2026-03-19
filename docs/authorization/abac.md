# Attribute-Based Access Control (ABAC)

ABAC enables fine-grained, context-aware authorization by evaluating **attributes** of users, 
    resources, and the environment. Define policies like "Engineering team members can access internal APIs 
    during business hours" without writing code.

:::note[When to Use ABAC]
Use ABAC when access decisions depend on dynamic attributes like time of day,
IP address, user department, or resource classification - not just static roles.
:::


## Quick Start

Get started with ABAC in three steps:

### Step 1: Define Attributes

First, define the attributes you want to use in policies. Attributes describe users, resources, or the environment.

    
        bash
        Create a "department" attribute
    
    
```
curl -X POST "https://api.example.com/t/{tenantSlug}/api/v1/abac/attributes" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Department",
    "attributeType": "user",
    "dataType": "string",
    "description": "The department the user belongs to",
    "validationRules": {
      "enum": ["engineering", "sales", "marketing", "finance", "hr"]
    }
  }'
```

### Step 2: Create a Policy

Create a policy that uses attributes to control access:

    
        bash
        Allow engineering team to access APIs
    
    
```
curl -X POST "https://api.example.com/t/{tenantSlug}/api/v1/abac/policies" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering API Access",
    "resourceType": "api",
    "action": "read",
    "effect": "allow",
    "priority": 100,
    "conditions": {
      "operator": "AND",
      "conditions": [
        {
          "subject": "user.department",
          "operator": "equals",
          "value": "engineering"
        }
      ]
    }
  }'
```

### Step 3: Check Access

Use the ABAC check endpoint to evaluate policies:

    
        bash
        Check if user can access an API
    
    
```
curl -X POST "https://api.example.com/api/v1/abac/check" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "api",
    "resourceId": "internal-api-v1",
    "action": "read"
  }'
```

    
        json
        Response
    
    
```
{
  "allowed": true,
  "reason": "Policy matched: Engineering API Access",
  "matchedPolicies": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering API Access",
      "effect": "allow",
      "priority": 100
    }
  ],
  "evaluationContext": {
    "user": {
      "id": "user-123",
      "email": "developer@company.com",
      "department": "engineering",
      "roles": ["developer"]
    },
    "resource": {
      "id": "internal-api-v1",
      "type": "api"
    },
    "environment": {
      "hour": 14,
      "dayOfWeek": 3,
      "isWeekend": false
    }
  }
}
```

## Core Concepts

### Attributes

Attributes are the building blocks of ABAC policies. LumoAuth supports three types:

| Type | Description | Examples |
| --- | --- | --- |
| `user` | Attributes describing the user making the request | `department`, `clearance_level`, `location` |
| `resource` | Attributes describing the target resource | `classification`, `owner_department`, `sensitivity` |
| `environment` | Contextual attributes from the request | `hour`, `dayOfWeek`, `ip` |

#### Built-in User Attributes

These attributes are always available without defining them:

    
        attributes
    
    
```
user.id              # User's unique identifier
user.email           # User's email address
user.roles           # Array of role slugs ["admin", "developer"]
user.groups          # Array of group slugs
user.permissions     # Array of permission slugs
user.emailVerified   # Boolean - is email verified?
user.mfaEnabled      # Boolean - is MFA enabled?
user.{trait}         # Any custom user trait
```

#### Built-in Environment Attributes

    
        attributes
    
    
```
environment.hour        # Current hour (0-23)
environment.dayOfWeek   # Day of week (1=Monday, 7=Sunday)
environment.isWeekend   # Boolean for Saturday/Sunday
environment.ip          # Client IP address
```

### Policies

Policies define access rules using conditions that evaluate attributes. Each policy has:

| Field | Description | Example |
| --- | --- | --- |
| `name` | Human-readable name | `"Engineering API Access"` |
| `resourceType` | Type of resource (use `*` for all) | `"document"`, `"api"`, `"*"` |
| `action` | Action being performed (use `*` for all) | `"read"`, `"write"`, `"*"` |
| `effect` | Allow or deny access | `"allow"` or `"deny"` |
| `priority` | Higher priority evaluated first (0-1000) | `100` |
| `conditions` | Logical conditions to evaluate | See below |

### Condition Operators

Use these operators to compare attribute values:

| Operator | Description | Example |
| --- | --- | --- |
| `equals` | Exact match | `user.department equals "engineering"` |
| `not_equals` | Not equal | `resource.status not_equals "archived"` |
| `in` | Value in array | `user.role in ["admin", "manager"]` |
| `not_in` | Value not in array | `user.country not_in ["restricted"]` |
| `contains` | Array contains value | `user.roles contains "admin"` |
| `not_contains` | Array doesn't contain | `user.roles not_contains "guest"` |
| `gt` / `lt` | Greater/less than | `user.level gt 2` |
| `gte` / `lte` | Greater/less or equal | `environment.hour gte 9` |
| `matches` | Regex match | `user.email matches "@company\\.com$"` |
| `exists` | Attribute exists | `user.department exists` |
| `not_exists` | Attribute doesn't exist | `resource.restricted not_exists` |

### Combining Conditions

Use `AND` or `OR` operators to combine multiple conditions:

    
        json
        AND - All conditions must match
    
    
```
{
  "operator": "AND",
  "conditions": [
    {"subject": "user.department", "operator": "equals", "value": "engineering"},
    {"subject": "user.level", "operator": "gte", "value": 2}
  ]
}
```

    
        json
        OR - Any condition must match
    
    
```
{
  "operator": "OR",
  "conditions": [
    {"subject": "user.roles", "operator": "contains", "value": "admin"},
    {"subject": "user.roles", "operator": "contains", "value": "super-admin"}
  ]
}
```

    
        json
        Nested - Complex logic
    
    
```
{
  "operator": "OR",
  "conditions": [
    {"subject": "user.roles", "operator": "contains", "value": "admin"},
    {
      "operator": "AND",
      "conditions": [
        {"subject": "user.department", "operator": "equals", "value": "engineering"},
        {"subject": "user.level", "operator": "gte", "value": 3}
      ]
    }
  ]
}
```

## Policy Examples

### Department-Based Access

Allow users from the engineering department to access internal APIs:

    
        json
    
    
```
{
  "name": "Engineering API Access",
  "resourceType": "api",
  "action": "read",
  "effect": "allow",
  "priority": 100,
  "conditions": {
    "operator": "AND",
    "conditions": [
      {
        "subject": "user.department",
        "operator": "equals",
        "value": "engineering"
      },
      {
        "subject": "resource.classification",
        "operator": "in",
        "value": ["internal", "public"]
      }
    ]
  }
}
```

### Clearance-Based Access

Users with security clearance level 3+ can access classified documents:

    
        json
    
    
```
{
  "name": "Classified Document Access",
  "resourceType": "document",
  "action": "read",
  "effect": "allow",
  "priority": 100,
  "conditions": {
    "operator": "AND",
    "conditions": [
      {
        "subject": "user.clearance_level",
        "operator": "gte",
        "value": 3
      },
      {
        "subject": "resource.classification",
        "operator": "equals",
        "value": "classified"
      },
      {
        "subject": "user.background_check",
        "operator": "equals",
        "value": true
      }
    ]
  }
}
```

### Business Hours Restriction

Deny access to sensitive resources outside business hours (9 AM - 5 PM, weekdays):

    
        json
    
    
```
{
  "name": "Business Hours Only",
  "resourceType": "sensitive-data",
  "action": "*",
  "effect": "deny",
  "priority": 200,
  "conditions": {
    "operator": "OR",
    "conditions": [
      {
        "subject": "environment.hour",
        "operator": "lt",
        "value": 9
      },
      {
        "subject": "environment.hour",
        "operator": "gt",
        "value": 17
      },
      {
        "subject": "environment.isWeekend",
        "operator": "equals",
        "value": true
      }
    ]
  }
}
```

:::tip[Deny Policy Priority]
Deny policies always take precedence over allow policies. If any deny policy
matches, access is denied regardless of other allow policies.
:::


### Contractor Access Restrictions

Deny contractor access outside business hours:

    
        json
    
    
```
{
  "name": "No After-Hours Contractors",
  "resourceType": "*",
  "action": "*",
  "effect": "deny",
  "priority": 200,
  "conditions": {
    "operator": "AND",
    "conditions": [
      {
        "subject": "user.employment_type",
        "operator": "equals",
        "value": "contractor"
      },
      {
        "operator": "OR",
        "conditions": [
          {"subject": "environment.hour", "operator": "lt", "value": 9},
          {"subject": "environment.hour", "operator": "gt", "value": 17},
          {"subject": "environment.isWeekend", "operator": "equals", "value": true}
        ]
      }
    ]
  }
}
```

### Admin Override

Allow admins to access everything (highest priority):

    
        json
    
    
```
{
  "name": "Admin Full Access",
  "resourceType": "*",
  "action": "*",
  "effect": "allow",
  "priority": 1000,
  "conditions": {
    "operator": "OR",
    "conditions": [
      {"subject": "user.roles", "operator": "contains", "value": "admin"},
      {"subject": "user.roles", "operator": "contains", "value": "super-admin"}
    ]
  }
}
```

## API Reference

### Check Access

    
        **POST** 
        `/api/v1/abac/check`
    
    
Evaluate ABAC policies to determine if the current user can perform an action on a resource.

    
        bash
        Request
    
    
```
curl -X POST "https://api.example.com/api/v1/abac/check" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "document",
    "resourceId": "doc-123",
    "action": "read",
    "context": {
      "resource": {
        "classification": "internal"
      }
    }
  }'
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `resourceType` | string | Yes | Type of resource being accessed |
| `resourceId` | string | No | Specific resource ID (optional for type-level checks) |
| `action` | string | Yes | Action being performed (read, write, delete, etc.) |
| `context` | object | No | Additional context to supplement attribute values |

### Bulk Check

    
        **POST** 
        `/api/v1/abac/check-bulk`
    
    
Check multiple resource/action pairs in a single request (max 100).

    
        bash
    
    
```
curl -X POST "https://api.example.com/api/v1/abac/check-bulk" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {"resourceType": "document", "resourceId": "doc-1", "action": "read"},
      {"resourceType": "document", "resourceId": "doc-2", "action": "write"},
      {"resourceType": "api", "action": "execute"}
    ]
  }'
```

### Set Resource Attributes

    
        **PUT** 
        `/api/v1/abac/resources/\{resourceType\}/\{resourceId\}/attributes`
    
    
Set ABAC attributes for a resource. These are used when evaluating policies.

    
        bash
    
    
```
curl -X PUT "https://api.example.com/api/v1/abac/resources/document/doc-123/attributes" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "classification": "confidential",
    "owner_department": "engineering",
    "sensitivity": 3
  }'
```

### Get Current User Attributes

    
        **GET** 
        `/api/v1/abac/my-attributes`
    
    
Get all ABAC attributes for the currently authenticated user.

    
        json
        Response
    
    
```
{
  "id": "user-123",
  "email": "developer@company.com",
  "roles": ["developer", "team-lead"],
  "groups": ["engineering-team"],
  "permissions": ["code.read", "code.write"],
  "emailVerified": true,
  "mfaEnabled": true,
  "department": "engineering",
  "clearance_level": 3,
  "location": "us-west"
}
```

### Set User Attribute

    
        **PUT** 
        `/api/v1/abac/users/\{userId\}/attributes/\{attributeSlug\}`
    
    
Set a specific attribute value for a user.

    
        bash
    
    
```
curl -X PUT "https://api.example.com/api/v1/abac/users/{userId}/attributes/department" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"value": "engineering"}'
```

## Policy Evaluation

### How Policies Are Evaluated

LumoAuth uses a **deny-override** combining algorithm:

1. Collect all policies matching the `resourceType` and `action`
2. Evaluate conditions for each matching policy
3. If **ANY deny policy matches** → Access DENIED
4. If **at least one allow policy matches** → Access ALLOWED
5. If **no policies match** → Access DENIED (default deny)

:::warning[Default Deny]
LumoAuth follows a default-deny model. If no policy explicitly grants access,
the request is denied. Always create explicit allow policies for intended access.
:::


### Priority

Policies with higher priority values are evaluated first. Use this to ensure 
    deny policies take precedence over allow policies:

| Priority Range | Recommended Use |
| --- | --- |
| 900-1000 | Admin overrides, emergency access |
| 200-300 | Deny policies, restrictions |
| 100 | Standard allow policies |
| 0-50 | Default/fallback policies |

## Tenant Portal

Tenant administrators can manage ABAC through the web portal:

1. Navigate to **Access Management → ABAC Policies**
2. **Dashboard**: Overview of policies and attributes
3. **Attributes**: Define custom user and resource attributes
4. **Policies**: Create and manage access policies with a visual builder
5. **Tester**: Test policies with simulated requests before deploying

:::tip[Policy Tester]
Use the ABAC policy tester in the Tenant Portal to simulate authorization
decisions before deploying policies to production.
:::


## Best Practices

    
    
        
            
            Set Appropriate Priorities
        
        
            Use higher priorities for deny policies and admin overrides. 
            Standard allow policies can use priority 100.
        
    
    
    
        
            
            Test Before Deploying
        
        
            Use the Policy Tester to verify behavior before enabling policies. 
            Test both positive and negative cases.
        
    
    
    
        
            
            Be Specific
        
        
            Use specific `resourceType` values when possible. 
            Wildcards (`*`) are convenient but can lead to unintended access.
