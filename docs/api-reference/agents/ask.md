# Agent Ask

                
Natural language permission queries for AI agents.

            
        

        
The Agent Ask endpoint allows AI agents to query permissions using **natural language**
            instead of structured API calls. This is perfect for AI assistants that need to understand
            what actions they can take on behalf of users.

        > [!NOTE]
> **AI-First Design**

    
        
            Ask Permission
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/agents/ask \
  -H "Authorization: Bearer agent_token" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Can I read the user'\''s calendar events?",
    "context": {
      "resource_type": "calendar",
      "action": "read"
    }
  }'
```

            
        
    

    
    

    
        ## Ask Permission

        
            POST
            /t/\{tenant\}/api/v1/agents/ask
        
        
        
Ask a natural language question about permissions.

        
        ### Request Body

        
            
                
                    question
                    string
                    required
                
                Natural language permission question (e.g., "Can I read the user's calendar?")
            
            
                
                    context
                    object
                    optional
                
                Additional context about the request (resource IDs, user info, etc.)
            
        
        
        ### Response

        
            Ask Result
            
                
                    allowed
                    
                        boolean
                        Whether the action is permitted
                    
                
                
                    explanation
                    
                        string
                        Human-readable explanation of the decision
                    
                
                
                    confidence
                    
                        float
                        Confidence score from 0.0 to 1.0
                    
                
                
                    required_scopes
                    
                        array
                        Scopes that would be needed for this action
                    
                
            
        
    
    
        
            Allowed Response
            
                
                    json
                    
                
                
```
{
  "allowed": true,
  "explanation": "You have the calendar:read scope which permits reading calendar events.",
  "confidence": 0.95,
  "required_scopes": ["calendar:read"]
}
```

            
        

        
            Denied Response
            
                
                    json
                    
                
                
```
{
  "allowed": false,
  "explanation": "Missing payment:read scope for payment access.",
  "confidence": 0.98,
  "required_scopes": ["payment:read"]
}
```

            
        
    

    
    

    
        ## Example Questions

        
| Question | What It Checks |
| --- | --- |
| "Can I send an email on behalf of the user?" | email:send scope and delegation permissions |
| "Am I allowed to read their calendar events?" | calendar:read scope |
| "Can I create a new document in the shared folder?" | documents:write scope + folder permissions |
| "Is it okay to access the user's payment methods?" | payment:read scope (likely denied) |

        > [!WARNING]
> **Low Confidence Responses**

    
        
            Python Integration
            
                
                    python
                    
                
                
```
import requests

class AgentPermissions:
    def __init__(self, token, tenant):
        self.token = token
        self.base_url = f"https://app.lumoauth.dev/t/{tenant}"
    
    def can_i(self, question, context=None):
        """Ask a natural language permission question."""
        response = requests.post(
            f"{self.base_url}/agents/ask",
            headers={"Authorization": f"Bearer {self.token}"},
            json={"question": question, "context": context or {}}
        )
        result = response.json()
        
        if result["confidence"] 0.8:
            print(f"Warning: Low confidence ({result['confidence']})")
        
        return result["allowed"]

# Usage in an AI agent
agent = AgentPermissions(token, "acme-corp")

if agent.can_i("Can I schedule a meeting for the user?"):
    # Proceed with scheduling
    schedule_meeting()
else:
    # Ask user for permission
    request_calendar_access()
```

            
        
    

    
    

    
        ## Agent Identity

        
            GET
            /t/\{tenant\}/api/v1/agents/me
        
        
        
Get information about the currently authenticated agent.

        
        
            Agent Info
            
                
                    agent_id
                    
                        string
                        Unique identifier for this agent
                    
                
                
                    name
                    
                        string
                        Human-readable agent name
                    
                
                
                    scopes
                    
                        array
                        Granted scopes for this session
                    
                
                
                    delegated_by
                    
                        string
                        User ID who delegated permissions (if applicable)
                    
                
            
        
    
    
        
            Get Agent Identity
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/agents/me \
  -H "Authorization: Bearer agent_token"
```

            
        

        
            Agent Identity Response
            
                
                    json
                    
                
                
```
{
  "agent_id": "agent_scheduling_assistant",
  "name": "Scheduling Assistant",
  "scopes": [
    "calendar:read",
    "calendar:write",
    "contacts:read"
  ],
  "delegated_by": "user_abc123",
  "expires_at": "2025-02-01T12:00:00Z"
}
```
