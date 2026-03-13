# Zanzibar Authorization

                
Relationship-based access control inspired by Google's Zanzibar.

            
        

        
Zanzibar is Google's global authorization system that powers access control for services like Drive, Calendar, and Cloud.
            LumoAuth implements a Zanzibar-inspired **Relationship-Based Access Control (ReBAC)** system that models
            permissions as relationships between users and objects.

        > [!NOTE]
> **When to Use Zanzibar vs ABAC**

    
        
            Check Access
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/zanzibar/check \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "document",
    "object_id": "doc_12345",
    "relation": "editor",
    "user_type": "user",
    "user_id": "user_abc123"
  }'
```

            
        
    

    
    

    
        ## Core Concepts

        
        ### Tuples

        
Zanzibar models permissions as **relationship tuples** in the format:

        
            `object:relation:user`
        
        
For example:

        
- `document:123:viewer:user:alice` → Alice can view document 123
- `folder:projects:owner:user:bob` → Bob owns the projects folder
- `team:engineering:member:user:charlie` → Charlie is in the engineering team

        
        ### Permission Inheritance

        
Permissions can inherit through relationships. If Bob owns a folder, he automatically owns all documents in it:

        
- `folder:projects:owner:user:bob`
- `document:123:parent:folder:projects`
- → Bob can access document 123 (inherited from folder)

    
    
        
            Access Granted
            
                
                    json
                    
                
                
```
{
  "allowed": true,
  "resolution_metadata": {
    "resolved_via": "direct",
    "depth": 0
  }
}
```

            
        

        
            Inherited Access
            
                
                    json
                    
                
                
```
{
  "allowed": true,
  "resolution_metadata": {
    "resolved_via": "inheritance",
    "path": [
      "folder:projects:owner:user:bob",
      "document:doc_12345:parent:folder:projects"
    ],
    "depth": 1
  }
}
```

            
        
    

    
    

    
        ## Check Access

        
            POST
            /t/\{tenant\}/api/v1/zanzibar/check
        
        
        
Check if a user has a specific relationship to an object.

        
        ### Request Body

        
            
                
                    object_type
                    string
                    required
                
                Type of the object (e.g., "document", "folder", "project")
            
            
                
                    object_id
                    string
                    required
                
                Identifier of the specific object
            
            
                
                    relation
                    string
                    required
                
                The relationship to check (e.g., "viewer", "editor", "owner")
            
            
                
                    user_type
                    string
                    required
                
                Type of subject (usually "user" or "service")
            
            
                
                    user_id
                    string
                    required
                
                Identifier of the user or subject
            
        
        
        ### Response

        
            Check Result
            
                
                    allowed
                    
                        boolean
                        `true` if the user has the relationship, `false` otherwise
                    
                
                
                    resolution_metadata
                    
                        object
                        Debug info about how the decision was reached
                    
                
            
        
    
    
        
            Python Example
            
                
                    python
                    
                
                
```
import requests

def can_access(object_type, object_id, relation, user_id):
    """Check if user has a relationship to an object."""
    response = requests.post(
        "https://app.lumoauth.dev/t/acme-corp/api/v1/zanzibar/check",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "object_type": object_type,
            "object_id": object_id,
            "relation": relation,
            "user_type": "user",
            "user_id": user_id
        }
    )
    return response.json()["allowed"]

# Check if Alice can edit the document
if can_access("document", "doc_12345", "editor", "alice"):
    print("Access granted!")
else:
    print("Access denied.")
```

            
        
    

    
    

    
        ## Common Relations

        
| Relation | Description |
| --- | --- |
| `owner` | Full control including delete and manage permissions |
| `editor` | Can read and modify, but not delete or manage permissions |
| `viewer` | Read-only access |
| `member` | Belongs to a group or team |
| `parent` | Hierarchy relationship for inheritance |

    
    
        
            Create Relationship
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/zanzibar/tuples \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "document",
    "object_id": "doc_12345",
    "relation": "viewer",
    "user_type": "user",
    "user_id": "user_xyz789"
  }'
```

            
        
    

    
    

    
        ## Write Relationships

        
            POST
            /t/\{tenant\}/api/v1/zanzibar/tuples
        
        
        
Create a new relationship tuple.

        
        
            DELETE
            /t/\{tenant\}/api/v1/zanzibar/tuples
        
        
        
Remove a relationship tuple.

    
    
        
            Delete Relationship
            
                
                    bash
                    
                
                
```
curl -X DELETE https://app.lumoauth.dev/t/acme-corp/api/v1/zanzibar/tuples \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "document",
    "object_id": "doc_12345",
    "relation": "viewer",
    "user_type": "user",
    "user_id": "user_xyz789"
  }'
```
