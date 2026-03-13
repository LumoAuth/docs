# Users Endpoint

The `/Users` endpoint provides full CRUD operations for user resources per RFC 7643/7644.

## List Users

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Users`
    

### Query Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `filter` | string | SCIM filter expression (e.g., `userName eq "john@acme.com"`) |
| `startIndex` | integer | 1-based index of first result (default: 1) |
| `count` | integer | Maximum results to return (default: 100, max: 200) |
| `sortBy` | string | Attribute to sort by (e.g., `userName`, `name.familyName`) |
| `sortOrder` | string | `ascending` or `descending` |
| `attributes` | string | Comma-separated list of attributes to return |
| `excludedAttributes` | string | Comma-separated list of attributes to exclude |

### Filter Examples

```bash
# Filter by username
GET /scim2.0/Users?filter=userName eq "john@acme.com"

# Filter by active status
GET /scim2.0/Users?filter=active eq true

# Complex filter
GET /scim2.0/Users?filter=name.familyName sw "Sm" and active eq true

# Include soft-deleted
GET /scim2.0/Users?filter=isSoftDeleted eq true
```

### Response

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  "totalResults": 42,
  "startIndex": 1,
  "itemsPerPage": 10,
  "Resources": [
    {
      "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
      "id": "123",
      "userName": "john@acme.com",
      "name": {
        "formatted": "John Smith",
        "familyName": "Smith",
        "givenName": "John"
      },
      "emails": [
        {"value": "john@acme.com", "primary": true, "type": "work"}
      ],
      "active": true,
      "meta": {
        "resourceType": "User",
        "created": "2024-01-01T00:00:00Z",
        "lastModified": "2024-06-15T12:30:00Z",
        "location": "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users/123",
        "version": "W/\"5\""
      }
    }
  ]
}
```

## Get User

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Users/\{id\}`
    

```bash
curl -X GET "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users/123" \
  -u "admin@acme.com:password" \
  -H "Accept: application/scim+json"
```

## Create User

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Users`
    

```bash
curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users" \
  -u "admin@acme.com:password" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
    "userName": "jane@acme.com",
    "name": {
      "givenName": "Jane",
      "familyName": "Doe"
    },
    "emails": [
      {"value": "jane@acme.com", "primary": true, "type": "work"}
    ],
    "password": "SecurePassword123!",
    "active": true
  }'
```

## Update User (Replace)

    
        **PUT** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Users/\{id\}`
    

Replace the entire user resource. Include all required attributes.

## Partial Update (PATCH)

    
        PATCH
        `/t/\{tenantSlug\}/api/v1/scim2.0/Users/\{id\}`
    

PATCH supports `add`, `replace`, and `remove` operations:

```bash
curl -X PATCH "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users/123" \
  -u "admin@acme.com:password" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {"op": "replace", "path": "active", "value": false},
      {"op": "replace", "path": "name.givenName", "value": "Johnny"}
    ]
  }'
```

## Delete User

    
        **DELETE** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Users/\{id\}`
    

:::warning[Soft Delete by Default]
Deleting a user via SCIM sets them to `active: false` rather than permanently
removing them. This allows recovery and maintains audit trails.
:::


```bash
# Soft delete
curl -X DELETE "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users/123" \
  -u "admin@acme.com:password"

# Hard delete (after soft delete)
curl -X DELETE "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users/123?isSoftDeleted=true" \
  -u "admin@acme.com:password"
```

## User Schema

| Attribute | Type | Mutability | Description |
| --- | --- | --- | --- |
| `id` | string | readOnly | Unique identifier |
| `userName` | string | readWrite | Unique username (email) |
| `externalId` | string | readWrite | External system identifier |
| `name.formatted` | string | readWrite | Full formatted name |
| `name.givenName` | string | readWrite | First name |
| `name.familyName` | string | readWrite | Last name |
| `displayName` | string | readWrite | Display name |
| `emails` | array | readWrite | Email addresses |
| `phoneNumbers` | array | readWrite | Phone numbers |
| `active` | boolean | readWrite | Account active status |
| `password` | string | writeOnly | Password (never returned) |
| `meta` | object | readOnly | Resource metadata |
