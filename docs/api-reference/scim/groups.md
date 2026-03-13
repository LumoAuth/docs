# SCIM Groups

                
Sync group memberships from your identity provider.

            
        

        
The Groups endpoint manages group lifecycle and membership. Groups synced from your identity provider
            (like Active Directory security groups or Okta groups) can be used for role-based access control in LumoAuth.

    
    
        
            Group Response
            
                
                    json
                    
                
                
```
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
  "id": "e9e30dba-f08f-4109-8486-d5c6a331660a",
  "displayName": "Engineering",
  "members": [
    {
      "value": "2819c223-7f76-453a-919d-413861904646",
      "display": "Alice Smith",
      "$ref": "https://app.lumoauth.dev/.../Users/2819c223..."
    }
  ],
  "meta": {
    "resourceType": "Group",
    "created": "2025-02-01T10:00:00Z",
    "lastModified": "2025-02-01T10:00:00Z"
  }
}
```

            
        
    

    
    

    
        ## List Groups

        
            GET
            /scim/v2/Groups
        
        
        ### Query Parameters

        
            
                
                    filter
                    string
                    optional
                
                SCIM filter (e.g., `displayName eq "Engineering"`)
            
            
                
                    startIndex
                    integer
                    optional
                
                1-based pagination index
            
            
                
                    count
                    integer
                    optional
                
                Results per page
            
        
    
    
        
            List Groups
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Groups \
  -H "Authorization: Bearer scim_token"
```

            
        
    

    
    

    
        ## Get Group

        
            GET
            /scim/v2/Groups/\{id\}
        
        
Retrieve a single group with its members.

    
    
        
            Get Group
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Groups/e9e30dba-f08f-4109-8486-d5c6a331660a \
  -H "Authorization: Bearer scim_token"
```

            
        
    

    
    

    
        ## Create Group

        
            POST
            /scim/v2/Groups
        
        
        ### Request Body

        
            
                
                    displayName
                    string
                    required
                
                Human-readable group name
            
            
                
                    members
                    array
                    optional
                
                Array of member objects with `value` (user ID) and `display`
            
        
    
    
        
            Create Group
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Groups \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    "displayName": "Engineering",
    "members": [
      {
        "value": "2819c223-7f76-453a-919d-413861904646",
        "display": "Alice Smith"
      }
    ]
  }'
```

            
        
    

    
    

    
        ## Update Group

        
            PUT
            /scim/v2/Groups/\{id\}
        
        
Replace all group attributes including membership list.

        
        
            PATCH
            /scim/v2/Groups/\{id\}
        
        
Partially update group. Most commonly used to add/remove members.

    
    
        
            Add Member to Group
            
                
                    bash
                    
                
                
```
curl -X PATCH https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Groups/e9e30dba-f08f-4109-8486-d5c6a331660a \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {
        "op": "add",
        "path": "members",
        "value": [
          {
            "value": "user-id-to-add",
            "display": "Bob Jones"
          }
        ]
      }
    ]
  }'
```

            
        
    

    
    

    
        ## Delete Group

        
            DELETE
            /scim/v2/Groups/\{id\}
        
        
Delete a group. Member users are not deleted.

    
    
        
            Remove Member from Group
            
                
                    bash
                    
                
                
```
curl -X PATCH https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Groups/e9e30dba-f08f-4109-8486-d5c6a331660a \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    "Operations": [
      {
        "op": "remove",
        "path": "members[value eq \"2819c223-7f76-453a-919d-413861904646\"]"
      }
    ]
  }'
```

            
        
    

    
    

    
        ## Managing Members

        
Use PATCH operations to add or remove members from a group:

        
        
| Operation | Path | Description |
| --- | --- | --- |
| `add` | `members` | Add new members to the group |
| `remove` | `members[value eq "user-id"]` | Remove specific member from group |
| `replace` | `members` | Replace entire member list |

        > [!NOTE]
> **Groups and Roles**
