# SAML Metadata Reference

Understanding SAML metadata XML documents for configuring trust between 
    Identity Providers and Service Providers.

:::note[What is SAML Metadata?]
SAML metadata is an XML document that describes a SAML entity's capabilities,
endpoints, and certificates. It enables automated configuration between IdPs and SPs.
:::


## Metadata Endpoints

| Endpoint | Description |
| --- | --- |
| `/t/\{tenant\}/saml/sp/metadata` | Service Provider metadata (when LumoAuth is SP) |
| `/t/\{tenant\}/saml/idp/metadata` | Identity Provider metadata (when LumoAuth is IdP) |

:::tip[Best Practice]
Always use metadata URLs instead of manually copying configuration values.
This ensures certificates and endpoints stay in sync automatically.
:::


## SP Metadata Structure

When LumoAuth acts as a Service Provider:

```xml
MIICoDCCAYigAwIBAgIJAL...
                    
                
            
        
        
        
        
            
                
                    
                        MIICoDCCAYigAwIBAgIJAL...
                    
                
            
        
        
        
        
        
        
        
            urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
        
        
            urn:oasis:names:tc:SAML:2.0:nameid-format:persistent
```

### SP Metadata Elements

| Element | Attribute | Description |
| --- | --- | --- |
| `EntityDescriptor` | `entityID` | Unique identifier for this SP |
| `SPSSODescriptor` | `AuthnRequestsSigned` | Whether SP signs AuthnRequests |
|  | `WantAssertionsSigned` | Require IdP to sign assertions |
| `KeyDescriptor` | `use="signing"` | Certificate for signature verification |
|  | `use="encryption"` | Certificate for assertion encryption |
| `AssertionConsumerService` | `Location` | URL where IdP posts SAML Response |
|  | `Binding` | HTTP-POST or HTTP-Redirect |
| `SingleLogoutService` | `Location` | URL for logout requests |

## IdP Metadata Structure

When LumoAuth acts as an Identity Provider:

```xml
MIICoDCCAYigAwIBAgIJAL...
                    
                
            
        
        
        
        
            urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
        
        
            urn:oasis:names:tc:SAML:2.0:nameid-format:persistent
        
        
            urn:oasis:names:tc:SAML:2.0:nameid-format:transient
```

### IdP Metadata Elements

| Element | Attribute | Description |
| --- | --- | --- |
| `EntityDescriptor` | `entityID` | Unique identifier for this IdP |
| `IDPSSODescriptor` | `WantAuthnRequestsSigned` | Require SPs to sign requests |
| `KeyDescriptor` | `use="signing"` | Certificate SPs use to verify signatures |
| `SingleSignOnService` | `Location` | URL where SPs send AuthnRequests |
|  | `Binding` | Supported binding type |

## SAML Bindings

Bindings define how SAML messages are transported over HTTP:

| Binding | URN | Method | Use Case |
| --- | --- | --- | --- |
| **HTTP-Redirect** | `urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect` | GET | AuthnRequests, LogoutRequests |
| **HTTP-POST** | `urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST` | POST | SAML Responses, large messages |
| **HTTP-Artifact** | `urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact` | GET/POST | High-security (back-channel resolution) |

:::warning[Redirect Binding Limitations]
HTTP-Redirect binding has a URL length limit (~2KB). For large SAML messages,
use the HTTP-POST binding instead.
:::


## Certificate Handling

### Certificate Format in Metadata

Certificates in metadata are Base64-encoded X.509 certificates without PEM headers:

```xml
MIICoDCCAYigAwIBAgIJALmv3e3J7tFpMA0GCSqGSIb3DQEBCwUAMBkxFzAVBgNV
BAMMDmF1dGguZXhhbXBsZS5jb20wHhcNMjQwMTE1MTAzMDAwWhcNMjcwMTE0MTAz
MDAwWjAZMRcwFQYDVQQDDA5hdXRoLmV4YW1wbGUuY29tMIIBIjANBgkqhkiG9w0B
...
```

### Converting to PEM Format

To use the certificate with external tools, add PEM headers:

```bash
# SHA-256 fingerprint
openssl x509 -in cert.pem -noout -fingerprint -sha256

# SHA-1 fingerprint (legacy)
openssl x509 -in cert.pem -noout -fingerprint -sha1
```

## Extracting Values from Metadata

If manual configuration is required, extract values using XPath:

| Value | XPath Expression |
| --- | --- |
| Entity ID | `/md:EntityDescriptor/@entityID` |
| SSO URL (Redirect) | `//md:SingleSignOnService[@Binding='...HTTP-Redirect']/@Location` |
| SSO URL (POST) | `//md:SingleSignOnService[@Binding='...HTTP-POST']/@Location` |
| ACS URL | `//md:AssertionConsumerService/@Location` |
| SLO URL | `//md:SingleLogoutService/@Location` |
| Signing Certificate | `//md:KeyDescriptor[@use='signing']//ds:X509Certificate/text()` |

### Using cURL and xmllint

```bash
# Download and extract Entity ID
curl -s https://idp.example.com/metadata | \
  xmllint --xpath "/*/@entityID" - 2>/dev/null

# Extract SSO URL
curl -s https://idp.example.com/metadata | \
  xmllint --xpath "//*[local-name()='SingleSignOnService']/@Location" - 2>/dev/null
```

## Metadata Validation

Before deployment, validate metadata:

1. **XML Validity:** Ensure well-formed XML syntax
2. **Schema Compliance:** Validate against SAML metadata XSD
3. **Certificate Validity:** Check certificate expiration dates
4. **Endpoint Accessibility:** Verify all URLs are reachable
5. **Binding Support:** Ensure compatible bindings

### Debugging Tools

| Tool | Description |
| --- | --- |
| [SAMLTool.com](https://www.samltool.com/) | Online SAML message decoder and validator |
| [SAML Tracer](https://addons.mozilla.org/en-US/firefox/addon/saml-tracer/) | Firefox extension for SAML debugging |
| [SAML DevTools](https://chrome.google.com/webstore/detail/saml-devtools-extension/) | Chrome extension for SAML debugging |

## Common Issues

| Issue | Cause | Solution |
| --- | --- | --- |
| **Certificate Mismatch** | Metadata certificate differs from signing key | Re-download metadata after cert rotation |
| **Expired Certificate** | Certificate validity period passed | Generate new certificate, update all parties |
| **Wrong Binding** | SP/IdP using incompatible binding | Check supported bindings in metadata |
| **Namespace Issues** | Missing or wrong XML namespaces | Ensure all required namespaces declared |
