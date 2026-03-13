# Bulk Operations & Search

Perform multiple operations in a single request or search across resource types.

## Bulk Operations

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Bulk`
    

Execute multiple SCIM operations (POST, PUT, DELETE) in a single HTTP request. 
    Operations are processed sequentially and can reference resources created earlier 
    in the same request using `bulkId`.

```bash
curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Bulk" \
  -u "admin@acme.com:password" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:BulkRequest"],
    "Operations": [
      {
        "method": "POST",
        "path": "/Users",
        "bulkId": "user1",
        "data": {
          "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
          "userName": "alice@acme.com",
          "name": {"givenName": "Alice", "familyName": "Wonder"}
        }
      },
      {
        "method": "POST",
        "path": "/Users",
        "bulkId": "user2",
        "data": {
          "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
          "userName": "bob@acme.com",
          "name": {"givenName": "Bob", "familyName": "Builder"}
        }
      },
      {
        "method": "POST",
        "path": "/Groups",
        "data": {
          "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
          "displayName": "New Team",
          "members": [
            {"value": "bulkId:user1"},
            {"value": "bulkId:user2"}
          ]
        }
      }
    ]
  }'
```

### Response

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:BulkResponse"],
  "Operations": [
    {
      "method": "POST",
      "bulkId": "user1",
      "location": "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users/100",
      "status": "201",
      "response": {
        "id": "100",
        "userName": "alice@acme.com"
      }
    },
    {
      "method": "POST",
      "bulkId": "user2",
      "location": "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users/101",
      "status": "201",
      "response": {
        "id": "101",
        "userName": "bob@acme.com"
      }
    },
    {
      "method": "POST",
      "location": "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Groups/50",
      "status": "201",
      "response": {
        "id": "50",
        "displayName": "New Team"
      }
    }
  ]
}
```

### Request Parameters

| Field | Type | Description |
| --- | --- | --- |
| `Operations` | array | Array of operations to execute |
| `failOnErrors` | integer | Stop processing after this many errors (0 = continue all) |

### Operation Fields

| Field | Description |
| --- | --- |
| `method` | HTTP method: POST, PUT, or DELETE |
| `path` | Resource path (e.g., `/Users`, `/Groups/123`) |
| `bulkId` | Client-generated ID for cross-referencing |
| `data` | Resource data for POST/PUT |

:::tip[BulkId References]
Use `bulkId` references to create related resources in a single request.
For example, create a user and add them to a group in one bulk operation.
:::


## Search

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/.search`
    

POST-based search allows complex queries that may be too long for URL query parameters. 
    This endpoint can search across all resource types.

```bash
curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/.search" \
  -u "admin@acme.com:password" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
    "filter": "name.familyName sw \"Sm\" and active eq true",
    "startIndex": 1,
    "count": 50,
    "sortBy": "userName",
    "sortOrder": "ascending",
    "attributes": ["userName", "name", "emails"]
  }'
```

### Resource-Specific Search

You can also POST to resource-specific search endpoints:

```bash
# Search only Users
POST /scim2.0/Users/.search

# Search only Groups
POST /scim2.0/Groups/.search
```

## Filter Syntax

SCIM filters follow RFC 7644 syntax with support for various operators:

| Operator | Description | Example |
| --- | --- | --- |
| `eq` | Equal | `userName eq "john@acme.com"` |
| `ne` | Not equal | `active ne false` |
| `co` | Contains | `userName co "acme"` |
| `sw` | Starts with | `name.familyName sw "Sm"` |
| `ew` | Ends with | `userName ew "@acme.com"` |
| `gt` | Greater than | `meta.created gt "2024-01-01"` |
| `ge` | Greater or equal | `meta.created ge "2024-01-01"` |
| `lt` | Less than | `meta.lastModified lt "2024-06-01"` |
| `le` | Less or equal | `meta.lastModified le "2024-06-01"` |
| `pr` | Present (has value) | `externalId pr` |

### Complex Filters

```bash
# Get my profile
curl -X GET "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Me" \
  -u "john@acme.com:mypassword"

# Update my display name
curl -X PATCH "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Me" \
  -u "john@acme.com:mypassword" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {"op": "replace", "path": "displayName", "value": "Johnny S"}
    ]
  }'
```
