# CLAUDE.md

Guidelines for AI assistants working on the **OAR Digital Twin Viewer** (`oar-viewer-poc`).

## Product Overview

The OAR Digital Twin Viewer transforms traditional 2D closeout documentation into an interactive 3D experience connected to the BIM model stored in Autodesk Construction Cloud (ACC). This is an **operational tool, not a design tool** — built for plant engineers, operations leadership, and closeout reviewers who have zero BIM knowledge.

The MVP proves that:
1. 3D BIM data can be made operationally useful
2. 2D closeout documents can directly control and navigate a 3D model
3. Revit metadata can drive visualization logic
4. The interface can be simplified enough for non-BIM users

- **License:** MIT (Copyright 2025 rbriles90)
- **Repository:** `rbriles90/oar-viewer-poc`

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **3D Viewer** | Autodesk Platform Services (APS) Viewer | Embedded web viewer, read-only |
| **Frontend** | Custom UI overlay on APS Viewer | HTML/CSS/JS or framework TBD |
| **Backend** | Node.js | APS auth + static JSON serving |
| **Build Tool** | Vite | Dev server and production builds |
| **Language** | TypeScript | Strict mode |
| **Metadata** | Static JSON files | Exported from Revit via CSV → JSON |
| **Auth** | APS OAuth (Autodesk credentials) | Users authenticate with Autodesk accounts |

## Architecture

### Data Flow

```
Revit → CSV Export → JSON → Viewer Mapping → Visual Rule Engine
```

### Key Concepts

- **UniqueId**: Revit's stable element identifier, exported with metadata
- **dbId**: APS Viewer's internal element identifier, resolved at runtime
- **UniqueId → dbId mapping**: The viewer resolves Revit UniqueIds to viewer dbIds to link metadata to 3D geometry
- **Visual Rule Engine**: Applies coloring, isolation, and highlighting based on metadata categories

### Metadata Schema (JSON)

Each equipment element maps:
```json
{
  "uniqueId": "revit-unique-id",
  "equipmentTag": "CON-00182",
  "category": "motor | conveyor | optic",
  "panel": "MCP-01 | MCC-02",
  "supplier": "Stadler | Van Dyk",
  "buildingFlag": true,
  "relationships": {
    "feedsTo": "optional-unique-id",
    "controlledBy": "optional-unique-id"
  }
}
```

## MVP Feature Set

### A. Model Loading & Authentication
- APS OAuth login with Autodesk credentials
- Load coordination model or selected RVT models from ACC
- Single project at a time, read-only — no editing

### B. Default Scene Configuration
- Building geometry **hidden** by default
- Equipment **visible** by default
- "Show Building" toggle button
- Purpose: reduce clutter, present system-level view immediately

### C. Metadata Integration
- Static JSON per project (no live updates, no write-back)
- Viewer maps `uniqueId` → `dbId` at load time
- Visualization rules applied based on metadata fields

### D. Preset Search Modes
Three pre-configured search types instead of free-text global search:

| Search Mode | Search By | Behavior |
|------------|-----------|----------|
| **Conveyor Search** | Conveyor number | Auto-isolate + zoom |
| **Motor Search** | Motor ID | Highlight + metadata display |
| **Optic Search** | Optic number | Zoom + isolate |

Selecting any item: zoom → isolate → highlight → show metadata panel.

### E. Metadata Display Panel
When an element is selected, display:
- Equipment Tag
- Type / Category
- Panel (MCP/MCC)
- Supplier
- Related equipment
- Optional LOTO reference

### F. View Preset Buttons (Closeout Modes)

**1. Lockout / Tagout (LOTO) Mode**
- Color equipment by panel (MCP/MCC)
- Highlight related motors and conveyors
- Replicates lockout drawing in 3D

**2. Supplier Identification Mode**
- Color equipment by supplier (Stadler, Van Dyk, etc.)
- Filter by supplier

**3. MCC Panel Isolation**
- Select MCC panel → highlight controlled equipment → hide unrelated

### G. Process Flow Diagram (PFD) Navigation
The most strategic MVP feature:
- PFD displayed inside the viewer
- Clicking a conveyor tag (e.g., `CON-00182`) on the PFD zooms to the corresponding 3D element
- Users navigate via the diagram they already understand
- Must be intuitive for non-technical users

## Planned Project Structure

```
oar-viewer-poc/
├── public/                  # Static assets (PFD images, icons)
│   └── data/                # Static JSON metadata files per project
├── src/
│   ├── server/              # Node.js backend
│   │   ├── auth/            # APS OAuth authentication
│   │   └── routes/          # API routes (model URN, metadata serving)
│   ├── client/              # Frontend application
│   │   ├── viewer/          # APS Viewer initialization and extensions
│   │   ├── ui/              # Custom overlay UI components
│   │   │   ├── search/      # Preset search panels
│   │   │   ├── metadata/    # Metadata display panel
│   │   │   ├── presets/     # View preset buttons (LOTO, Supplier, MCC)
│   │   │   └── pfd/         # Process Flow Diagram navigation
│   │   ├── mapping/         # UniqueId → dbId resolution
│   │   └── rules/           # Visual rule engine (coloring, isolation)
│   └── shared/              # Shared types and constants
├── .env.example             # Required environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `APS_CLIENT_ID` | Autodesk Platform Services client ID |
| `APS_CLIENT_SECRET` | APS client secret |
| `APS_CALLBACK_URL` | OAuth callback URL |

## Conventions

### Code Style
- TypeScript with strict mode
- Prefer named exports over default exports
- ESLint + Prettier for formatting
- Files should be focused and single-purpose

### Naming
- Equipment metadata fields: `camelCase` (`equipmentTag`, `buildingFlag`)
- Search modes and view presets: descriptive constants (`LOTO_MODE`, `SUPPLIER_MODE`, `MCC_ISOLATION`)
- Viewer extension classes: `PascalCase` (e.g., `MetadataPanel`, `PfdNavigator`)

### Git
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Atomic commits — one logical change per commit

### Environment Variables
- Never commit `.env` files
- Document all required variables in `.env.example`

### Testing
- Test files adjacent to source or in `__tests__/` directories
- Focus on logic: metadata mapping, visual rule engine, search filtering
- Integration tests for APS Viewer interactions where feasible

## Explicitly Out of Scope (MVP)

Do NOT implement or introduce:
- Live IoT sensor feeds
- Real-time mass balance updates
- Gray Parrot integration
- Autodesk Tandem integration
- Model editing capabilities
- Full digital twin analytics
- AI/LLM assistant features
- Free-text global search (use preset search modes only)

These are roadmap items for future versions.

## Target Users

Build for these people:
1. **Operations leadership** — need overview, not detail
2. **Optimization team** — need to trace equipment relationships
3. **Plant engineers** — need to locate and understand equipment
4. **Closeout reviewers** — need interactive replacements for static drawings

NOT for: BIM managers, designers, or developers. Prioritize simplicity over power-user features.

## MVP Success Criteria

The MVP is successful when a user can:
1. Load the model from ACC
2. Click a conveyor on the PFD and instantly see it in 3D
3. Toggle LOTO mode and understand panel relationships visually
4. Search for a motor and locate it without confusion
5. Navigate the entire interface without needing BIM knowledge
