# Pagination

        
All list endpoints in the LumoAuth API return paginated results. This ensures consistent performance
            even when working with large datasets.

    
    
        
            Basic Pagination Request
            
                
                    bash
                    
                
                
```
curl "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users?page=2&limit=10" \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Query Parameters

            
Control pagination using these query parameters:

            
            
                
                    
                        page
                        integer
                        optional
                    
                    
                        Page number to retrieve. 1-indexed (first page is 1, not 0).

                        **Default:** `1`
                    
                
                
                    
                        limit
                        integer
                        optional
                    
                    
                        Number of items to return per page.

                        **Default:** `25`

                        **Maximum:** `100`
                    
                
            
        
    
    
    

    
    

    
        
            ## Response Format

            
Paginated responses include a `meta` object with pagination information:

            
            
                
                    
                        data
                        array
                    
                    Array of resources for the current page
                
                
                    
                        meta.total
                        integer
                    
                    Total number of resources matching the query
                
                
                    
                        meta.page
                        integer
                    
                    Current page number
                
                
                    
                        meta.limit
                        integer
                    
                    Items per page
                
                
                    
                        meta.totalPages
                        integer
                    
                    Total number of pages
                
                
                    
                        meta.hasNextPage
                        boolean
                    
                    `true` if there are more pages after this one
                
                
                    
                        meta.hasPreviousPage
                        boolean
                    
                    `true` if there are pages before this one
                
            
        
    
    
        
            Paginated Response
            
                
                    json
                    
                
                
```
{
  "data": [
    {
      "id": "usr_01h9xk5...",
      "email": "user1@example.com",
      "name": "John Doe"
    },
    {
      "id": "usr_02j8yk6...",
      "email": "user2@example.com",
      "name": "Jane Smith"
    }
  ],
  "meta": {
    "total": 156,
    "page": 2,
    "limit": 10,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

            
        
    

    
    

    
        
            ## Filtering & Sorting

            
Most list endpoints support additional parameters for filtering and sorting:

            
            ### Search

            
                
                    
                        search
                        string
                    
                    Full-text search across relevant fields (e.g., email, name)
                
            
            
            ### Sorting

            
                
                    
                        sortBy
                        string
                    
                    Field to sort by. Available fields depend on the endpoint.
                
                
                    
                        sortDir
                        string
                    
                    
                        Sort direction.

                        Values: `ASC` `DESC`
                    
                
            
            
            ### Resource-Specific Filters

            
Each endpoint may support additional filters. For example, the Users endpoint supports:

            
                
                    
                        role
                        string
                    
                    Filter by role slug
                
                
                    
                        group
                        string
                    
                    Filter by group slug
                
                
                    
                        blocked
                        boolean
                    
                    Filter by blocked status
                
            
            
            
See individual endpoint documentation for available filters.

        
    
    
        
            With Filtering & Sorting
            
                
                    bash
                    
                
                
```
curl "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users?\
search=john&\
role=admin&\
sortBy=createdAt&\
sortDir=DESC&\
page=1&\
limit=25" \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Best Practices

            
            > [!TIP]
> **Iterating Through All Results**
