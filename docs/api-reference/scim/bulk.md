# SCIM Bulk Operations

                
Perform multiple SCIM operations in a single request.

            
        

        
The Bulk endpoint allows you to create, update, or delete multiple resources in a single HTTP request.
            This is more efficient than making individual requests, especially during initial provisioning or
            when processing large batches of changes.

    
    
        
            Bulk Response
            
                
                    json
                    
                
                
```
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:BulkResponse"],
  "Operations": [
    {
      "method": "POST",
      "bulkId": "user1",
      "status": "201",
      "location": "https://app.lumoauth.dev/.../Users/abc123",
      "response": {
        "id": "abc123",
        "userName": "alice@example.com"
      }
    },
    {
      "method": "POST",
      "bulkId": "user2",
      "status": "201",
      "location": "https://app.lumoauth.dev/.../Users/def456"
    }
  ]
}
```

            
        
    

    
    

    
        ## Bulk Request

        
            POST
            /scim/v2/Bulk
        
        
        ### Request Body

        
            
                
                    schemas
                    array
                    required
                
                `["urn:ietf:params:scim:api:messages:2.0:BulkRequest"]`
            
            
                
                    Operations
                    array
                    required
                
                Array of operations to perform
            
            
                
                    failOnErrors
                    integer
                    optional
                
                Number of errors before aborting (default: all operations attempted)
            
        
    
    
        
            Bulk Create Users
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Bulk \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:BulkRequest"],
    "Operations": [
      {
        "method": "POST",
        "path": "/Users",
        "bulkId": "user1",
        "data": {
          "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
          "userName": "alice@example.com",
          "name": { "givenName": "Alice", "familyName": "Smith" },
          "emails": [{ "value": "alice@example.com", "primary": true }]
        }
      },
      {
        "method": "POST",
        "path": "/Users",
        "bulkId": "user2",
        "data": {
          "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
          "userName": "bob@example.com",
          "name": { "givenName": "Bob", "familyName": "Jones" },
          "emails": [{ "value": "bob@example.com", "primary": true }]
        }
      }
    ]
  }'
```

            
        
    

    
    

    
        ## Operation Object

        
Each operation in the array specifies what to do:

        
        
            
                
                    method
                    string
                    required
                
                HTTP method: `POST`, `PUT`, `PATCH`, or `DELETE`
            
            
                
                    path
                    string
                    required
                
                Resource path (e.g., `/Users` or `/Users/user-id`)
            
            
                
                    bulkId
                    string
                    optional
                
                Client-defined ID to track this operation in the response
            
            
                
                    data
                    object
                    conditional
                
                Resource data for POST, PUT, and PATCH operations
            
        
    
    
        
            Mixed Operations
            
                
                    json
                    
                
                
```
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:BulkRequest"],
  "failOnErrors": 5,
  "Operations": [
    {
      "method": "POST",
      "path": "/Users",
      "bulkId": "new-user",
      "data": {  }
    },
    {
      "method": "PATCH",
      "path": "/Users/existing-id",
      "data": {  }
    },
    {
      "method": "DELETE",
      "path": "/Users/old-user-id"
    },
    {
      "method": "POST",
      "path": "/Groups",
      "data": {  }
    }
  ]
}
```

            
        
    

    
    

    
        ## Bulk Response

        
The response contains results for each operation:

        
        
            Operation Result
            
                
                    method
                    
                        string
                        The HTTP method that was performed
                    
                
                
                    bulkId
                    
                        string
                        Your client-defined ID (if provided)
                    
                
                
                    status
                    
                        string
                        HTTP status code (e.g., "201", "200", "400")
                    
                
                
                    location
                    
                        string
                        URL of created/updated resource
                    
                
                
                    response
                    
                        object
                        Created/updated resource or error details
                    
                
            
        
    
    
        
            Bulk Deactivate Users
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/scim/v2/Bulk \
  -H "Authorization: Bearer scim_token" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:BulkRequest"],
    "Operations": [
      {
        "method": "PATCH",
        "path": "/Users/abc123",
        "data": {
          "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
          "Operations": [
            { "op": "replace", "path": "active", "value": false }
          ]
        }
      },
      {
        "method": "PATCH",
        "path": "/Users/def456",
        "data": {
          "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
          "Operations": [
            { "op": "replace", "path": "active", "value": false }
          ]
        }
      }
    ]
  }'
```

            
        
    

    
    

    
        ## Limits

        
| Limit | Value |
| --- | --- |
| Maximum operations per request | 1,000 |
| Maximum payload size | 1 MB |

        > [!WARNING]
> **Transaction Behavior**
