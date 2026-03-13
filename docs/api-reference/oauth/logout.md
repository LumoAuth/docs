# Logout

        
LumoAuth supports multiple logout mechanisms per the OpenID Connect specification family:
            [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html),
            [Front-Channel Logout 1.0](https://openid.net/specs/openid-connect-frontchannel-1_0.html), and
            [Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html).

        
        > [!NOTE]
> **Discovery Support**

    
        
            RP-Initiated Logout
            
                
                    bash
                    
                
                
```
# Redirect user to logout endpoint
GET https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/logout
    ?id_token_hint=eyJhbGciOi...
    &post_logout_redirect_uri=https://app.example.com/logged-out
    &state=abc123
```

            
        
    

    
    

    
        ## End Session Endpoint (RP-Initiated Logout)

        
            GET
            /t/\{tenant\}/api/v1/oauth/logout
        
        
        
Initiates logout from the OpenID Provider. The OP will clear the user's session and optionally notify Relying Parties via front-channel or back-channel logout.

        ### Query Parameters

        
            
                
                    id_token_hint
                    string
                    recommended
                
                ID token previously issued to the client. Used to identify the user session and validate the `post_logout_redirect_uri`.
            
            
                
                    post_logout_redirect_uri
                    string
                    optional
                
                URI to redirect after logout. Must be registered in the client's `post_logout_redirect_uris`. Requires `id_token_hint` to identify the client.
            
            
                
                    state
                    string
                    optional
                
                Opaque value echoed back in the redirect. Use for CSRF protection.
            
        
    
    
        
            Logout Flow
            
                
                    sequence
                
                
```
# 1. RP redirects user to OP logout
User → OP: GET /oauth/logout
            ?id_token_hint=...
            &post_logout_redirect_uri=...

# 2. OP renders page with front-channel iframes
OP → User: HTML with iframes to RP logout URIs

# 3. OP clears session and redirects
OP → User: 302 → post_logout_redirect_uri
```

            
        
    

    
    

    
        ## Front-Channel Logout

        
        
Front-channel logout uses HTTP GETs to RP URLs via hidden iframes to clear login state.
            When a user logs out at the OP, the OP renders a page containing iframes for each RP's
            registered `frontchannel_logout_uri`.

        ### Client Registration

        
Register these parameters during [dynamic client registration](/api-reference/oauth/register):

        
        
            
                
                    frontchannel_logout_uri
                    string
                
                RP URL that will cause the RP to log itself out when rendered in an iframe. Domain, port, and scheme must match a registered `redirect_uri`.
            
            
                
                    frontchannel_logout_session_required
                    boolean
                
                If `true`, the OP includes `iss` and `sid` query parameters. Default: `false`
            
        

        ### Query Parameters Sent to RP

        
When rendering the front-channel logout URI, the OP may include:

        
        
            
                
                    iss
                    string
                
                Issuer Identifier for the OP. Allows RP to verify the request came from the expected OP.
            
            
                
                    sid
                    string
                
                Session ID. Matches the `sid` claim in the ID token. Allows RP to identify which session to terminate.
            
        
        
        > [!WARNING]
> **Third-Party Cookie Blocking**

    
        
            Front-Channel Logout URI with Session
            
                
                    url
                    
                
                
```
# OP renders this in an iframe:
https://app.example.com/frontchannel-logout
    ?iss=https%3A%2F%2Fapp.lumoauth.dev%2Ft%2Facme-corp%2Fapi%2Fv1
    &sid=08a5019c-17e1-4977-8f42-65a12843ea02
```

            
        

        
            RP Logout Handler (Node.js)
            
                
                    javascript
                    
                
                
```
// Express.js front-channel logout handler
app.get('/frontchannel-logout', (req, res) => {
  const { iss, sid } = req.query;
  
  // Validate issuer matches expected OP
  if (iss && iss !== expectedIssuer) {
    return res.status(400).send();
  }
  
  // Clear session matching sid (or all if no sid)
  if (sid) {
    sessionStore.destroyBySid(sid);
  } else {
    sessionStore.destroyAll();
  }
  
  // Return no-store to prevent caching
  res.set('Cache-Control', 'no-store');
  res.status(200).send();
});
```

            
        
    

    
    

    
        ## Session ID (sid) Claim

        
        
When `frontchannel_logout_session_supported` is `true`, the OP includes
            the `sid` (Session ID) claim in ID tokens. This identifier uniquely identifies the
            user's session and is used for logout coordination.

        
        
            sid Claim
            
                
                    sid
                    
                        string
                        String identifier for the Session. Unique per issuer. Opaque to the RP.
                    
                
            
        

        
The RP should:

        
- Store the `sid` from the ID token alongside the local session
- On front-channel logout, match the `sid` parameter to find sessions to terminate
- Clear cookies and local storage for the matched session

    
    
        
            ID Token with sid Claim
            
                
                    json
                    
                
                
```
{
  "iss": "https://app.lumoauth.dev/t/acme-corp",
  "sub": "12345",
  "aud": "client_a1b2c3",
  "exp": 1706904000,
  "iat": 1706817600,
  "auth_time": 1706817600,
  "sid": "08a5019c-17e1-4977-8f42-65a12843ea02",
  "nonce": "n-0S6_WzA2Mj"
}
```

            
        
    

    
    

    
        ## Discovery Metadata

        
        
The OpenID Provider discovery document advertises logout capabilities:

        
        
            
                
                    end_session_endpoint
                    string
                
                URL for RP-Initiated Logout
            
            
                
                    frontchannel_logout_supported
                    boolean
                
                Whether front-channel logout is supported
            
            
                
                    frontchannel_logout_session_supported
                    boolean
                
                Whether the OP can include `iss` and `sid` in front-channel logout
            
            
                
                    backchannel_logout_supported
                    boolean
                
                Whether back-channel logout is supported
            
            
                
                    backchannel_logout_session_supported
                    boolean
                
                Whether the OP can include `sid` in back-channel logout token
            
        
    
    
        
            Discovery Response
            
                
                    json
                    
                
                
```
{
  "issuer": "https://app.lumoauth.dev/t/acme-corp",
  "end_session_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/logout",
  "frontchannel_logout_supported": true,
  "frontchannel_logout_session_supported": true,
  "backchannel_logout_supported": true,
  "backchannel_logout_session_supported": true,
  ...
}
```

            
        
    

    
    

    
        ## Back-Channel Logout

        
        
Back-channel logout uses direct server-to-server HTTP POST requests to notify RPs of logout events.
            Unlike front-channel logout which relies on browser iframes, back-channel logout is more reliable
            as it doesn't depend on the user's browser session being active.

        
        > [!NOTE]
> **When to Use Back-Channel Logout**

    
    
        
            Back-Channel Logout Registration
            
                
                    json
                    
                
                
```
{
  "redirect_uris": ["https://app.example.com/callback"],
  "backchannel_logout_uri": "https://app.example.com/api/logout",
  "backchannel_logout_session_required": true,
  "token_endpoint_auth_method": "client_secret_basic"
}
```

            
        
    

    
    

    
        ## Logout Token

        
        
The Logout Token is a signed JWT sent to the RP's `backchannel_logout_uri`.
            It identifies the user/session to be logged out and includes an event claim that
            distinguishes it from other JWTs.

        ### Token Claims

        
        
            
                
                    iss
                    string
                    required
                
                Issuer Identifier
            
            
                
                    aud
                    string
                    required
                
                Client ID (audience)
            
            
                
                    iat
                    number
                    required
                
                Issued at time (Unix timestamp)
            
            
                
                    exp
                    number
                    required
                
                Expiration time (recommended ≤ 2 minutes)
            
            
                
                    jti
                    string
                    required
                
                Unique token identifier (for replay prevention)
            
            
                
                    events
                    object
                    required
                
                Must contain `http://schemas.openid.net/event/backchannel-logout` key
            
            
                
                    sub
                    string
                    conditional
                
                Subject identifier. Required if `sid` is not present.
            
            
                
                    sid
                    string
                    conditional
                
                Session ID. Required if `sub` is not present, or if `backchannel_logout_session_required` is true.
            
        

        > [!WARNING]
> **Prohibited Claim**

    
        
            Logout Token Example
            
                
                    json
                    
                
                
```
// JWT Header
{
  "typ": "logout+jwt",
  "alg": "RS256",
  "kid": "lumo-rs256-key"
}

// JWT Payload
{
  "iss": "https://app.lumoauth.dev/t/acme-corp",
  "sub": "12345",
  "aud": "client_a1b2c3",
  "iat": 1706817600,
  "exp": 1706817720,
  "jti": "bWJq",
  "sid": "08a5019c-17e1-4977-8f42-65a12843ea02",
  "events": {
    "http://schemas.openid.net/event/backchannel-logout": {}
  }
}
```

            
        
    

    
    

    
        ## Back-Channel Logout Request

        
        
When logout occurs, the OP sends an HTTP POST to each registered `backchannel_logout_uri`
            with the Logout Token in the request body.

        ### Request Format

        
- Method: `POST`
- Content-Type: `application/x-www-form-urlencoded`
- Body parameter: `logout_token` containing the JWT

        ### RP Response

        
            
                
                    200 OK / 204 No Content
                
                Logout succeeded
            
            
                
                    400 Bad Request
                
                Invalid request or logout failed. Response body may contain `error` and `error_description`.
            
        
    
    
        
            Back-Channel Logout Request
            
                
                    http
                    
                
                
```
POST /api/logout HTTP/1.1
Host: app.example.com
Content-Type: application/x-www-form-urlencoded

logout_token=eyJhbGciOiJSUzI1NiIsInR5cCI6...
```

            
        

        
            RP Handler (Node.js)
            
                
                    javascript
                    
                
                
```
app.post('/api/logout', async (req, res) => {
  const { logout_token } = req.body;

    // Verify nonce is NOT present
    if (claims.nonce) {
      throw new Error('nonce must not be present');
    }
    
    // Find and invalidate sessions
    if (claims.sid) {
      await sessionStore.destroyBySid(claims.sid);
    } else if (claims.sub) {
      await sessionStore.destroyByUser(claims.sub);
    }
    
    res.set('Cache-Control', 'no-store');
    res.status(200).send();
  } catch (error) {
    res.status(400).json({
      error: 'invalid_request',
      error_description: error.message
    });
  }
});
```
