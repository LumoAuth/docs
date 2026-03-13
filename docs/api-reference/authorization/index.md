# Attribute-Based Access Control

                
Fine-grained authorization using policies and attributes.

            
        

        
Attribute-Based Access Control (ABAC) is a powerful authorization model that makes decisions based
            on attributes of the user, resource, action, and environment. Unlike simple role-based access control,
            ABAC enables complex, context-aware authorization rules.

    
    
        
            Example: Document Access
            
                
                    text
                    
                
                
```
# Simple RBAC rule
"Editors can edit documents"

# ABAC rule with context
"Users can edit documents they own"
"OR documents in their department"
"UNLESS the document is archived"
```

            
        
    

    
    

    
        ## Why ABAC?

        
        
Traditional role-based access control (RBAC) assigns permissions based on roles:

        
- *"Managers can approve expenses"*
- *"Admins can delete users"*

        
        
ABAC extends this with contextual rules:

        
- *"Managers can approve expenses **under $10,000**"*
- *"Users can edit documents **they created**"*
- *"Employees can access the system **during business hours**"*
- *"Support agents can view tickets **in their assigned region**"*

    
    
        
    

    
    

    
        ## Core Concepts

        
        
            
                
                ### Subject

                
The entity requesting access (user, service, or agent). Carries attributes like role, department, location.

            
            
            
                
                ### Resource

                
What is being accessed (document, order, API endpoint). Has attributes like owner, type, sensitivity.

            
            
            
                
                ### Action

                
The operation being performed (read, write, delete, approve). Defines what the subject wants to do.

            
            
            
                
                ### Environment

                
Contextual factors (time, IP address, device). Enables time-based or location-based rules.

            
        
    
    
        
            ABAC Check Request
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/api/v1/abac/check \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": {
      "id": "user_123",
      "attributes": {
        "department": "engineering",
        "role": "developer"
      }
    },
    "action": "edit",
    "resource": {
      "type": "document",
      "id": "doc_456",
      "attributes": {
        "owner": "user_789",
        "department": "engineering"
      }
    }
  }'
```

            
        
    

    
    

    
        ## How ABAC Works

        
        
            
                1
                
                    #### Request Comes In

                    
Your application receives a request (e.g., "User wants to edit document #123")

                
            
            
                2
                
                    #### Collect Attributes

                    
Gather subject, resource, and environment attributes

                
            
            
                3
                
                    #### Call ABAC Check API

                    
Send attributes to LumoAuth's `/api/v1/abac/check` endpoint

                
            
            
                4
                
                    #### Policy Evaluation

                    
LumoAuth evaluates all matching policies against the attributes

                
            
            
                5
                
                    #### Decision Returned

                    
You receive `allow` or `deny` with explanation

                
            
        
    
    
        
            ABAC Check Response
            
                
                    json
                    
                
                
```
{
  "decision": "allow",
  "reason": "Matched policy: department_document_access",
  "policies": [
    {
      "id": "pol_abc123",
      "name": "Department Document Access",
      "effect": "allow"
    }
  ]
}
```

            
        
    

    
    

    
        ## ABAC vs RBAC

        
        
| Aspect | RBAC | ABAC |
| --- | --- | --- |
| Decision Basis | User's roles | Multiple attributes |
| Granularity | Coarse (per role) | Fine (per attribute) |
| Context-Aware | No | Yes |
| Complexity | Simple to implement | More complex but flexible |
| Best For | Simple access models | Complex, dynamic rules |

        
        > [!NOTE]
> **Hybrid Approach**

    
        
            Policy Example
            
                
                    json
                    
                
                
```
{
  "name": "Department Document Access",
  "effect": "allow",
  "conditions": {
    "all": [
      {
        "attribute": "subject.department",
        "operator": "equals",
        "value": "resource.department"
      },
      {
        "attribute": "action",
        "operator": "in",
        "value": ["read", "edit"]
      }
    ]
  }
}
```

            
        
    

    
    

    
        ## Getting Started

        
        
1. **Define Attributes** - Identify what attributes your policies will use
2. **Create Policies** - Write rules using the policy language
3. **Integrate Check API** - Call the ABAC check endpoint from your app
4. **Test & Iterate** - Validate policies work as expected
