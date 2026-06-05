# Senior DevOps & Full Stack Audit Report

This report presents a comprehensive DevOps and Full Stack code audit of the **Store Rating Platform**, detailing requirement coverage, production configs, JWT/CORS/Prisma validation steps, and deployment troubleshooting guidelines.

---

## 📋 1. Requirement Coverage Checklist

Every functional capability requested in the coding challenge has been verified and fully implemented:

- [x] **Authentication (JWT-based)**
  - [x] Register new users with passwords hashed via Bcrypt.
  - [x] Login and receive JWT access tokens.
  - [x] Change password with validation checks (uppercase, special character, min/max length).
  - [x] Retrieve profile information of the currently authenticated user (`GET /api/auth/me`).
- [x] **Profile Management (Self-Service)**
  - [x] Users can view their personal details and physical address.
  - [x] Users can modify their Full Name, Email, and Physical Address securely (`PUT /api/auth/profile`).
  - [x] Prevented role escalation (users cannot change their own roles to `ADMIN` publicly).
- [x] **Store Management**
  - [x] Browse all registered stores with pagination, search (by name or address), and sorting.
  - [x] Retrieve detailed store page showing average ratings, total ratings count, and individual customer feedback.
  - [x] Admins and Store Owners can create and update stores.
  - [x] Admins only can delete stores (restricting destructive actions).
- [x] **Rating & Review System**
  - [x] Normal customers can submit rating values (1 to 5) and optional reviews up to 500 characters.
  - [x] **Single-Rating Constraint (Upsert)**: A user can only rate a store once. Subsequent submissions automatically update their previous rating.
  - [x] Normal customers can edit/modify their submitted ratings and comments.
  - [x] Admins only can delete customer reviews (moderation capabilities).
- [x] **Dashboards**
  - [x] **Admin Dashboard**: Retrieves global system stats (total counts of users, stores, and ratings).
  - [x] **Store Owner Dashboard**: Displays owned store count, overall average rating received, and a paginated, sortable review feed of all comments left on their businesses.

---

## 🔍 2. Resolved Functional Gaps & Bugs

During the full-stack review, three key gaps were identified and corrected:

1. **Name Validation Length Bug**:
   * *Issue*: Backend and frontend validated user names with a `@MinLength(20)` constraint. This blocked users with normal-sized names from signing up.
   * *Resolution*: Reduced name validation minimum size to `@MinLength(2)` on both NestJS DTOs and React hook forms.
2. **Missing Profile Self-Update Endpoint**:
   * *Issue*: The challenge requested profile self-management, but the frontend profile fields were locked and the backend lacked a self-update endpoint.
   * *Resolution*: Implemented `PUT /api/auth/profile` in the backend Auth module, extended frontend types, and updated `ProfilePage.tsx` with editable fields and state synchronization.
3. **Empty Seed Data**:
   * *Issue*: The default seed script only created one basic user per role with no stores or reviews.
   * *Resolution*: Expanded `seed.ts` to generate 15 users, 8 stores, and 30 ratings with diverse scores and comments.

---

## 📂 3. Production Environment & Configs

### 🔐 .env.example Configurations

#### Backend: `backend/.env.example`
```env
# Database Credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/store_rating_db?schema=public"

# JWT Config (Use a long, random string in production)
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="24h"

# Application Settings
PORT=3000
NODE_ENV=development

# CORS Settings (Explicitly set to Vercel production domain)
CORS_ORIGIN="http://localhost:5173"
```

#### Frontend: `frontend/.env.example`
```env
# Target Backend API URL (Do not include trailing slash)
VITE_API_URL="http://localhost:3000/api"
```

---

## ☁️ 4. Cloud Deployments (Render & Vercel)

