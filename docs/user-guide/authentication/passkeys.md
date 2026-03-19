# Passkeys & WebAuthn

Passkeys provide passwordless authentication using the FIDO2/WebAuthn standard. Users authenticate with biometrics (fingerprint, face recognition) or hardware security keys instead of passwords.

---

## What Are Passkeys?

Passkeys are cryptographic credentials stored on the user's device. They use public-key cryptography - the private key never leaves the device, and the public key is stored in LumoAuth. Authentication is verified by a cryptographic challenge-response, making passkeys:

- **Phishing-resistant** - Bound to the specific origin (domain)
- **No shared secrets** - Nothing to steal from the server
- **Biometric-backed** - Require fingerprint, face, or PIN to use
- **Cross-device** - Sync across devices via platform credential managers

---

## Supported Credential Types

| Type | Examples | Use Case |
|------|---------|----------|
| **Platform Authenticators** | Touch ID, Face ID, Windows Hello | Built into the device |
| **Roaming Authenticators** | YubiKey, Titan Security Key | USB/NFC hardware keys |
| **Synced Passkeys** | iCloud Keychain, Google Password Manager, 1Password | Cross-device passkeys |

---

## How It Works

### Registration (Enrollment)

1. User navigates to account security settings
2. Clicks **"Add Passkey"**
3. Browser prompts for biometric verification (fingerprint/face) or security key
4. A new public-private key pair is generated on the device
5. The public key is stored in LumoAuth
6. Done - the passkey is ready to use

### Authentication

1. User enters their email (or clicks "Sign in with Passkey")
2. LumoAuth sends a cryptographic challenge to the browser
3. Browser prompts for biometric verification
4. The private key on the device signs the challenge
5. LumoAuth verifies the signature with the stored public key
6. Login is complete - no password needed

---

## Configuration

### Enable Passkeys

Navigate to **Configuration** → **Auth Settings** at:
```
/t/{tenantSlug}/portal/configuration/auth-settings
```

Under **Authentication Methods**, toggle **Passkeys / WebAuthn** to enabled.

### Settings

| Setting | Description |
|---------|-------------|
| **Allow Passkey Registration** | Users can create passkeys in account settings |
| **Allow Passkey Login** | Users can log in with passkeys |
| **Require User Verification** | Enforce biometric/PIN (recommended) |
| **Attestation Preference** | "none", "indirect", or "direct" attestation |
| **Authenticator Types** | Allow platform, roaming, or both |

---

## WebAuthn Routes

LumoAuth exposes WebAuthn endpoints for registration and authentication:

```
POST /webauthn/register/options     → Generate registration options
POST /webauthn/register             → Complete registration
POST /webauthn/authenticate/options → Generate authentication options
POST /webauthn/authenticate         → Verify authentication
```

These endpoints follow the WebAuthn specification and are used by the browser's built-in `navigator.credentials` API.

---

## User Experience

### Enrolling a Passkey

From the account security page:
```
/account/security
```

1. Click **"Add Passkey"**
2. Name the passkey (e.g., "MacBook Touch ID", "YubiKey")
3. Complete the biometric prompt
4. The passkey appears in the list of enrolled credentials

### Logging In with a Passkey

On the login page:

1. Click **"Sign in with Passkey"** (or start typing email)
2. The browser shows available passkeys
3. Select a passkey and verify with biometrics
4. Instant login - no password or MFA needed

### Managing Passkeys

Users can manage their passkeys from account settings:
- View all enrolled passkeys with names and creation dates
- Delete individual passkeys
- Add new passkeys

---

## Passkeys as MFA

Passkeys can also be used as a second factor alongside password authentication:

1. User enters email and password
2. Instead of TOTP/SMS, the system prompts for a passkey
3. User verifies with biometrics
4. MFA is satisfied

This provides the strongest MFA - phishing-resistant and hardware-backed.

---

## Security Benefits

| Feature | Passwords | Passkeys |
|---------|-----------|----------|
| Phishing Risk | High - can be entered on fake sites | None - bound to origin |
| Server Breach | Hashed passwords can be cracked | Only public keys stored |
| Replay Attacks | Possible | Impossible - challenge-response |
| User Effort | Remembering complex passwords | Touch fingerprint sensor |
| Cross-Site | Same password often reused | Unique per site |

---

## Browser Support

Passkeys are supported in:
- **Chrome** 108+ (Windows, macOS, Android)
- **Safari** 16+ (macOS, iOS)
- **Firefox** 122+ (Windows, macOS, Linux)
- **Edge** 108+ (Windows, macOS)

For older browsers, passkey options will not appear and users can fall back to password + MFA authentication.

---

## Related Guides

- [Authentication Overview](overview.md) - All authentication methods
- [Multi-Factor Authentication](mfa.md) - Use passkeys as MFA
- [Email & Password](email-password.md) - Traditional authentication (fallback)
