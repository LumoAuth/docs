# AI Agents

                
Manage machine identities for AI agents, bots, and automated services.

            
        

        
AI Agents represent non-human identities that interact with your system. Unlike OAuth clients (which
            act on behalf of users), agents are autonomous entities with their own permissions and audit trails.
            Use agents for AI assistants, automation bots, background workers, and service accounts.

        ## Why Agents?

        
        > [!NOTE]
> **Machine Identity vs OAuth Clients**

    

    
    

    
        ## The Agent Object

        
        
            Attributes
            
                
                    id
                    
                        string (UUID)
                        Unique identifier for the agent
                    
                
                
                    name
                    
                        string
                        Human-readable name for the agent
                    
                
                
                    description
                    
                        string | null
                        Description of the agent's purpose
                    
                
                
                    type
                    
                        string
                        Agent type: `ai_assistant`, `service`, `bot`, `integration`
                    
                
                
                    apiKey
                    
                        string
                        API key for authentication (only shown on creation)
                    
                
                
                    roles
                    
                        array
                        Roles assigned to this agent
                    
                
                
                    permissions
                    
                        array
                        Direct permissions assigned to this agent
                    
                
                
                    isActive
                    
                        boolean
                        Whether the agent is enabled
                    
                
                
                    allowedIps
                    
                        array | null
                        IP whitelist for additional security
                    
                
                
                    lastUsedAt
                    
                        string (ISO 8601) | null
                        When the agent last made an API call
                    
                
            
        
    
    
        
            Using Agent API Key
            
                
                    python
                    
                
                
```
import requests

# Agent authenticates with its API key
response = requests.get(
    "https://app.lumoauth.dev/api/v1/some-endpoint",
    headers={
        "Authorization": "Bearer sk_agent_live_xxxx"
    }
)
```

            
        
    

    
    

    
        ## List Agents

        
            GET
            /t/\{tenant\}/api/v1/admin/agents
        
        
Returns all agents in the tenant.

    
    

    
    

    
        ## Create Agent

        
            POST
            /t/\{tenant\}/api/v1/admin/agents
        
        
Creates a new agent and returns its API key.

        
        ### Request Body

        
            
                
                    name
                    string
                    required
                
                Descriptive name for the agent
            
            
                
                    type
                    string
                    optional
                
                Agent type (default: `service`)
            
            
                
                    roles
                    array of strings
                    optional
                
                Role slugs to assign
            
            
                
                    allowedIps
                    array of strings
                    optional
                
                Restrict access to specific IP addresses
            
        
        
        > [!WARNING]
> **Store the API Key Securely**

    
        
            Create Agent
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/agents \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Assistant",
    "type": "ai_assistant",
    "description": "Customer support AI",
    "roles": ["support-agent"]
  }'
```

            
        

        
            Creation Response
            
                
                    json
                    
                
                
```
{
  "id": "agt_new123",
  "name": "AI Assistant",
  "apiKey": "sk_agent_live_xxxxxxxxxxxx",
  // ⚠️ Store this securely!
  ...
}
```

            
        
    

    
    

    
        ## Retrieve Agent

        
            GET
            /t/\{tenant\}/api/v1/admin/agents/\{agent_id\}
        
    
    

    
    

    
        ## Update Agent

        
            PUT
            /t/\{tenant\}/api/v1/admin/agents/\{agent_id\}
        
    
    

    
    

    
        ## Rotate API Key

        
            POST
            /t/\{tenant\}/api/v1/admin/agents/\{agent_id\}/rotate-key
        
        
Generates a new API key. The old key is immediately invalidated.

    
    
        
            Rotate API Key
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/agents/agt_abc123/rotate-key \
  -H "Authorization: Bearer sk_live_xxxxx"

# Response includes new key
```

            
        
    

    
    

    
        ## Delete Agent

        
            DELETE
            /t/\{tenant\}/api/v1/admin/agents/\{agent_id\}
