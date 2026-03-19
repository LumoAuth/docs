# Attribute-Based Access Control (ABAC)

ABAC makes access decisions based on attributes of the user, resource, action, and environment. Unlike RBAC which relies on static role assignments, ABAC policies can evaluate dynamic conditions like time of day, IP address, user department, or resource ownership.

---

## How ABAC Works

An ABAC policy evaluates four categories of attributes:

| Category | Examples |
|----------|---------|
| **Subject** (who) | User role, department, clearance level, group membership |
| **Resource** (what) | Document classification, owner, creation date |
| **Action** (how) | Read, write, delete, approve |
| **Environment** (context) | Time of day, IP address, device type, location |

### Example Policy

> "Allow users in the `engineering` group to `write` to `internal` documents during business hours (9 AM – 6 PM) from trusted IP ranges."

```
Subject:     group = "engineering"
Resource:    classification = "internal"
Action:      write
Environment: time between 09:00-18:00 AND ip in trusted_ranges
Decision:    ALLOW
```

---

## Managing ABAC Policies

### Create a Policy

1. Go to `/t/{tenantSlug}/portal/access-management/abac`
2. Click **Create Policy**
3. Define the policy conditions:

| Field | Description |
|-------|-------------|
| **Name** | Human-readable policy name |
| **Description** | What this policy controls |
| **Subject Conditions** | Attribute conditions on the user |
| **Resource Conditions** | Attribute conditions on the target resource |
| **Action** | The action being controlled |
| **Environment Conditions** | Contextual conditions |
| **Decision** | Allow or Deny |
| **Priority** | Evaluation order (higher priority wins on conflict) |

### Policy Evaluation

When multiple policies match a request, the evaluation follows:

1. All matching policies are collected
2. **Deny** policies take precedence over **Allow** policies (deny-overrides)
3. If no policies match, the default decision is **Deny** (closed-world assumption)

---

## Subject Attributes

User attributes available for ABAC conditions:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `user.email` | User's email address | `alice@acme.com` |
| `user.roles` | Assigned roles | `["editor", "auditor"]` |
| `user.groups` | Group memberships | `["engineering"]` |
| `user.department` | Department field | `"engineering"` |
| `user.created_at` | Account creation date | `2025-01-15` |
| `user.mfa_enabled` | Whether MFA is active | `true` |
| `user.email_verified` | Email verification status | `true` |

---

## Environment Attributes

Contextual attributes evaluated at request time:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `env.time` | Current time | `14:30` |
| `env.day_of_week` | Current day | `monday` |
| `env.ip_address` | Request source IP | `192.168.1.100` |
| `env.country` | GeoIP country | `US` |
| `env.device_type` | Device classification | `desktop` |
| `env.auth_method` | How the user authenticated | `passkey` |
| `env.risk_score` | Adaptive auth risk score | `25` |

---

## Example Policies

### Restrict Sensitive Operations to MFA Users

```
Name:        Require MFA for sensitive actions
Subject:     user.mfa_enabled = false
Action:      delete, approve
Decision:    DENY
```

### Geographic Restriction

```
Name:        Allow access only from US
Environment: env.country != "US"
Decision:    DENY
```

### Business Hours Only

```
Name:        Allow write access during business hours
Action:      write
Environment: env.time >= 09:00 AND env.time <= 18:00
             AND env.day_of_week in ["monday","tuesday","wednesday","thursday","friday"]
Decision:    ALLOW
```

### High-Risk Score Denial

```
Name:        Block high-risk sessions
Environment: env.risk_score >= 80
Decision:    DENY
```

---

## Combining ABAC with RBAC

ABAC complements RBAC by adding contextual conditions. A common pattern:

1. **RBAC** determines *what* a user can do (based on roles)
2. **ABAC** determines *when* and *where* they can do it (based on context)

Example: An `editor` role grants `documents:write`, but an ABAC policy restricts writes to business hours from trusted IPs.

---

## Testing Policies

Use the Permission Tester at `/t/{tenantSlug}/portal/access-management/permission-tester`:

1. Select a user
2. Specify the resource and action
3. Set environment context (time, IP, etc.)
4. View which policies match and the resulting decision
5. Debug policy conflicts

---

## Related Guides

- [Roles & Permissions](roles-permissions.md) - Base RBAC authorization
- [Zanzibar](zanzibar.md) - Relationship-based fine-grained access
- [AI Policy Authoring](ai-policy-authoring.md) - Create ABAC policies using natural language
- [Adaptive MFA](../authentication/adaptive-mfa.md) - Risk scores as ABAC attributes
