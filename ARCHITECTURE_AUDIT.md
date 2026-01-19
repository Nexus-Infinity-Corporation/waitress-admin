# Architecture Audit Report - Screaming Architecture Compliance

## Issues Found

### 1. **Services Duplication** ❌

#### Root `/services/` folder contains:

- `clients.service.ts` - **DUPLICATE** (exists in `app/[locale]/clients/services/`)
- `products.service.ts` - **DUPLICATE** (exists in `app/[locale]/products/services/`)
- `warehouse.service.ts` - **DUPLICATE** (exists in `app/[locale]/warehouse/services/`)
- `employees.service.ts` - **DUPLICATE** (exists in `app/[locale]/employees/services/`)
- `dashboard.service.ts` - **DUPLICATE** (exists in `app/[locale]/dashboard/services/`)
- `navigation.service.ts` - **DUPLICATE** (exists in `app/[locale]/dashboard/services/`)
- `api.service.ts` - ✅ **KEEP** (shared utility)

#### Pages importing from root instead of feature folders:

- `app/[locale]/clients/page.tsx` → `@/services/clients.service` ❌
- `app/[locale]/products/page.tsx` → `@/services/products.service` ❌
- `app/[locale]/warehouse/page.tsx` → `@/services/warehouse.service` ❌
- `app/[locale]/employees/page.tsx` → `@/services/employees.service` ❌
- `app/[locale]/page.tsx` → `@/services/dashboard.service` ❌
- `app/[locale]/dashboard/page.tsx` → `@/services/dashboard.service` ❌
- `app/[locale]/orders/components/orders-table.tsx` → `@/services/dashboard.service` ❌
- `app/[locale]/dashboard/components/*` → `@/services/dashboard.service` ❌

### 2. **Components Duplication** ❌

#### Root `/components/dashboard/` contains feature-specific tables:

- `clients-table.tsx` - **DUPLICATE** (exists in `app/[locale]/clients/components/`)
- `products-table.tsx` - **DUPLICATE** (exists in `app/[locale]/products/components/`)
- `warehouse-table.tsx` - **DUPLICATE** (exists in `app/[locale]/warehouse/components/`)
- `employees-table.tsx` - **DUPLICATE** (exists in `app/[locale]/employees/components/`)
- `orders-table.tsx` - **DUPLICATE** (exists in `app/[locale]/orders/components/`)
- `branches-table.tsx` - **DUPLICATE** (exists in `app/[locale]/branches/components/`)

#### Pages importing from root instead of feature folders:

- `app/[locale]/clients/page.tsx` → `@/components/dashboard/clients-table` ❌
- `app/[locale]/products/page.tsx` → `@/components/dashboard/products-table` ❌
- `app/[locale]/warehouse/page.tsx` → `@/components/dashboard/warehouse-table` ❌
- `app/[locale]/employees/page.tsx` → `@/components/dashboard/employees-table` ❌
- `app/[locale]/branches/page.tsx` → `@/components/dashboard/branches-table` ❌

#### Shared components (should stay in root):

- `data-table.tsx` - ✅ **KEEP** (shared utility component)
- `horizontal-header.tsx` - ✅ **KEEP** (shared layout component)
- Dashboard-specific components (charts, metrics, etc.) - ✅ **KEEP** (dashboard feature)

### 3. **Types Duplication** ❌

#### Type files:

- `/types/restaurant.ts` - **DUPLICATE** (same as `/shared/types/restaurant.ts`)
- `/shared/types/restaurant.ts` - ✅ **KEEP** (has Branch interface added)

#### Inconsistent imports:

- Root services use: `@/types/restaurant` ❌
- Feature services use: `@/shared/types/restaurant` ✅
- Root components use: `@/types/restaurant` ❌
- Feature components use: `@/shared/types/restaurant` ✅

### 4. **Navigation Service Duplication** ❌

- `/services/navigation.service.ts` - **DUPLICATE**
- `app/[locale]/dashboard/services/navigation.service.ts` - **DUPLICATE**
- Both are used in different places

## Recommended Fixes

### Phase 1: Update Imports to Use Feature Services

1. Update all page imports to use feature-specific services
2. Update dashboard service to import from feature services (not root)
3. Remove root service files after migration

### Phase 2: Move Components to Feature Folders

1. Update all page imports to use feature-specific components
2. Remove duplicate components from root `/components/dashboard/`
3. Keep only shared components in root

### Phase 3: Consolidate Types

1. Remove `/types/restaurant.ts`
2. Update all imports to use `/shared/types/restaurant.ts`
3. Ensure all types are in `/shared/types/` for shared domain types

### Phase 4: Clean Up Navigation

1. Decide on single location for navigation service
2. Update all imports
3. Remove duplicate

## Files to Delete After Migration

### Services:

- `/services/clients.service.ts`
- `/services/products.service.ts`
- `/services/warehouse.service.ts`
- `/services/employees.service.ts`
- `/services/dashboard.service.ts`
- `/services/navigation.service.ts` (or keep if used as shared)

### Components:

- `/components/dashboard/clients-table.tsx`
- `/components/dashboard/products-table.tsx`
- `/components/dashboard/warehouse-table.tsx`
- `/components/dashboard/employees-table.tsx`
- `/components/dashboard/orders-table.tsx`
- `/components/dashboard/branches-table.tsx`

### Types:

- `/types/restaurant.ts`

## Files to Keep in Root

### Services:

- `/services/api.service.ts` (shared utility)

### Components:

- `/components/dashboard/data-table.tsx` (shared utility)
- `/components/dashboard/horizontal-header.tsx` (shared layout)
- `/components/dashboard/*-chart.tsx` (dashboard feature components)
- `/components/dashboard/metric-*.tsx` (dashboard feature components)
- `/components/ui/*` (shared UI components)