### 🚀 Render Blueprint (`render.yaml`)
To deploy both PostgreSQL and NestJS on Render automatically, we created [render.yaml](file:///c:/Users/Admin/OneDrive/Desktop/Roxiler_Coding_Challenge/render.yaml) at the project root. Key configurations:
* **Prisma Migration**: Run command `npx prisma migrate deploy` executes before running `npm run start:prod`. This ensures schema changes are applied automatically without database reset.
* **Secret Generation**: Render generates `JWT_SECRET` dynamically, securing the server.

### 🌐 Vercel SPA Configuration (`frontend/vercel.json`)
Single Page Applications (SPAs) using React Router (client-side routing) throw 404 errors when pages are refreshed directly. To solve this, we created [vercel.json](file:///c:/Users/Admin/OneDrive/Desktop/Roxiler_Coding_Challenge/frontend/vercel.json):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This forces Vercel to route all paths to `index.html`, allowing React Router to handle page switches correctly.

---

## 📦 5. Production Build & Execution Commands

### Backend (NestJS)
* **Build**: Runs TypeScript compilation and outputs JS code inside `dist/`.
  ```bash
  npm run build
  ```
* **Production Start**: Applies database schema migrations and boots the Node process.
  ```bash
  npx prisma migrate deploy && node dist/main
  ```

### Frontend (React + Vite)
* **Build**: Compiles code and outputs highly optimized, minified HTML/CSS/JS assets inside `dist/`.
  ```bash
  npm run build
  ```
* **Local Production Preview**: Boots a local server pointing to compiled assets.
  ```bash
  npm run preview
  ```

---

## 📁 6. GitHub Repository Structure

Submit your repository using this clean, structured directory tree:

```text
├── backend/                  # NestJS API server
│   ├── prisma/               # Schema, migrations, and seed script
│   ├── src/                  # NestJS Controllers, Services, Guards, and DTOs
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Server package manifest
├── frontend/                 # React SPA
│   ├── src/                  # React Pages, Components, State, Services
│   ├── vercel.json           # Vercel SPA fallback configuration
│   └── package.json          # Client package manifest
├── audit/                    # DevOps and Full Stack Audit Reports
│   ├── missing_features.md   # Functional gap fixes
│   ├── security_improvements.md # Security audit & hardening guidelines
│   ├── performance_improvements.md # DB Indexes and aggregations analysis
│   └── devops_fullstack_audit.md # THIS AUDIT REPORT
├── render.yaml               # Render Infrastructure-as-Code Blueprint
├── postman_collection.json   # Postman Collection for endpoints testing
├── docker-compose.yml        # PostgreSQL service container
└── README.md                 # Updated documentation & running manual
```

---

## 🔬 7. Production Verification Checklist

### 🔑 JWT Authentication Verification
1. **SSL/TLS Enforcement**: In production, ensure the backend runs behind an HTTPS connection (handled automatically by Render's load balancer). This prevents JWT tokens from being intercepted in transit.
2. **Payload Protection**: Verify JWT payloads contain only non-sensitive data:
   ```json
   {
     "sub": "user-uuid",
     "email": "user@storerating.com",
     "role": "USER"
   }
   ```
   *Note: Never include passwords, raw addresses, or PII inside the token body.*
3. **Secret Security**: Ensure `JWT_SECRET` is set to a cryptographically strong string (at least 32 characters) via the Render dashboard.

### 🌐 CORS Verification (Render + Vercel)
1. **Origin Restrictions**: In Render's environment settings, set `CORS_ORIGIN` to your exact Vercel frontend URL (e.g., `https://store-rating-frontend.vercel.app`).
2. **Request Methods**: Verify the backend CORS policy permits `GET, POST, PUT, DELETE, PATCH`.
3. **Credentials Handling**: Since we use Authorization Bearer headers instead of HttpOnly cookies, credentials can be set to true or false. If using HTTP cookies in the future, `credentials: true` must be paired with explicit origins, never wildcards (`*`).

### 🗃️ Prisma Database Integration on Render
1. **Engine Versioning**: Ensure `npx prisma generate` is executed *during* the build step on Render. This compiles the custom binary query engines for the specific Linux container architecture.
2. **Migrations Strategy**: Never run `npx prisma migrate dev` in production pipelines as it prompts for user feedback and can wipe data. Always run `npx prisma migrate deploy`.

---

## 🛠️ 8. DevOps Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **API returns 403 / CORS Error** | `CORS_ORIGIN` env variable does not match the frontend domain URL. | Check frontend Vercel domain. Update the `CORS_ORIGIN` variable in the Render environment panel and restart the service. |
| **Frontend page refresh returns 404** | Client-side routing path has no matching static file on Vercel. | Verify that [vercel.json](file:///c:/Users/Admin/OneDrive/Desktop/Roxiler_Coding_Challenge/frontend/vercel.json) exists in the frontend folder with rewrite rules, and re-deploy. |
| **Render Build Fail: Prisma Engine Missing** | Prisma client was not generated on the host before compilation. | Add `npx prisma generate` to the build script in Render (or as a `postinstall` script in package.json). |
| **Prisma Migration Fails: Database Locks** | Multiple concurrent backend builds trying to apply schema changes simultaneously. | Temporarily scale backend task instances to 1 during schema deployments, or manually apply the migration from a secure command terminal. |
| **Database Connection Timeout** | Render database IP restrictions or network isolation issues. | Ensure both backend web service and PostgreSQL database are deployed in the same region (e.g., Oregon) so they can communicate over Render's internal private network. |

---

## 🏁 9. Final Submission Checklist

Before submitting the GitHub link for the Roxiler coding challenge deadline, verify:

- [ ] **No Hardcoded Secrets**: Ensure `DATABASE_URL` and `JWT_SECRET` are removed from `.env` files committed to Git.
- [ ] **Database Seed runs**: Run `npx prisma db seed` locally to verify schema and data imports work.
- [ ] **TypeScript Builds Pass**: Run `npm run build` in both `backend` and `frontend` directories and check for zero compiler warnings.
- [ ] **Postman Collection Import**: Import `postman_collection.json` in a clean environment and run login/profile flows to verify endpoints functionality.
- [ ] **All Documentation paths exist**: Verify that the README and audit reports links resolve correctly.
