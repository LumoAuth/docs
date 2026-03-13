# Authorization Check

                
Evaluate access decisions using ABAC policies.

            
        

        
The ABAC Check endpoint is the heart of LumoAuth's authorization system. Call this endpoint
            to determine if a subject (user, service, or agent) is allowed to perform an action on a resource.
            The decision considers all applicable policies and their conditions.

    
    
        
            Basic Check
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/api/v1/abac/check \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": {"id": "user_123"},
    "action": "read",
    "resource": {"type": "document", "id": "doc_456"}
  }'
```

            
        
    

    
    

    
        ## Check Authorization

        
            POST
            /api/v1/abac/check
        
        
Evaluates whether the subject is authorized to perform the action on the resource.

        
        ### Request Body

        
            
                
                    subject
                    object
                    required
                
                The entity requesting access
                
                    
                        
                            subject.id
                            string
                            required
                        
                        Unique identifier for the subject (user ID, service ID)
                    
                    
                        
                            subject.type
                            string
                            optional
                        
                        Subject type: `user`, `service`, or `agent`
                    
                    
                        
                            subject.attributes
                            object
                            optional
                        
                        Key-value pairs of subject attributes (role, department, etc.)
                    
                
            
            
            
                
                    action
                    string
                    required
                
                The action being performed (e.g., `read`, `write`, `delete`, `approve`)
            
            
            
                
                    resource
                    object
                    required
                
                The resource being accessed
                
                    
                        
                            resource.type
                            string
                            required
                        
                        Type of resource (e.g., `document`, `order`, `project`)
                    
                    
                        
                            resource.id
                            string
                            optional
                        
                        Unique identifier for the specific resource
                    
                    
                        
                            resource.attributes
                            object
                            optional
                        
                        Key-value pairs of resource attributes (owner, status, etc.)
                    
                
            
            
            
                
                    environment
                    object
                    optional
                
                Environmental context for the request
                
                    
                        
                            environment.ip
                            string
                            optional
                        
                        IP address of the request origin
                    
                    
                        
                            environment.time
                            string (ISO 8601)
                            optional
                        
                        Timestamp for time-based policies (defaults to now)
                    
                
            
            
            
                
                    context
                    object
                    optional
                
                Additional context for policy evaluation
            
        
    
    
        
            Check with Attributes
            
                
                    python
                    
                
                
```
import requests

response = requests.post(
    "https://app.lumoauth.dev/api/v1/abac/check",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    json={
        "subject": {
            "id": "user_123",
            "attributes": {
                "department": "engineering",
                "clearance_level": 3
            }
        },
        "action": "approve",
        "resource": {
            "type": "expense",
            "id": "exp_789",
            "attributes": {
                "amount": 5000,
                "currency": "USD"
            }
        }
    }
)

result = response.json()
if result["decision"] == "allow":
    print("Access granted!")
else:
    print(f"Access denied: {result['reason']}")
```

            
        
    

    
    

    
        ## Response

        
        
            Response Attributes
            
                
                    decision
                    
                        string
                        Either `allow` or `deny`
                    
                
                
                    reason
                    
                        string
                        Human-readable explanation of the decision
                    
                
                
                    policies
                    
                        array
                        Policies that influenced the decision
                    
                
                
                    evaluationTime
                    
                        number
                        Time taken to evaluate in milliseconds
                    
                
            
        
    
    
        
            Allow Response
            
                
                    json
                    
                
                
```
{
  "decision": "allow",
  "reason": "Policy 'expense_approval' granted access",
  "policies": [
    {
      "id": "pol_exp_001",
      "name": "Expense Approval Under 10K",
      "effect": "allow"
    }
  ],
  "evaluationTime": 12
}
```

            
        
        
            Deny Response
            
                
                    json
                    
                
                
```
{
  "decision": "deny",
  "reason": "No matching policy found for action",
  "policies": [],
  "evaluationTime": 8
}
```

            
        
    

    
    

    
        ## Batch Check

        
            POST
            /api/v1/abac/check/batch
        
        
Check multiple authorization requests in a single call. Useful for UI permission rendering.

        
        ### Request Body

        
            
                
                    checks
                    array
                    required
                
                Array of check requests (same format as single check)
            
        
    
    
        
            Batch Check
            
                
                    javascript
                    
                
                
```
// Check multiple permissions for UI rendering
const response = await fetch(
  'https://app.lumoauth.dev/api/v1/abac/check/batch',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_xxxxx',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      checks: [
        {subject: {id: 'user_123'}, action: 'edit', resource: {type: 'doc'}},
        {subject: {id: 'user_123'}, action: 'delete', resource: {type: 'doc'}},
        {subject: {id: 'user_123'}, action: 'share', resource: {type: 'doc'}}
      ]
    })
  }
);

const {results} = await response.json();
// results = [{decision: 'allow'}, {decision: 'deny'}, ...]
```

            
        
    

    
    

    
        ## Decision Logic

        
LumoAuth evaluates policies in the following order:

        
        
1. **Deny Overrides** - If any policy explicitly denies, the result is deny
2. **Allow Required** - At least one policy must explicitly allow
3. **Default Deny** - If no policies match, the result is deny

        
        > [!WARNING]
> **Implicit Deny**

    
        
    

    
    

    
        ## Best Practices

        
        
- **Cache decisions carefully** - Policies can change; consider short TTLs
- **Include relevant attributes** - More context enables better decisions
- **Use batch checks** - Reduce latency by batching UI permission checks
- **Log denials** - Track denied requests for security auditing
