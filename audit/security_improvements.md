# Audit Report: Security Review & Hardening Guide

This document lists the security audit findings for the **Store Rating Platform** codebase, categorized by severity, along with corresponding recommendations and implemented fixes.

---

## 🚨 Critical Security Vulnerabilities

### 1. Public Role Escalation via Registration Endpoint (High)
* **Vulnerability**: The public registration route `POST /api/auth/register` accepted the `role` field directly from the user request payload without validation or restriction.
* **Risk**: A malicious client could send `"role": "ADMIN"` in the registration body and create an administrative account with full system access.
* **Fix (Implemented)**: Added checks in the registration handler to reject requests attempting to register as `ADMIN` publicly. Admin roles can only be granted by existing administrators through `POST /api/users`.
  ```typescript
  if (dto.role === Role.ADMIN) {
    throw new ForbiddenException('Registration as Admin is not permitted');
  }
  ```

---

## 🔒 Medium & Low Risk Findings

### 2. Hardcoded Secrets & Missing Configuration Checks (Medium)
* **Vulnerability**: The `.env.example` file contains placeholder secrets. In production, missing config checks might lead to running with default secret keys.
* **Recommendation**: 
  * Ensure `JWT_SECRET` is verified to be strong and distinct from the dev key.
  * Utilize `joi` or `class-validator` inside NestJS Config module to assert environment variables are populated and meet minimum security criteria before bootstrap.

### 3. Lack of Rate Limiting (Medium)
* **Vulnerability**: Critical endpoints (such as `POST /api/auth/login` and `POST /api/auth/register`) do not implement rate-limiting or throttling.
* **Risk**: High exposure to brute-force credential stuffing and denial-of-service (DDoS) attempts.
* **Recommendation**: Implement NestJS `@nestjs/throttler` globally to rate-limit clients by IP address. For instance, limit authentication requests to 5 per minute per IP.

### 4. Missing Standard Security Headers (Medium)
* **Vulnerability**: The application does not configure standard security headers (e.g., `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`).
* **Risk**: Vulnerable to Clickjacking, cross-site scripting (XSS) injections, and protocol downgrades.
* **Recommendation**: Import and apply `helmet` middleware in `backend/src/main.ts` to automatically apply standard security headers.

### 5. CORS Permissive Configuration (Low)
* **Vulnerability**: The CORS policy allows all methods and credentials for the client development server. If not configured carefully, this can leak in production.
* **Recommendation**: Ensure `CORS_ORIGIN` is configured to strict white-listed domains in production and never set to wildcard `*` when credentials are enabled.

---

## 🛡️ Implemented Security Enhancements

We implemented the role escalation check in the backend registration module to prevent unauthorized administrative registrations:
1. Checked that `ForbiddenException` is imported.
2. Verified the role is restricted to `USER` or `STORE_OWNER` only.
