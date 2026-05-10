# VN Buyer's Guide - Frontend

Frontend application for the VN Buyer's Guide platform.  
It provides directory browsing, news consumption, account flows, and admin interfaces for multilingual users.

## Portfolio Highlights

- Developed with Next.js App Router and TypeScript for modern SSR/CSR hybrid rendering
- Implemented multilingual UX (`zh-TW`, `en-US`, `vi-VN`) for cross-market accessibility
- Structured frontend APIs with service + hook layers for maintainable data access
- Built responsive UI with Tailwind CSS and reusable component patterns

## Product Scope

This frontend includes:

- Public business directory experiences
- News pages consuming backend translation pipeline output
- User account and authentication-related screens
- Admin-facing management pages

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Internationalization: `zh-TW`, `en-US`, `vi-VN`

## Frontend Architecture

- **App Layer:** Next.js routes and layouts (server-first by default)
- **UI Layer:** reusable components and feature-level composition
- **Data Layer:** API module pattern with typed services and hooks
- **State Strategy:** server state through query hooks, local state only for UI concerns

## Backend Integration

- Connects to VN Buyer Guide backend APIs
- Uses typed request/response models for feature modules
- Supports authenticated and public endpoints based on route requirements

## Getting Started

### Prerequisites

- Node.js LTS
- pnpm
- Optional: Docker

### Local development

```bash
pnpm install
pnpm run dev
```

Application runs at:

- `http://localhost:3000`

## Scripts


| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm install`   | Install dependencies     |
| `pnpm run dev`   | Start development server |
| `pnpm run build` | Build for production     |
| `pnpm run start` | Run production build     |
| `pnpm run lint`  | Run ESLint               |


## Docker

```bash
docker-compose up --build
docker-compose up -d --build
docker-compose down
```

## Verification Email Preview

After admin approves a company account request, the system sends an email so the user can verify and set their password.

Admin approval account verification email

## Company Advertising Order Preview

This modal allows a company to place an advertising order, choose package duration, set schedule, and upload advertising material.

Company advertising order item form

## Company Advertising Success Result

After a company advertising campaign is submitted and approved, the system displays the advertising result popup to end users.

Company advertising success result popup

## Suggested Recruiter Add-ons

To strengthen your job application README, add:

- Home, directory, news, and admin screenshots
- Short user journey (search company -> view details -> read related news)
- Performance notes (e.g., server components, route-level rendering decisions)
- Your personal contribution section (features you implemented, key challenges, outcomes)