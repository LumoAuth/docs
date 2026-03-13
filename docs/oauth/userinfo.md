# UserInfo Endpoint

Retrieve profile information about the authenticated user or agent. 
    This is an OpenID Connect standard endpoint.

    
        **GET** 
        **POST** 
        `/t/\{tenantSlug\}/api/v1/oauth/userinfo`
    

## When to Use UserInfo

While the ID token contains user information at the time of authentication, the UserInfo endpoint 
    provides **current** profile data. Use it when:

- Displaying a user profile page
- Syncing user data with your database
- Checking current roles and permissions
- The ID token claims aren't sufficient for your needs

## Request

Include the access token in the Authorization header:

```bash
curl -X GET https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/userinfo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Response: User Identity

For regular users authenticated via OAuth:

```json
{
  "sub": "12345",
  "name": "John Smith",
  "email": "john@example.com",
  "email_verified": true,
  "picture": "https://example.com/avatars/john.jpg",
  "roles": ["ROLE_USER", "ROLE_EDITOR"],
  "tenant": "acme-corp",
  "updated_at": 1704063600
}
```

## Response: Agent Identity

For AI agents authenticated via client credentials or workload federation:

```json
{
  "sub": "agent_analyst_bot",
  "name": "Financial Analyst Bot",
  "agent_id": "agt_abc123",
  "identity_type": "agent",
  "capabilities": [
    "read:reports",
    "tool:search",
    "write:analysis"
  ],
  "workload_identity": "aws:sts:analyst-server",
  "tenant": "acme-corp",
  "budget_policy": {
    "max_tokens_per_day": 100000,
    "max_api_calls_per_hour": 1000
  }
}
```

## Response Fields

### Standard OIDC Claims

| Claim | Description | Scope Required |
| --- | --- | --- |
| `sub` | Unique identifier for the user/agent | `openid` |
| `name` | Full name | `profile` |
| `email` | Email address | `email` |
| `email_verified` | Whether email has been verified | `email` |
| `picture` | Profile picture URL | `profile` |

### LumoAuth-Specific Claims

| Claim | Description |
| --- | --- |
| `roles` | Array of roles assigned to the user |
| `tenant` | Tenant slug the identity belongs to |
| `identity_type` | `user` or `agent` |
| `capabilities` | Agent-specific: allowed actions |
| `workload_identity` | Agent-specific: external identity source |
| `budget_policy` | Agent-specific: usage limits |
