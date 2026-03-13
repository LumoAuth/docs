# SCIM 2.0 API

LumoAuth implements the System for Cross-domain Identity Management (SCIM) 2.0 protocol for automated 
    user provisioning and management. SCIM enables identity providers to manage users and groups across 
    multiple systems using a standardized REST API.

:::note[Standards Compliance]
LumoAuth's SCIM implementation is compliant with RFC 7643 (Core Schema)
and RFC 7644 (Protocol). Interoperability with major IdP vendors is validated.
:::


## Base URL

All SCIM endpoints are tenant-scoped at:

```bash
curl -X GET "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users" \
  -u "admin@acme.com:password" \
  -H "Accept: application/scim+json"
```

### OAuth 2.0 Bearer Token

```bash
curl -X GET "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/Users" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Accept: application/scim+json"
```

## Available Endpoints

    
        **GET** 
        **POST** 
        **PUT** 
        **DEL** 
        `/Users`
    
    
Manage user resources. Supports filtering, pagination, sorting, and PATCH operations.
        [View details →](/scim/users)

    
        **GET** 
        **POST** 
        **PUT** 
        **DEL** 
        `/Groups`
    
    
Manage group resources and memberships.
        [View details →](/scim/groups)

    
        **GET** 
        `/ServiceProviderConfig, /ResourceTypes, /Schemas`
    
    
Discovery endpoints for service capabilities and schema definitions.
        [View details →](/scim/discovery)

    
        **POST** 
        `/Bulk, /.search`
    
    
Bulk operations and cross-resource search.
        [View details →](/scim/bulk)

## Content Types

SCIM uses its own media types. Always include these headers:

| Header | Value | Description |
| --- | --- | --- |
| `Content-Type` | `application/scim+json` | Required for POST, PUT, PATCH requests |
| `Accept` | `application/scim+json` | Recommended for all requests |

## Error Responses

SCIM errors follow a standardized format per RFC 7644:

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
  "status": "400",
  "scimType": "invalidFilter",
  "detail": "Filter syntax error at position 15"
}
```

| Status | scimType | Description |
| --- | --- | --- |
| `400` | `invalidFilter` | Invalid filter syntax |
| `400` | `invalidValue` | Invalid attribute value |
| `401` | - | Authentication required |
| `404` | - | Resource not found |
| `409` | `uniqueness` | Unique constraint violation |
| `412` | `mutability` | ETag mismatch (optimistic locking) |
