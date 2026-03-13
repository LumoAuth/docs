# SCIM Users

                
Provision, update, and deprovision users via SCIM 2.0.

            
        

        
The Users endpoint manages user lifecycle operations. When connected to an identity provider,
            user accounts are automatically created when employees join, updated when profiles change,
            and disabled when employees leave.

    
    
        
            User Response
            
                
                    json
                    
                
                
```
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "id": "2819c223-7f76-453a-919d-413861904646",
  "userName": "alice@example.com",
  "name": {
    "givenName": "Alice",
    "familyName": "Smith",
    "formatted": "Alice Smith"
  },
  "emails": [{
    "value": "alice@example.com",
    "primary": true
  }],
  "displayName": "Alice Smith",
  "active": true,
  "meta": {
    "resourceType": "User",
    "created": "2025-02-01T10:00:00Z",
    "lastModified": "2025-02-01T10:00:00Z"
  }
}
```

            
        
    

    
    

    
        ## List Users

        
            GET
            /scim/v2/Users
        
        
        ### Query Parameters

        
            
                
                    filter
                    string
                    optional
                
                SCIM filter expression (e.g., `userName eq "alice@example.com"`)
            
            
                
                    startIndex
                    integer
                    optional
                
                1-based starting index for pagination
            
            
                
                    count
                    integer
                    optional
                
                Number of results per page
            
        
    
    
        
            List Users Response
            
                
                    json
                    
                
                
```
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  "totalResults": 42,
  "startIndex": 1,
  "itemsPerPage": 10,
  "Resources": [
    {
      "id": "2819c223-7f76-453a-919d-413861904646",
      "userName": "alice@example.com",
      // ... other attributes
    }
  ]
}
```

            
        
    

    
    

    
        ## Get User

        
            GET
            /scim/v2/Users/\{id\}
        
        
Retrieve a single user by their SCIM ID.

    
    
        
            Get User
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Users/2819c223-7f76-453a-919d-413861904646 \
  -H "Authorization: Bearer scim_token"
```

            
        
    

    
    

    
        ## Create User

        
            POST
            /scim/v2/Users
        
        
        ### Required Attributes

        
            
                
                    userName
                    string
                    required
                
                Unique username, typically the email address
            
            
                
                    name
                    object
                    required
                
                Name object with `givenName` and `familyName`
            
            
                
                    emails
                    array
                    required
                
                Array of email objects with `value` and `primary`
            
        
        
        ### Optional Attributes

        
            
                
                    active
                    boolean
                
                Whether the user account is active (default: true)
            
            
                
                    displayName
                    string
                
                Display name (e.g., "Alice Smith")
            
            
                
                    title
                    string
                
                Job title
            
            
                
                    phoneNumbers
                    array
                
                Array of phone number objects
            
            
                
                    groups
                    array
                
                Group memberships (read-only on user, manage via Groups)
            
        
    
    
        
            Create User
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Users \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
    "userName": "alice@example.com",
    "name": {
      "givenName": "Alice",
      "familyName": "Smith"
    },
    "emails": [
      {
        "value": "alice@example.com",
        "primary": true
      }
    ],
    "displayName": "Alice Smith",
    "active": true
  }'
```

            
        
    

    
    

    
        ## Update User

        
            PUT
            /scim/v2/Users/\{id\}
        
        
Replace all user attributes. Include all attributes, not just changed ones.

        
        
            PATCH
            /scim/v2/Users/\{id\}
        
        
Partially update user attributes using SCIM patch operations.

        
        ### Patch Operations

        
| Operation | Description |
| --- | --- |
| `add` | Add a new value to an attribute |
| `replace` | Replace an existing value |
| `remove` | Remove a value or attribute |

    
    
        
            Update User Name
            
                
                    bash
                    
                
                
```
curl -X PATCH https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Users/2819c223-7f76-453a-919d-413861904646 \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {
        "op": "replace",
        "path": "name.familyName",
        "value": "Johnson"
      },
      {
        "op": "replace",
        "path": "displayName",
        "value": "Alice Johnson"
      }
    ]
  }'
```

            
        
    

    
    

    
        ## Delete User

        
            DELETE
            /scim/v2/Users/\{id\}
        
        
Permanently delete a user. Most identity providers prefer deactivating users instead (PATCH with `active: false`).

        
        > [!NOTE]
> **Deactivation vs Deletion**

    
        
            Deactivate User (PATCH)
            
                
                    bash
                    
                
                
```
curl -X PATCH https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Users/2819c223-7f76-453a-919d-413861904646 \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {
        "op": "replace",
        "path": "active",
        "value": false
      }
    ]
  }'
```
