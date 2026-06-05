# Audit Report: Performance Analysis & Optimization Guide

This document analyzes the database queries, indexing, and resource-usage patterns in the **Store Rating Platform**, listing recommended performance improvements.

---

## ⚡ Database Optimization & Indexing

### 1. Database Indexing Gaps (Medium)
* **Finding**: The database schema (`schema.prisma`) defines relations between models, but foreign key columns lack explicit indexes. In PostgreSQL, foreign keys do not automatically create indexes.
* **Impact**: 
  * Queries filtering stores by owner (`Store.ownerId`) or listing ratings for a specific store (`Rating.storeId`) will trigger full table scans as the dataset grows.
* **Recommendations**:
  1. Add an index on `ownerId` in the `Store` model.
  2. Add an index on `storeId` in the `Rating` model. (Note: The compound constraint `@@unique([userId, storeId])` creates an index on `(userId, storeId)` which helps when looking up a user's review for a store, but Postgres cannot efficiently use it for queries filtering solely by `storeId` unless it is the leading column. A separate index on `storeId` is needed).
  
  ```prisma
  // schema.prisma additions
  model Store {
    // ...
    @@index([ownerId])
  }

  model Rating {
    // ...
    @@index([storeId])
  }
  ```

---

## 💾 API Server Optimization

### 2. In-Memory Calculations vs. Database Aggregations (Medium)
* **Finding**: The `stores.service.ts` (`findAll` and `findOne`) and `owner.service.ts` (`getDashboardStats`) calculate average ratings and review counts in memory using Javascript `Array.reduce()`:
  ```typescript
  const averageRating = ratingCount > 0 
    ? ratings.reduce((sum, r) => sum + r.value, 0) / ratingCount 
    : 0;
  ```
* **Impact**: If a store receives thousands of ratings, NestJS will pull thousands of database rows into memory, parse them, and iterate over them in JS. This causes excessive heap memory consumption and CPU blockages under load.
* **Recommendations**:
  * Utilize Prisma's native `groupBy` or `_avg` / `_count` aggregations to offload calculations to PostgreSQL.
  * For example, fetch average and count directly:
    ```typescript
    const storeStats = await this.prisma.rating.groupBy({
      by: ['storeId'],
      _avg: { value: true },
      _count: { _all: true }
    });
    ```

### 3. Minimize Payload Size with Field Selection (Low)
* **Finding**: Some endpoints fetch full entity relations (like owner details) but map them or only return a subset.
* **Recommendations**: Always use selective projections (`select`) instead of general (`include`) where possible to reduce the size of JSON payloads traveling between PostgreSQL and the NestJS backend.

---

## 🌐 Frontend & Asset Optimization

### 4. Code Splitting & Vendor Bundling (Low)
* **Finding**: The frontend is built using Material-UI (MUI) and React. Standard Vite build settings place all node modules into a single `index.js` vendor file.
* **Impact**: Slows initial load times (LCP/FCP) on slower connections.
* **Recommendations**:
  * Enable manual chunk splitting in `vite.config.ts` to separate large UI frameworks (like `@mui/material`) from application code.
  
  ```typescript
  // vite.config.ts
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@mui')) return 'vendor-ui';
              return 'vendor';
            }
          }
        }
      }
    }
  });
  ```
