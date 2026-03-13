# Groups Endpoint

The `/Groups` endpoint manages SCIM Group resources for organizing users into logical groups.

## List Groups

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Groups`
    

```bash
curl -X GET "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Groups" \
  -u "admin@acme.com:password" \
  -H "Accept: application/scim+json"
```

### Response

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  "totalResults": 5,
  "Resources": [
    {
      "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
      "id": "10",
      "displayName": "Engineering",
      "members": [
        {"value": "123", "$ref": ".../Users/123", "display": "John Smith"},
        {"value": "456", "$ref": ".../Users/456", "display": "Jane Doe"}
      ],
      "meta": {
        "resourceType": "Group",
        "created": "2024-01-01T00:00:00Z",
        "lastModified": "2024-06-15T12:30:00Z",
        "location": "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Groups/10",
        "version": "W/\"3\""
      }
    }
  ]
}
```

## Create Group

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Groups`
    

```bash
curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Groups" \
  -u "admin@acme.com:password" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    "displayName": "Marketing",
    "members": [
      {"value": "123"},
      {"value": "456"}
    ]
  }'
```

## Update Group Members (PATCH)

Use PATCH to add or remove members without replacing the entire group:

```bash
# Add members
curl -X PATCH "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Groups/10" \
  -u "admin@acme.com:password" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {"op": "add", "path": "members", "value": [{"value": "789"}]}
    ]
  }'

# Remove specific member
curl -X PATCH "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Groups/10" \
  -u "admin@acme.com:password" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {"op": "remove", "path": "members[value eq \"123\"]"}
    ]
  }'
```

## Delete Group

    
        **DELETE** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Groups/\{id\}`
    

Like Users, Groups support soft delete by default.

## Group Schema

| Attribute | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | - | Unique identifier (readOnly) |
| `displayName` | string | Yes | Group display name |
| `externalId` | string | No | External system identifier |
| `members` | array | No | Group membership (User references) |
| `meta` | object | - | Resource metadata (readOnly) |
