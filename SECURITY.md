# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

We take the security of WCAGAI seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Open a Public Issue

Please do not report security vulnerabilities through public GitHub issues.

### 2. Report Via Email

Send an email to: **security@wcagai.com** (or open a private security advisory)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days

### 4. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and resolve the issue
- Once fixed, we will publicly disclose the vulnerability
- We will credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

2. **Use Environment Variables**
   - Never commit secrets to git
   - Use `.env` files locally
   - Use secure secret management in production (Railway secrets, etc.)

3. **Enable Security Headers**
   - Helmet.js is enabled by default
   - CORS is configured
   - Rate limiting is active

4. **Use HTTPS in Production**
   - Railway provides SSL/TLS automatically
   - Never use HTTP for production

5. **Restrict Redis Access**
   - Don't expose Redis to the internet
   - Use authentication if Redis is shared
   - Use TLS for Redis connections in production

### For Contributors

1. **Run Security Checks**
   ```bash
   npm audit
   npm run lint
   npm test
   ```

2. **Never Commit Secrets**
   - Use `.env.example` for templates
   - Add `.env` to `.gitignore`
   - Review commits before pushing

3. **Validate Input**
   - Use Joi validation for all inputs
   - Sanitize user data
   - Use parameterized queries (when DB is added)

4. **Handle Errors Securely**
   - Don't leak sensitive info in error messages
   - Log errors server-side only
   - Return generic errors to clients

## Known Security Considerations

### Rate Limiting

Default: 100 requests per 15 minutes per IP on `/api/*` routes.

The `/health` endpoint is **not** rate limited to allow monitoring tools.

### SerpAPI Key

- Store in environment variables
- Never commit to git
- Rotate periodically
- Monitor usage for anomalies

### Redis

- Uses password authentication when configured
- Connection strings can contain passwords
- Don't log Redis URLs
- Use TLS in production

### Puppeteer/Chrome

- Runs in sandbox mode
- No-sandbox flag only in Docker (necessary)
- Isolated from host system
- Timeout limits prevent DoS

## Vulnerability Disclosure

Past vulnerabilities will be listed here after they are fixed:

- **None disclosed yet**

## Security Updates

Subscribe to security updates:

- Watch this repository
- Check release notes
- Monitor GitHub Security Advisories

## Compliance

This project aims to comply with:

- OWASP Top 10 security standards
- WCAG 2.2 AA (accessibility)
- EAA (European Accessibility Act)
- GDPR considerations (when user data is added)

## Contact

For security concerns, contact:
- Email: security@wcagai.com
- GitHub Security Advisory: [Create advisory](https://github.com/aaj441/wcagai-v4-reality-check/security/advisories/new)

---

**Last Updated**: November 2025
