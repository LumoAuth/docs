# ABAC Policies

                
Define authorization rules using policy conditions.

            
        

        
Policies are the rules that govern access decisions. Each policy specifies conditions that must be
            met for access to be granted or denied. Policies are evaluated when the ABAC check endpoint is called.

    
    
        
            Simple Policy
            
                
                    json
                    
                
                
```
{
  "name": "Admins Can Delete",
  "effect": "allow",
  "target": {
    "actions": ["delete"]
  },
  "conditions": {
    "all": [
      {
        "attribute": "subject.role",
        "operator": "equals",
        "value": "admin"
      }
    ]
  }
}
```

            
        
    

    
    

    
        ## The Policy Object

        
        
            Attributes
            
                
                    id
                    
                        string
                        Unique identifier for the policy
                    
                
                
                    name
                    
                        string
                        Human-readable name for the policy
                    
                
                
                    description
                    
                        string | null
                        Detailed description of what the policy does
                    
                
                
                    effect
                    
                        string
                        Either `allow` or `deny`
                    
                
                
                    priority
                    
                        integer
                        Higher priority policies are evaluated first (0-1000)
                    
                
                
                    conditions
                    
                        object
                        Conditions that must be met for the policy to apply
                    
                
                
                    target
                    
                        object | null
                        Pre-filter for resource types and actions
                    
                
                
                    isActive
                    
                        boolean
                        Whether the policy is currently active
                    
                
            
        
    
    
        
            Owner-Based Access
            
                
                    json
                    
                
                
```
{
  "name": "Owners Can Edit",
  "effect": "allow",
  "target": {
    "resources": ["document"],
    "actions": ["edit", "delete"]
  },
  "conditions": {
    "all": [
      {
        "attribute": "subject.id",
        "operator": "equals",
        "value": "$resource.owner_id"
      }
    ]
  }
}
```

            
        
    

    
    

    
        ## Condition Operators

        
Use these operators to compare attribute values in conditions.

        
        
| Operator | Description | Example |
| --- | --- | --- |
| `equals` | Exact match | `subject.role equals "admin"` |
| `not_equals` | Not equal | `resource.status not_equals "archived"` |
| `in` | Value in array | `action in ["read", "write"]` |
| `not_in` | Value not in array | `subject.department not_in ["finance"]` |
| `contains` | Array contains value | `subject.roles contains "manager"` |
| `greater_than` | Numeric comparison | `subject.clearance greater_than 3` |
| `less_than` | Numeric comparison | `resource.amount less_than 10000` |
| `matches` | Regex pattern match | `resource.path matches "/api/v1/*"` |
| `exists` | Attribute is present | `subject.mfa_enabled exists true` |

    
    
        
            Complex Policy
            
                
                    json
                    
                
                
```
{
  "name": "Expense Approval Rules",
  "description": "Managers approve ,
  "effect": "allow",
  "target": {
    "resources": ["expense"],
    "actions": ["approve"]
  },
  "conditions": {
    "any": [
      {
        "all": [
          {"attribute": "subject.role", "operator": "equals", "value": "manager"},
          {"attribute": "resource.amount", "operator": "less_than", "value": 10000}
        ]
      },
      {
        "attribute": "subject.role",
        "operator": "equals",
        "value": "director"
      }
    ]
  }
}
```

            
        
    

    
    

    
        ## Condition Groups

        
Combine multiple conditions using logical operators.

        
        
            
                
                    all
                    array
                
                All conditions must be true (AND logic)
            
            
                
                    any
                    array
                
                At least one condition must be true (OR logic)
            
            
                
                    none
                    array
                
                No conditions can be true (NOT logic)
            
        
    
    
        
            Deny Policy
            
                
                    json
                    
                
                
```
{
  "name": "Block Archived Resources",
  "effect": "deny",
  "priority": 100,
  "conditions": {
    "all": [
      {
        "attribute": "resource.status",
        "operator": "equals",
        "value": "archived"
      }
    ],
    "none": [
      {
        "attribute": "subject.role",
        "operator": "equals",
        "value": "admin"
      }
    ]
  }
}
```

            
        
    

    
    

    
        ## List Policies

        
            GET
            /t/\{tenant\}/api/v1/admin/abac/policies
        
        
Returns all ABAC policies in the tenant.

    
    
        
    

    
    

    
        ## Create Policy

        
            POST
            /t/\{tenant\}/api/v1/admin/abac/policies
        
        
Creates a new ABAC policy.

        
        ### Request Body

        
            
                
                    name
                    string
                    required
                
                Descriptive name for the policy
            
            
                
                    effect
                    string
                    required
                
                Either `allow` or `deny`
            
            
                
                    conditions
                    object
                    required
                
                Condition groups (all, any, none) with condition rules
            
            
                
                    target
                    object
                    optional
                
                Filter by resource types and/or actions
            
        
    
    
        
            Create Policy
            
                
                    python
                    
                
                
```
import requests

policy = {
    "name": "Department Access",
    "effect": "allow",
    "conditions": {
        "all": [
            {
                "attribute": "subject.department",
                "operator": "equals",
                "value": "$resource.department"
            }
        ]
    }
}

response = requests.post(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/abac/policies",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    json=policy
)
print(response.json())
```

            
        
    

    
    

    
        ## Retrieve Policy

        
            GET
            /t/\{tenant\}/api/v1/admin/abac/policies/\{policy_id\}
        
        
        ## Update Policy

        
            PUT
            /t/\{tenant\}/api/v1/admin/abac/policies/\{policy_id\}
        
        
        ## Delete Policy

        
            DELETE
            /t/\{tenant\}/api/v1/admin/abac/policies/\{policy_id\}
        
    
    
        
    

    
    

    
        ## Test Policy

        
            POST
            /t/\{tenant\}/api/v1/admin/abac/policies/\{policy_id\}/test
        
        
Test a policy against sample input without affecting production decisions.
