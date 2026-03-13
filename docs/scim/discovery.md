# Discovery Endpoints

Discovery endpoints allow SCIM clients to learn about the service provider's capabilities, 
    supported resources, and schema definitions.

## Service Provider Configuration

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/ServiceProviderConfig`
    

Returns the service provider's configuration including supported features and authentication schemes.
    **This endpoint does not require authentication.**

```bash
curl -X GET "https://app.lumoauth.dev/t/acme-corp/api/v1/scim2.0/ServiceProviderConfig"
```

### Response

```json
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
  "documentationUri": "https://app.lumoauth.dev/docs/scim",
  "patch": {"supported": true},
  "bulk": {
    "supported": true,
    "maxOperations": 1000,
    "maxPayloadSize": 1048576
  },
  "filter": {
    "supported": true,
    "maxResults": 200
  },
  "changePassword": {"supported": true},
  "sort": {"supported": true},
  "etag": {"supported": true},
  "authenticationSchemes": [
    {
      "name": "HTTP Basic",
      "description": "Authentication via HTTP Basic",
      "type": "httpbasic"
    },
    {
      "name": "OAuth Bearer Token",
      "description": "Authentication via OAuth 2.0 Bearer Token",
      "type": "oauthbearertoken"
    }
  ]
}
```

## Resource Types

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/ResourceTypes`
    

Lists all supported resource types (User, Group, etc.) and their schemas.

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  "totalResults": 2,
  "Resources": [
    {
      "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
      "id": "User",
      "name": "User",
      "endpoint": "/Users",
      "description": "User resource",
      "schema": "urn:ietf:params:scim:schemas:core:2.0:User",
      "schemaExtensions": [
        {
          "schema": "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
          "required": false
        }
      ]
    },
    {
      "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
      "id": "Group",
      "name": "Group",
      "endpoint": "/Groups",
      "description": "Group resource",
      "schema": "urn:ietf:params:scim:schemas:core:2.0:Group"
    }
  ]
}
```

## Schemas

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Schemas`
    

Returns the full schema definitions for all supported resource types. This includes all attributes, 
    their types, mutability, and other metadata.

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/scim2.0/Schemas/\{schemaUrn\}`
    

Get a specific schema by its URN:

```bash
# Get User schema
GET /scim2.0/Schemas/urn:ietf:params:scim:schemas:core:2.0:User

# Get Group schema  
GET /scim2.0/Schemas/urn:ietf:params:scim:schemas:core:2.0:Group

# Get Enterprise User extension
GET /scim2.0/Schemas/urn:ietf:params:scim:schemas:extension:enterprise:2.0:User
```

## Supported Schemas

| Schema URN | Description |
| --- | --- |
| `urn:ietf:params:scim:schemas:core:2.0:User` | Core User schema (RFC 7643) |
| `urn:ietf:params:scim:schemas:core:2.0:Group` | Core Group schema (RFC 7643) |
| `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User` | Enterprise User extension |
| `urn:ietf:params:scim:schemas:extension:lumoauth:1.0:SoftDelete` | Soft delete extension |
| `urn:ietf:params:scim:schemas:extension:lumoauth:1.0:Password` | Password management extension |
