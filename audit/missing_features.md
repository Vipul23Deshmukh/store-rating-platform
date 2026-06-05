# Audit Report: Requirement Coverage & Functional Gaps

This document presents the functional audit results for the **Store Rating Platform** coding challenge. It maps every requirement, lists identified bugs and gaps, and describes the remedial actions taken to achieve 100% requirement coverage.

---

## 📋 Requirement Mapping & Audit Results

| Feature / Requirement | Target Role(s) | Status | Audit Observations / Changes Made |
| :--- | :--- | :--- | :--- |
| **User Registration & Login** | Public | **Passed** | Fully implemented using JWT auth + passport. Password strength feedback and security conditions checked. |
| **Admin Dashboard Stats** | Admin | **Passed** | Global stats for total users, stores, and ratings retrieved successfully. |
| **Admin User Management (CRUD)** | Admin | **Passed** | Full administration capabilities. Admin can create, read, update, and delete users. |
| **Admin Store Management (CRUD)** | Admin | **Passed** | Full CRUD capabilities. Store deletion is restricted to Admins. |
| **Admin Review Moderation** | Admin | **Passed** | Admins can delete any inappropriate rating/review via `DELETE /api/ratings/:id`. |
| **Store Owner Dashboard Stats** | Store Owner | **Passed** | Aggregates number of stores owned, total ratings received, and calculated average rating. |
| **Store Owner Ratings Table** | Store Owner | **Passed** | Paginated and sortable table of all reviews submitted to owner's stores. |
| **Browse Stores List** | All Users | **Passed** | Displays all stores with pagination, sorting (name, date, etc.), and name/address search. |
| **Detailed Store Page** | All Users | **Passed** | Displays detailed store info, computed average score, total count, and individual customer comments. |
| **Submit Rating (Upsert)** | Normal User | **Passed** | Users can rate a store once. Subsequent submissions update the existing rating (guaranteed via database unique constraints). |
| **Modify Own Rating** | Normal User | **Passed** | Users can edit and update their score and review text. |
| **Manage Profile Details** | All Users | **Fixed** | **Critical Gap Resolved:** The profile update endpoints and forms were missing or disabled. Implemented full self-management flow. |

---

## 🔍 Detailed Functional Gaps & Bugs Identified

During the audit, the following functional gaps and validation bugs were discovered and corrected:

### 1. Name Validation Length Constraint Bug (Critical)
* **Observation**: Both backend DTOs (`RegisterDto`, `CreateUserDto`) and the frontend registration form (`RegisterPage.tsx`) enforced a minimum name length of 20 characters:
  ```typescript
  @MinLength(20, { message: 'Name must be at least 20 characters long.' })
  ```
* **Impact**: Made registration impossible for real users with normal-sized names (e.g., "Jane Doe" is 8 characters).
* **Fix**: Modified validation constraint to `@MinLength(2)` on the backend DTOs and updated the React validation schemas and helper text on the frontend register page.

### 2. Missing Profile Self-Management Feature (Major)
* **Observation**: The coding challenge description specifies that normal users can "manage profile". However:
  * The frontend profile page (`ProfilePage.tsx`) had all personal details inputs (Name, Email, Role) disabled. Address was missing entirely.
  * The only active capability was changing the password.
  * The backend lacked an endpoint for a user to modify their own profile data (the only update route `/api/users/:id` was protected with `@Roles(Role.ADMIN)`).
* **Impact**: Users could not update their name, email, or address, violating a core challenge requirement.
* **Fix**: 
  1. Created a secure `PUT /api/auth/profile` endpoint on the backend.
  2. Implemented profile update logic in `AuthService` (validating unique email, name size, etc.).
  3. Integrated `updateProfile` in the frontend `auth.service.ts` and extended `AuthUser` types to include physical `address`.
  4. Redesigned `ProfilePage.tsx` to enable edit mode, display and validate text inputs (including physical address), submit updates, and synchronize React Context globally without requiring page reload.

### 3. Missing Database Seed Data (Minor)
* **Observation**: The default seed script only created 3 blank users (one per role) and had no stores or ratings.
* **Impact**: Dashboards appeared empty on initial launch, and it was difficult to test sorting, searching, or pagination features.
* **Fix**: Upgraded `backend/prisma/seed.ts` to automatically populate 15 realistic users (1 Admin, 4 Owners, 10 Customers), 8 distinct business stores, and 30 unique ratings/reviews with varied scores (1–5 stars) and comments.
