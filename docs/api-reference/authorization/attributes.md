# ABAC Attributes

                
Define and manage attributes used in ABAC policies.

            
        

        
Attributes are the building blocks of ABAC policies. They describe properties of subjects (users),
            resources, and the environment. Well-defined attributes enable precise, flexible authorization rules.

    
    
        
            Attribute Definition
            
                
                    json
                    
                
                
```
{
  "id": "attr_dept_001",
  "name": "Department",
  "key": "department",
  "category": "subject",
  "dataType": "string",
  "description": "User's department",
  "allowedValues": [
    "engineering",
    "finance",
    "marketing",
    "operations",
    "hr"
  ]
}
```

            
        
    

    
    

    
        ## Attribute Categories

        
        
            
                
                ### Subject Attributes

                
Properties of the entity making the request: `role`, `department`, `clearance_level`, `location`

            
            
            
                
                ### Resource Attributes

                
Properties of the item being accessed: `owner`, `type`, `classification`, `status`

            
            
            
                
                ### Environment Attributes

                
Contextual factors: `time`, `ip_address`, `device_type`, `connection_type`

            
        
    
    
        
            Common Attributes
            
                
                    json
                    
                
                
```
// Subject attributes
{
  "department": "engineering",
  "role": "developer",
  "team": "platform",
  "clearance_level": 3,
  "is_contractor": false
}

// Resource attributes
{
  "owner_id": "user_456",
  "classification": "confidential",
  "department": "engineering",
  "status": "active"
}

// Environment attributes
{
  "ip_address": "203.0.113.45",
  "time": "2024-01-15T14:30:00Z",
  "day_of_week": "monday"
}
```

            
        
    

    
    

    
        ## The Attribute Definition Object

        
        
            Attributes
            
                
                    id
                    
                        string
                        Unique identifier for the attribute definition
                    
                
                
                    name
                    
                        string
                        Human-readable name
                    
                
                
                    key
                    
                        string
                        Attribute key used in policies (e.g., `subject.department`)
                    
                
                
                    category
                    
                        string
                        Either `subject`, `resource`, or `environment`
                    
                
                
                    dataType
                    
                        string
                        Data type: `string`, `number`, `boolean`, `array`, `datetime`
                    
                
                
                    description
                    
                        string
                        Explanation of the attribute's purpose
                    
                
                
                    allowedValues
                    
                        array | null
                        Enumerated list of allowed values (optional)
                    
                
            
        
    
    
        
            Using in Check
            
                
                    json
                    
                
                
```
// ABAC check with attributes
{
  "subject": {
    "id": "user_123",
    "attributes": {
      "department": "engineering",
      "clearance_level": 3
    }
  },
  "action": "read",
  "resource": {
    "type": "document",
    "attributes": {
      "classification": "internal",
      "department": "engineering"
    }
  }
}
```

            
        
    

    
    

    
        ## List Attribute Definitions

        
            GET
            /t/\{tenant\}/api/v1/admin/abac/attributes
        
        
Returns all attribute definitions for the tenant.

    
    
        
            List Attributes
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/abac/attributes \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        ## Create Attribute Definition

        
            POST
            /t/\{tenant\}/api/v1/admin/abac/attributes
        
        
Defines a new attribute for use in ABAC policies.

        
        ### Request Body

        
            
                
                    name
                    string
                    required
                
                Human-readable name
            
            
                
                    key
                    string
                    required
                
                Attribute key (e.g., `department`, `clearance_level`)
            
            
                
                    category
                    string
                    required
                
                One of: `subject`, `resource`, `environment`
            
            
                
                    dataType
                    string
                    required
                
                One of: `string`, `number`, `boolean`, `array`, `datetime`
            
            
                
                    allowedValues
                    array
                    optional
                
                Restrict values to this list (enum)
            
        
    
    
        
            Create Attribute
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/abac/attributes \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Clearance Level",
    "key": "clearance_level",
    "category": "subject",
    "dataType": "number",
    "description": "Security clearance level 1-5"
  }'
```

            
        
    

    
    

    
        ## Update Attribute Definition

        
            PUT
            /t/\{tenant\}/api/v1/admin/abac/attributes/\{attribute_id\}
        

        ## Delete Attribute Definition

        
            DELETE
            /t/\{tenant\}/api/v1/admin/abac/attributes/\{attribute_id\}
        
        
        > [!WARNING]
> **Policies Using This Attribute**

    
        
            Set User Attributes
            
                
                    python
                    
                
                
```
import requests

# Set custom attributes on a user
response = requests.put(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/123/attributes",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    json={
        "department": "engineering",
        "clearance_level": 3,
        "office_location": "NYC",
        "team": "platform"
    }
)
```

            
        
    

    
    

    
        ## Setting User Attributes

        
Subject attributes can be set on user profiles using the Users API.

        
            PUT
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}/attributes
        

        ## Best Practices

        
        
- **Keep attributes simple** - Use clear, meaningful names
- **Define allowed values** - Prevent typos and ensure consistency
- **Document attributes** - Help policy authors understand their purpose
- **Use consistent naming** - Follow a convention like `snake_case`
