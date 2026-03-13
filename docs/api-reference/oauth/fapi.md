# FAPI 2.0 Security Profile

                
Enterprise-grade security for financial and high-risk applications.

            
        

        
The [FAPI 2.0 Security Profile](https://openid.net/specs/fapi-2_0-security-profile.html)
            is the most secure OAuth 2.0 configuration, designed for financial services and other high-risk applications.
            LumoAuth supports FAPI 2.0 for clients that require the highest level of security.

        > [!WARNING]
> **Client Configuration Required**

    
        
            FAPI 2.0 Authorization Flow
            
                
                    text
                
                
```
1. Push authorization request (PAR)
POST /oauth/par → request_uri

2. Redirect user with minimal parameters
GET /oauth/authorize?client_id=...&request_uri=...

3. Exchange code with DPoP proof
POST /oauth/token + DPoP header → DPoP-bound tokens

4. Use tokens with DPoP proof on every request
GET /api/resource + Authorization: DPoP + DPoP header
```

            
        
    

    
    

    
        ## FAPI 2.0 Requirements

        
When FAPI 2.0 mode is enabled, the following requirements are enforced:

        
        
| Requirement | Description |
| --- | --- |
| **PAR Required** | Authorization requests must use Pushed Authorization Requests (RFC 9126) |
| **PKCE Required** | PKCE with S256 is mandatory for all authorization requests |
| **DPoP Support** | Sender-constrained tokens via DPoP (RFC 9449) are supported |
| **mTLS Support** | Mutual TLS certificate-bound tokens are supported |
| **Signed Requests** | Request objects can be signed JWTs for additional integrity |
| **Short Token Lifetime** | Access tokens have shorter lifetimes (typically 5-10 minutes) |

    
    

    
    

    
        ## DPoP (Demonstration of Proof-of-Possession)

        
[DPoP (RFC 9449)](https://www.rfc-editor.org/rfc/rfc9449) binds tokens to a specific client
            by requiring proof of possession of a private key. This prevents token theft and replay attacks.

        
        ### How DPoP Works

        
1. Generate a key pair on your client
2. Include a DPoP proof (signed JWT) with each request
3. Tokens are bound to your public key
4. Only your client can use the tokens

        
        ### DPoP Proof Header

        
            
                
                    DPoP
                    string
                
                JWT proving possession of the private key. Include in Authorization header.
            
        
        
        ### DPoP JWT Claims

        
            
                
                    jti
                    string
                
                Unique token identifier (prevents replay)
            
            
                
                    htm
                    string
                
                HTTP method (e.g., "POST")
            
            
                
                    htu
                    string
                
                HTTP URI of the request
            
            
                
                    iat
                    integer
                
                Issued at timestamp
            
        
    
    
        
            DPoP Proof JWT
            
                
                    json
                    
                
                
```
// Header
{
  "typ": "dpop+jwt",
  "alg": "ES256",
  "jwk": {
    "kty": "EC",
    "crv": "P-256",
    "x": "...",
    "y": "..."
  }
}

// Payload
{
  "jti": "unique-random-id",
  "htm": "POST",
  "htu": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token",
  "iat": 1706817600
}
```

            
        
    

    
    

    
        ## Token Request with DPoP

        
When requesting tokens with DPoP, include a fresh DPoP proof JWT in the request header.
            The token will be bound to your key pair.

    
    
        
            Token Request with DPoP
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "client_id:client_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "DPoP: eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0Iiwian..." \
  -d "grant_type=authorization_code" \
  -d "code=auth_code_here" \
  -d "redirect_uri=https://app.example.com/callback" \
  -d "code_verifier=pkce_verifier_here"
```

            
        
    

    
    

    
        ## Token Response with DPoP

        
When using DPoP, the token response includes:

        
        
            
                
                    token_type
                    string
                
                `DPoP` instead of `Bearer`
            
        
    
    
        
            DPoP Token Response
            
                
                    json
                    
                
                
```
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "DPoP",
  "expires_in": 300,
  "refresh_token": "...",
  "id_token": "..."
}
```

            
        
    

    
    

    
        ## Using DPoP-Bound Tokens

        
Every API request must include a fresh DPoP proof alongside the access token.
            The proof must match the HTTP method and URI of the request.

    
    
        
            Using DPoP-Bound Token
            
                
                    bash
                    
                
                
```
# Every API request must include a fresh DPoP proof
curl https://api.example.com/resource \
  -H "Authorization: DPoP eyJhbGciOiJSUzI1NiIs..." \
  -H "DPoP: eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0Ii..."
```

            
        
    

    
    

    
        ## mTLS (Mutual TLS)

        
Mutual TLS provides another method for sender-constrained tokens. The access token is bound
            to the client's TLS certificate, ensuring only that client can use it.

        
        > [!NOTE]
> **Certificate Requirements**
