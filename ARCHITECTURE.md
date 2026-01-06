# Clean Architecture - Dashboard Project

This project follows clean architecture principles and Next.js 16 best practices with SSR-first approach.

## Folder Structure

```
waitress-admin/
├── app/                    # Next.js App Router (Server Components by default)
│   ├── page.tsx           # Dashboard page (Server Component)
│   ├── ecommerce/         # eCommerce feature pages
│   └── layout.tsx         # Root layout
├── components/             # UI Components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── *-client.tsx  # Client components (interactive)
│   │   └── *.tsx         # Server components (default)
│   └── ui/               # Reusable UI components (shadcn/ui)
├── services/              # Business Logic Layer
│   ├── dashboard.service.ts    # Dashboard data services
│   └── navigation.service.ts     # Navigation data services
├── types/                 # TypeScript Type Definitions
│   └── dashboard.ts      # Dashboard-related types
└── lib/                   # Utilities
    └── utils.ts          # Helper functions
```

## Architecture Principles

### 1. **Separation of Concerns**
- **Presentation Layer**: Components in `components/` folder
- **Business Logic Layer**: Services in `services/` folder
- **Data Layer**: Types in `types/` folder
- **Utilities**: Helper functions in `lib/` folder

### 2. **SSR-First Approach**
- All components are **Server Components** by default
- Only mark components as `"use client"` when they need:
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (window, document, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Third-party libraries that require client-side rendering

### 3. **Component Organization**
- **Server Components** (`*.tsx`): Handle data fetching, rendering
- **Client Components** (`*-client.tsx`): Handle interactivity, state management
- Example: `sales-chart.tsx` (server) → `sales-chart-client.tsx` (client)

### 4. **Data Fetching**
- All data fetching happens in **services** layer
- Services are async functions that can be called from Server Components
- Services return typed data based on TypeScript interfaces

## Component Patterns

### Server Component Pattern
```typescript
// components/dashboard/sales-chart.tsx
import { getSalesData } from "@/services/dashboard.service"
import { SalesChartClient } from "./sales-chart-client"

export async function SalesChart() {
  const data = await getSalesData() // Server-side data fetching
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <SalesChartClient data={data} />
      </CardContent>
    </Card>
  )
}
```

### Client Component Pattern
```typescript
// components/dashboard/sales-chart-client.tsx
"use client"

import { AreaChart, Area, ... } from "recharts"

export function SalesChartClient({ data }: { data: SalesDataPoint[] }) {
  // Client-side rendering for interactive charts
  return <ResponsiveContainer>...</ResponsiveContainer>
}
```

## Benefits

1. **Performance**: Server Components reduce JavaScript bundle size
2. **SEO**: Better SEO with server-rendered content
3. **Maintainability**: Clear separation makes code easier to maintain
4. **Type Safety**: TypeScript types ensure data consistency
5. **Scalability**: Easy to add new features following the same pattern

## Best Practices

1. ✅ Use Server Components by default
2. ✅ Extract business logic to services
3. ✅ Define types in separate files
4. ✅ Keep client components minimal and focused
5. ✅ Use async/await for data fetching in Server Components
6. ✅ Pass data from Server to Client Components as props

