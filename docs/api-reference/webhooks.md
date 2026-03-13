# Webhooks

                
Receive real-time notifications when events occur.

            
        

        
Webhooks let your application receive real-time HTTP notifications when events happen in LumoAuth.
            Instead of polling the API, webhooks push data to your endpoint as events occur. This is ideal
            for syncing data, triggering workflows, or keeping external systems up to date.

    
    
        
            Webhook Payload
            
                
                    json
                    
                
                
```
{
  "id": "evt_abc123xyz",
  "type": "user.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "user": {
      "id": 456,
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
}
```

            
        
    

    
    

    
        ## Available Events

        
        
| Event | Description |
| --- | --- |
| `user.created` | A new user was created |
| `user.updated` | User profile was updated |
| `user.deleted` | User was deleted |
| `user.blocked` | User was blocked |
| `user.login` | User logged in successfully |
| `user.login_failed` | Login attempt failed |
| `user.mfa_enabled` | User enabled MFA |
| `user.password_changed` | User changed their password |
| `role.created` | New role was created |
| `role.updated` | Role was updated |
| `token.issued` | Access token was issued |
| `token.revoked` | Token was revoked |

    
    

    
    

    
        ## The Webhook Object

        
        
            Attributes
            
                
                    id
                    
                        string
                        Unique identifier for the webhook
                    
                
                
                    url
                    
                        string
                        HTTPS endpoint to receive events
                    
                
                
                    events
                    
                        array of strings
                        Events this webhook subscribes to
                    
                
                
                    secret
                    
                        string
                        Secret for verifying webhook signatures (only shown once)
                    
                
                
                    isActive
                    
                        boolean
                        Whether the webhook is enabled
                    
                
                
                    failureCount
                    
                        integer
                        Consecutive delivery failures
                    
                
                
                    lastDeliveredAt
                    
                        string (ISO 8601) | null
                        Last successful delivery timestamp
                    
                
            
        
    
    

    
    

    
        ## List Webhooks

        
            GET
            /t/\{tenant\}/api/v1/admin/webhooks
        
    
    

    
    

    
        ## Create Webhook

        
            POST
            /t/\{tenant\}/api/v1/admin/webhooks
        
        
        ### Request Body

        
            
                
                    url
                    string
                    required
                
                HTTPS endpoint URL
            
            
                
                    events
                    array of strings
                    required
                
                Events to subscribe to (use `*` for all)
            
            
                
                    description
                    string
                    optional
                
                Description of the webhook purpose
            
        
    
    
        
            Create Webhook
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/webhooks \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://app.example.com/webhooks/lumoauth",
    "events": ["user.created", "user.updated", "user.deleted"]
  }'
```

            
        
    

    
    

    
        ## Webhook Payload

        
Each webhook delivery includes:

        
        
            Payload Attributes
            
                
                    id
                    
                        string
                        Unique event ID for deduplication
                    
                
                
                    type
                    
                        string
                        Event type (e.g., `user.created`)
                    
                
                
                    timestamp
                    
                        string (ISO 8601)
                        When the event occurred
                    
                
                
                    data
                    
                        object
                        Event-specific data
                    
                
            
        
    
    

    
    

    
        ## Verifying Signatures

        
All webhook requests include a `X-Lumo-Signature` header containing an HMAC-SHA256
            signature of the payload. Always verify this signature to ensure the webhook is authentic.

        
        > [!WARNING]
> **Security**

    
        
            Verify Signature (Python)
            
                
                    python
                    
                
                
```
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    """Verify LumoAuth webhook signature"""
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)

# In your webhook handler
from flask import request

@app.route('/webhooks/lumoauth', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Lumo-Signature')
    
    if not verify_webhook(request.data.decode(), signature, WEBHOOK_SECRET):
        return 'Invalid signature', 401
    
    event = request.json
    if event['type'] == 'user.created':
        sync_user(event['data']['user'])
    
    return 'OK', 200
```

            
        

        
            Verify Signature (Node.js)
            
                
                    javascript
                    
                
                
```
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Express handler
app.post('/webhooks/lumoauth', (req, res) => {
  const signature = req.headers['x-lumo-signature'];
  
  if (!verifyWebhook(req.rawBody, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid');
  }
  
  const event = req.body;
  console.log(`Event: ${event.type}`);
  res.status(200).send('OK');
});
```

            
        
    

    
    

    
        ## Test Webhook

        
            POST
            /t/\{tenant\}/api/v1/admin/webhooks/\{webhook_id\}/test
        
        
Sends a test event to verify your endpoint is working correctly.

    
    

    
    

    
        ## Delete Webhook

        
            DELETE
            /t/\{tenant\}/api/v1/admin/webhooks/\{webhook_id\}
