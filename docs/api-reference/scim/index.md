# SCIM 2.0

                
Automate user provisioning and deprovisioning with your identity provider.

            
        

        
SCIM (System for Cross-domain Identity Management) is an open standard for automating user provisioning.
            When you connect LumoAuth to an identity provider like Okta, Azure AD, or OneLogin, users are automatically
            created, updated, and deactivated—no manual work required.

        > [!NOTE]
> **What SCIM Does**

    
        
            Service Provider Config
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/ServiceProviderConfig \
  -H "Authorization: Bearer scim_token"
```

            
        
    

    
    

    
        ## Base URL

        
            /t/\{tenant\}/api/v1/scim/v2
        
        
All SCIM endpoints are prefixed with this base URL.

    
    
        
            Config Response
            
                
                    json
                    
                
                
```
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
  "documentationUri": "https://docs.lumoauth.com/scim",
  "patch": { "supported": true },
  "bulk": {
    "supported": true,
    "maxOperations": 1000,
    "maxPayloadSize": 1048576
  },
  "filter": {
    "supported": true,
    "maxResults": 200
  },
  "changePassword": { "supported": true },
  "sort": { "supported": true },
  "etag": { "supported": true },
  "authenticationSchemes": [
    {
      "type": "oauthbearertoken",
      "name": "OAuth Bearer Token",
      "description": "Authentication using Bearer tokens"
    }
  ]
}
```

            
        
    

    
    

    
        ## Available Endpoints

        
| Endpoint | Description |
| --- | --- |
| [/Users](/api-reference/scim/users) | Create, read, update, and delete users |
| [/Groups](/api-reference/scim/groups) | Manage groups and group memberships |
| [/Bulk](/api-reference/scim/bulk) | Perform multiple operations in a single request |
| /ServiceProviderConfig | Discover supported features and capabilities |
| /ResourceTypes | List available resource types (User, Group) |
| /Schemas | Get schema definitions for resources |

    
    
        
            List All Users
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Users \
  -H "Authorization: Bearer scim_token"
```

            
        
        
            Resource Types
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/ResourceTypes \
  -H "Authorization: Bearer scim_token"
```

            
        
    

    
    

    
        ## Authentication

        
SCIM endpoints require Bearer token authentication:

        
            `Authorization: Bearer scim_token_here`
        
        
Generate a SCIM token in your identity provider's app configuration or the LumoAuth admin console.

    
    
        
    

    
    

    
        ## Common Headers

        
            
                
                    Content-Type
                    string
                
                `application/scim+json` (or `application/json`)
            
            
                
                    Accept
                    string
                
                `application/scim+json`
            
        
    
    
        
    

    
    

    
        ## Filtering

        
Use the `filter` query parameter to search for resources:

        
| Filter | Description |
| --- | --- |
| `userName eq "alice@example.com"` | Exact match |
| `displayName co "John"` | Contains substring |
| `active eq true` | Boolean match |
| `emails.value eq "alice@example.com"` | Nested attribute match |

    
    
        
            Filter Users
            
                
                    bash
                    
                
                
```
# Find user by email
curl 'https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Users?filter=userName%20eq%20"alice@example.com"' \
  -H "Authorization: Bearer scim_token"
```

            
        
    

    
    

    
        ## Pagination

        
Large result sets are paginated:

        
            
                
                    startIndex
                    integer
                
                1-based index of first result (default: 1)
            
            
                
                    count
                    integer
                
                Maximum number of results per page (default: 100)
            
        
    
    
        
    

    
    

    
        ## Setting Up SCIM

        ### With Okta

        
1. In Okta, create a new SCIM 2.0 app integration
2. Set Base URL to `https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2`
3. Set Authentication to Bearer Token
4. Enter your SCIM token from LumoAuth
5. Test the connection and assign users

        
        ### With Azure AD

        
1. In Azure AD, add an enterprise application
2. Go to Provisioning → Get Started
3. Set Provisioning Mode to Automatic
4. Enter Tenant URL and Secret Token from LumoAuth
5. Test connection and start provisioning

        > [!WARNING]
> **RFC Compliance**
