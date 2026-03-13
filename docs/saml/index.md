# SAML 2.0 API

Secure federated Single Sign-On using the Security Assertion Markup Language 2.0 standard.
    Enable enterprise SSO with external Identity Providers or issue SAML assertions to SP applications.

:::note[Enterprise Federation Made Easy]
LumoAuth handles the complexity of SAML assertions, signatures, and bindings.
Configure your SP's metadata URL and LumoAuth takes care of the rest.
:::


## Dual Mode Architecture

LumoAuth operates in two complementary SAML modes depending on your use case:

| Mode | LumoAuth Role | Use Case |
| --- | --- | --- |
| **Service Provider (SP)** | Consumes SAML assertions from external IdPs | Let users log in via corporate IdPs (Okta, Azure AD, ADFS) |
| **Identity Provider (IdP)** | Issues SAML assertions to SP applications | Enable SSO to SAML apps (Salesforce, Box, Slack, custom apps) |

## SAML Endpoints Reference

### Service Provider Endpoints

Use these when LumoAuth acts as the SP, accepting logins from external IdPs:

| Endpoint | Method | Description |
| --- | --- | --- |
| `/t/\{tenant\}/saml/sp/metadata` | GET | SP Metadata XML document |
| `/t/\{tenant\}/saml/sp/login` | GET | Initiate SSO (redirects to IdP) |
| `/t/\{tenant\}/saml/sp/login/\{idpId\}` | GET | Initiate SSO with specific IdP |
| `/t/\{tenant\}/saml/sp/acs` | POST | Assertion Consumer Service (receives SAML Response) |
| `/t/\{tenant\}/saml/sp/slo` | GET/POST | Single Logout Service |

### Identity Provider Endpoints

Use these when LumoAuth acts as the IdP, issuing assertions to SP applications:

| Endpoint | Method | Description |
| --- | --- | --- |
| `/t/\{tenant\}/saml/idp/metadata` | GET | IdP Metadata XML document |
| `/t/\{tenant\}/saml/idp/sso` | GET/POST | Single Sign-On Service (receives AuthnRequest) |
| `/t/\{tenant\}/saml/idp/slo` | GET/POST | Single Logout Service |

## Key Concepts

| Term | Description |
| --- | --- |
| **Entity ID** | Unique identifier for an SP or IdP, typically a URL |
| **Metadata** | XML document describing endpoints, certificates, and capabilities |
| **AuthnRequest** | SAML authentication request sent from SP to IdP |
| **SAML Response** | Signed XML containing one or more assertions |
| **Assertion** | Signed statement containing user identity and attributes |
| **NameID** | User identifier in SAML (email, persistent ID, transient) |
| **ACS URL** | Assertion Consumer Service - where responses are sent |
| **SLO** | Single Logout - terminates sessions across all parties |

## Security Features

| Feature | Description | Default |
| --- | --- | --- |
| **Response Signing** | Entire SAML Response is cryptographically signed | Enabled |
| **Assertion Signing** | Individual assertions are signed | Enabled |
| **Assertion Encryption** | Assertions encrypted with SP's certificate | Optional |
| **Signature Verification** | Verify signatures from IdP/SP | Required |
| **Audience Restriction** | Assertions only valid for intended SP | Enforced |
| **Replay Protection** | Assertions cannot be reused | Enforced |

## Getting Started

:::tip[Quick Setup Path]
For the fastest setup, use metadata URL exchange. Provide your SP's metadata URL
to LumoAuth, and LumoAuth's metadata URL to your SP.
:::


### For Service Provider Mode

[→ Service Provider Configuration Guide](/saml/sp)

### For Identity Provider Mode

[→ Identity Provider Configuration Guide](/saml/idp)

### Metadata Reference

[→ SAML Metadata Documentation](/saml/metadata)

## Supported NameID Formats

| Format | URN | Typical Use |
| --- | --- | --- |
| **Email Address** | `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` | Most common, matches on email |
| **Persistent** | `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent` | Stable identifier, survives email changes |
| **Transient** | `urn:oasis:names:tc:SAML:2.0:nameid-format:transient` | Session-specific, privacy-focused |
| **Unspecified** | `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` | SP determines interpretation |

## Glossary

| Term | Definition |
| --- | --- |
| **SAML** | Security Assertion Markup Language - XML-based SSO standard |
| **SSO** | Single Sign-On - one login for multiple applications |
| **IdP** | Identity Provider - authenticates users and issues assertions |
| **SP** | Service Provider - application that accepts SAML assertions |
| **JIT Provisioning** | Just-in-Time user creation on first SAML login |
| **X.509** | Standard for digital certificates used in SAML signing |

## Reference Specifications

- [SAML 2.0 Core Specification](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf)
- [SAML 2.0 Bindings Specification](https://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf)
- [SAML 2.0 Profiles Specification](https://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf)
- [SAML 2.0 Metadata Specification](https://docs.oasis-open.org/security/saml/v2.0/saml-metadata-2.0-os.pdf)
