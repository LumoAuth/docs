# Tenant Settings

                
Configure tenant-wide authentication and security settings.

            
        

        
Tenant settings control the behavior of authentication, security policies, and branding across
            your entire tenant. These settings apply to all users and applications within the tenant.

    
    
        
            Get Settings
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/settings \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        ## The Tenant Settings Object

        
        
            Authentication Settings
            
                
                    passwordPolicy
                    
                        object
                        Password requirements configuration
                    
                
                
                    mfaPolicy
                    
                        object
                        Multi-factor authentication settings
                    
                
                
                    sessionPolicy
                    
                        object
                        Session timeout and management settings
                    
                
                
                    loginPolicy
                    
                        object
                        Login attempt limits and lockout settings
                    
                
            
        
        
        
            Branding Settings
            
                
                    displayName
                    
                        string
                        Tenant display name
                    
                
                
                    logoUrl
                    
                        string | null
                        URL to tenant logo
                    
                
                
                    primaryColor
                    
                        string
                        Primary brand color (hex)
                    
                
                
                    supportEmail
                    
                        string | null
                        Support contact email
                    
                
            
        
    
    
        
            Settings Response
            
                
                    json
                    
                
                
```
{
  "passwordPolicy": {
    "minLength": 12,
    "requireUppercase": true,
    "requireNumbers": true,
    "requireSymbols": true,
    "preventReuse": 5
  },
  "mfaPolicy": {
    "required": false,
    "allowedMethods": ["totp", "webauthn"],
    "gracePeriodDays": 7
  },
  "sessionPolicy": {
    "maxAge": 86400,
    "idleTimeout": 3600,
    "singleSession": false
  },
  "branding": {
    "displayName": "Acme Corp",
    "primaryColor": "#635bff"
  }
}
```

            
        
    

    
    

    
        ## Get Tenant Settings

        
            GET
            /t/\{tenant\}/api/v1/admin/settings
        
        
Returns all current tenant settings.

    
    

    
    

    
        ## Update Tenant Settings

        
            PUT
            /t/\{tenant\}/api/v1/admin/settings
        
        
Updates tenant settings. Only provided fields are updated.

        
        ### Password Policy

        
            
                
                    passwordPolicy.minLength
                    integer
                
                Minimum password length (default: 8)
            
            
                
                    passwordPolicy.requireUppercase
                    boolean
                
                Require uppercase letters
            
            
                
                    passwordPolicy.requireNumbers
                    boolean
                
                Require numeric characters
            
            
                
                    passwordPolicy.requireSymbols
                    boolean
                
                Require special characters
            
            
                
                    passwordPolicy.preventReuse
                    integer
                
                Number of previous passwords to check (0 to disable)
            
        
    
    
        
            Update Password Policy
            
                
                    bash
                    
                
                
```
curl -X PUT https://app.lumoauth.dev/t/acme-corp/api/v1/admin/settings \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "passwordPolicy": {
      "minLength": 14,
      "requireSymbols": true,
      "preventReuse": 10
    }
  }'
```

            
        
    

    
    

    
        ### MFA Policy

        
            
                
                    mfaPolicy.required
                    boolean
                
                Require MFA for all users
            
            
                
                    mfaPolicy.allowedMethods
                    array
                
                Allowed MFA methods: totp, sms, email, webauthn
            
            
                
                    mfaPolicy.gracePeriodDays
                    integer
                
                Days to set up MFA before enforcement (0 for immediate)
            
        
    
    
        
            Enable Required MFA
            
                
                    python
                    
                
                
```
import requests

# Require MFA for all users
response = requests.put(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/settings",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    json={
        "mfaPolicy": {
            "required": True,
            "gracePeriodDays": 14,  # Give users 2 weeks
            "allowedMethods": ["totp", "webauthn"]
        }
    }
)

print("MFA now required for all users")
```

            
        
    

    
    

    
        ### Session Policy

        
            
                
                    sessionPolicy.maxAge
                    integer
                
                Session lifetime in seconds
            
            
                
                    sessionPolicy.idleTimeout
                    integer
                
                Inactivity timeout in seconds
            
            
                
                    sessionPolicy.singleSession
                    boolean
                
                Allow only one active session per user
            
        
    
    

    
    

    
        ### Branding Settings

        
Customize the look and feel of your tenant's login pages and emails.

    
    
        
            Update Branding
            
                
                    json
                    
                
                
```
{
  "branding": {
    "displayName": "Acme Corporation",
    "logoUrl": "https://cdn.acme.com/logo.png",
    "primaryColor": "#0066cc",
    "supportEmail": "support@acme.com"
  }
}
```

            
        
    

    
    

    
        ## Get Tenant Info

        
            GET
            /t/\{tenant\}/api/v1/admin/info
        
        
Returns tenant metadata including plan, usage, and limits.
