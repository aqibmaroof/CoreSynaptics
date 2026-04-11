# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoreSynaptics (internal name: "wild-tag") is an ERP / Mission Control Dashboard built with Next.js 16 (App Router) and React 19. It's a client-side-heavy application — there is no Redux store; state is managed locally in components. Auth tokens are stored in localStorage.

## Commands

- **Dev server:** `npm run dev` (runs on localhost:3000, expects backend API at localhost:3001)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint 9, flat config in `eslint.config.mjs`)
- **No test framework is configured.**

## Architecture

### Routing (`app/`)

Next.js App Router. Each route directory contains a `page.tsx` or `page.jsx` that typically imports a `Layout` wrapper and a container component. Dynamic routes use bracket notation (e.g., `app/ProjectDetails/[parentCategory]/[type]/[id]/`).

### Containers (`containers/`)

Page-level business logic. Each container (e.g., `containers/Projects/`, `containers/Finance/`) holds the main UI and data-fetching for its corresponding route. `containers/Layout/index.jsx` is the shared shell (sidebar + top nav) — pages wrap their content with `<Layout>`.

### Components (`components/`)

Reusable UI: `sidebar/`, `EntityModal/`, `Cards/`, `Modals/`, `StatusDropDown/`, `RequiredFlow/`, etc.

**RequiredFlow design system** (`components/RequiredFlow/`) is a custom in-house UI kit. Use `rf-*` CSS class prefixes (e.g., `rf-btn rf-btn-primary`, `rf-card`, `rf-badge-green`) defined via CSS variables in `globals.css`. Helper functions and class-name constants live in `Utils/requiredFlowUtils.ts`. Prefer these over raw Tailwind when building new UI that fits existing patterns.

### Services (`services/`)

API layer. Each domain file (e.g., `services/auth.jsx`, `services/Projects/`, `services/Tasks/`) exports async functions that call `sendRequest()`.

**Request pipeline:** `sendRequest` → `axiosConfig` (interceptors for auth token attachment + 401 refresh) → `axiosInstance` (base Axios instance using `NEXT_PUBLIC_API_URL`). Token management lives in `services/instance/tokenService.jsx` (localStorage-based).

### Utils (`Utils/`)

Helpers: `DateFormater/`, `NumberFormatter/`, `CustomProgress/`, `companyDropdown/`, `requiredFlowUtils.ts`, and `dashboardConfig.js`.

`dashboardConfig.js` exports static/mock data generators (`getDashboardConfig`, `getChecklistData`, etc.) keyed by role string — these are **not** live API calls.

### Config (`config/index.jsx`)

Static asset paths (brand images, icons, illustrations).

## Role-Based Access Control

Roles are defined as constants in `components/sidebar/sideBarData.js` (`ROLES` object). The system has two tenant types:

- **GC (General Contractor):** `gc_pm`, `gc_admin`, `superintendent`
- **OEM:** `oem_pm`, `oem_admin`, `fsm` (Field Service Manager), `fse` (Field Service Engineer)
- **Cross-tenant:** `qa_manager`, `safety_officer`, `finance`, `executive`, `SUPERADMIN`

Each sidebar item has a `roles` array. `getMenuByRole(role)` filters visible items. Different roles land on different dashboards (`/`, `/OEM/Dashboard`, `/Dispatch/Dashboard`, `/Field/Dashboard`, etc.).

Many routes in `app/` are placeholder stubs — the actual logic is in the corresponding `containers/` directory.

## Styling

- Tailwind CSS 4 + DaisyUI 5 for components
- **RequiredFlow design system**: `rf-*` CSS classes backed by CSS custom properties (`--rf-bg`, `--rf-txt`, `--rf-accent`, `--rf-green`, `--rf-red`, etc.) in `globals.css`
- Some SCSS modules (e.g., `sidebar/style.module.scss`)
- Bootstrap / react-bootstrap also present as a dependency
- Default font: Gilroy

## Key Conventions

- Files are `.jsx` (not `.tsx`) — TypeScript is configured but most code is plain JS
- The `@/` import alias maps to project root
- All pages are client components (`"use client"`) wrapped in `<Layout>`
- S3 images hosted on `wildtag-s3-bucket.s3.eu-north-1.amazonaws.com` (allowed in next.config.ts)
- Charts use `react-apexcharts`
