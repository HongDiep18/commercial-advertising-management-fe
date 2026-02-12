# VN Buyer Guide - React + TypeScript + Vite

This is a React application built with TypeScript and Vite for the Vietnam Buyer Guide platform.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
vn-buyer-guide/
├── src/
│   ├── pages/                    # Các trang chính
│   │   ├── LandingPage.tsx       # Trang chủ
│   │   └── AboutPage.tsx         # Trang About Us (mới tạo)
│   │
│   ├── components/               # Components tái sử dụng
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx       # Header (đã cập nhật dùng Link)
│   │   │   ├── Footer.tsx
│   │   │   └── LanguageSelector.tsx
│   │   │
│   │   ├── landing/              # Components cho Landing Page
│   │   │   ├── HeroSection.tsx
│   │   │   ├── SearchSection.tsx
│   │   │   ├── FeaturedCompanies.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   └── StickyBottomBanner.tsx
│   │   │
│   │   ├── about/                # Components cho About Page (tạo khi cần)
│   │   │   └── (các components riêng cho About)
│   │   │
│   │   └── ui/                   # UI components tái sử dụng
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Badge.tsx
│   │
│   ├── assets/                   # Assets (images, fonts, etc.)
│   │   └── images/
│   │
│   ├── App.tsx                   # App component với routing
│   └── main.tsx                  # Entry point
│
└── package.json

## Docker Setup

This project includes Docker configuration for containerized deployment. Here's how to use it:

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (optional, but recommended)

### Quick Start with Docker Compose (Easiest)

```bash
# Build and start the container
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build

# Stop the container
docker-compose down
```
