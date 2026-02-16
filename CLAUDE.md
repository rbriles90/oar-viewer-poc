# CLAUDE.md

Guidelines for AI assistants working on the **oar-viewer-poc** (Digital Twin Viewer) project.

## Project Overview

This is a proof-of-concept Digital Twin Viewer application. The project is in its early setup phase — no source code, package.json, or build configuration has been committed yet. Contributions should establish clean foundations for a modern web application.

- **License:** MIT (Copyright 2025 rbriles90)
- **Repository:** `rbriles90/oar-viewer-poc`

## Repository Structure

```
oar-viewer-poc/
├── .gitignore        # Comprehensive Node.js/web project ignore rules
├── LICENSE           # MIT license
├── README.md         # Project description ("Digital Twin Viewer")
└── CLAUDE.md         # This file
```

The `.gitignore` is configured for a Node.js/TypeScript web project and includes patterns for:
- Node modules and package manager artifacts (npm, yarn, pnpm)
- Build outputs (`dist/`, `.next/`, `.nuxt/`, `.svelte-kit/`)
- Vite build cache and logs
- TypeScript build info (`*.tsbuildinfo`)
- Environment files (`.env`, `.env.*`)
- Test coverage (`coverage/`, `.nyc_output/`)
- Linting caches (`.eslintcache`, `.stylelintcache`)

## Tech Stack (Planned)

Based on project configuration signals, the intended stack is:
- **Runtime:** Node.js
- **Language:** TypeScript (indicated by `.tsbuildinfo` in `.gitignore`)
- **Build tool:** Vite (indicated by `vite.config.js/ts` patterns in `.gitignore`)
- **Package manager:** npm, yarn, or pnpm (all supported by `.gitignore`)

No framework has been selected yet. When scaffolding the project, choose tooling consistent with the `.gitignore` patterns already in place.

## Development Setup

> **Note:** No `package.json` exists yet. The following will apply once the project is scaffolded.

Expected workflow:
```bash
# Install dependencies
npm install        # or yarn / pnpm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Conventions to Follow

### Code Style
- Use TypeScript with strict mode enabled
- Prefer named exports over default exports
- Use ESLint and Prettier for consistent formatting
- Keep files focused and single-purpose

### Git Practices
- Write clear, descriptive commit messages
- Use conventional commit format when possible (`feat:`, `fix:`, `chore:`, `docs:`, etc.)
- Keep commits atomic — one logical change per commit

### Environment Variables
- Store secrets and configuration in `.env` files (never commit these)
- Provide a `.env.example` file documenting required variables (without actual values)

### Testing
- Write tests alongside features
- Place test files adjacent to source files or in a `__tests__/` directory
- Target meaningful coverage — focus on logic and edge cases, not boilerplate

## Project Status

This repository is in initial setup. Key bootstrapping tasks include:
1. Initialize `package.json` with project metadata and scripts
2. Select and configure a frontend framework
3. Set up TypeScript configuration (`tsconfig.json`)
4. Configure Vite as the build tool
5. Set up ESLint and Prettier
6. Create initial application structure
7. Add CI/CD pipeline (GitHub Actions)

## Key Decisions Still Pending

When working on this project, be aware that these choices have not been finalized:
- Frontend framework (React, Vue, Svelte, etc.)
- State management approach
- 3D rendering library for digital twin visualization (Three.js, Babylon.js, etc.)
- API/backend architecture
- Deployment target

Ask the project maintainer before making opinionated framework or architecture choices.
