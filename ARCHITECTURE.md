# Sudoku Web - Modular Turborepo Architecture (v2.0.0)

## Overview

Sudoku Web has been refactored into a **modular monorepo** using Turborepo, enabling independent development, testing, and deployment of packages while maintaining a cohesive architecture.

## Package Structure

```
packages/
├── auth/          (@sudoku-web/auth)       - Authentication & user management
├── ui/            (@sudoku-web/ui)         - Reusable UI components & theming
├── sudoku/        (@sudoku-web/sudoku)     - Sudoku game logic & components
├── template/      (@sudoku-web/template)   - Party/session management (game-agnostic)
├── shared/        (@sudoku-web/shared)     - Generic utilities & helpers
└── types/         (@sudoku-web/types)      - Shared type definitions

apps/
├── app-template/  - Template app (standalone, no game logic)
└── app-sudoku/    - Sudoku game app (extends template)
```

## Package Responsibilities

### @sudoku-web/auth
**Responsibility**: User authentication and account management

**Exports**:
- `AuthProvider` - React context provider for authentication state
- `UserContext` - Authentication context
- Components: `HeaderUser`, `UserAvatar`, `UserButton`, `UserPanel`, `DeleteAccountDialog`
- Services: PKCE OAuth helpers, platform detection (Capacitor, Electron)
- Types: User, AuthToken, SessionState

**Key Features**:
- OAuth 2.0 with PKCE flow
- Multi-platform support (web, iOS, Android, Electron)
- Session persistence and recovery
- Platform-specific deep linking

**Dependencies**:
- React 18+
- Next.js 14+
- Capacitor 6+ (for mobile)

---

### @sudoku-web/ui
**Responsibility**: Shared UI components and theming

**Exports**:
- Components: `Header`, `Footer`, `HeaderBack`, `ThemeControls`, `ThemeSwitch`, `ThemeColorSwitch`
- Providers: `ThemeColorProvider`, `useThemeColor` hook
- Helpers: Platform detection (`isCapacitor`, `isIOS`, `isAndroid`)
- Types: `ThemeConfig`

**Key Features**:
- Dark/light mode toggle with `next-themes`
- Customizable theme colors
- Game-agnostic header/footer (configurable via props)
- Responsive design with Tailwind CSS 4.0

**Dependency Graph**:
```
@sudoku-web/ui
  └── next-themes
  └── tailwindcss
  └── @headlessui/react
```

---

### @sudoku-web/template
**Responsibility**: Generic party/collaboration features and shared providers

**Exports**:
- Providers: `CapacitorProvider`, `FetchProvider`, `GlobalStateProvider`, `RevenueCatProvider`, `UserProvider`, `PartyProvider`
- Hooks: `useLocalStorage`, `useServerStorage`, `useOnline`, `useFetch`, `useDocumentVisibility`, `useWakeLock`
- Components: `ErrorBoundary`, `AppDownloadModal`, `GlobalErrorHandler`
- Utilities: `dailyActionCounter`, `playerColors`, time calculations
- Types: `Party`, `PartyMember`, `Session`, `PartyInvitation`, subscription types
- Config: `dailyLimits`, `premiumFeatures`

**Key Features**:
- Generic party/session management (not game-specific)
- Platform helpers (Capacitor, Electron)
- Revenue Cat integration for subscriptions
- Server state synchronization
- Error handling and recovery

**Dependency Graph**:
```
@sudoku-web/template
  ├── @sudoku-web/auth (provides authentication)
  ├── @sudoku-web/ui (provides UI components)
  ├── @sudoku-web/shared (provides utilities)
  └── @sudoku-web/types (provides types)
```

---

### @sudoku-web/sudoku
**Responsibility**: Sudoku game logic, components, and algorithms

**Exports**:
- Components: `NumberPad`, `TimerDisplay`, `TrafficLight`, (others are app-specific)
- Helpers: `checkCell`, `checkGrid`, `isInitialCell`, `calculateCompletionPercentage`, `puzzleTextToPuzzle`, cell calculations
- Hooks: `useTimer`, (others are app-specific)
- Utilities: `dailyPuzzleCounter`
- Types: `Cell`, `SudokuGrid`, `SudokuState`, `Notes`, `Puzzle`, etc.

**Key Features**:
- Sudoku puzzle solving and validation
- Puzzle generation and parsing
- Cell and grid helpers for puzzle manipulation
- Race/multiplayer game types and rankings
- Daily puzzle tracking

**Note**: Some components (SudokuBox, Sudoku, SimpleSudoku, RaceTrack, useGameState) have app-specific dependencies and are not exported. Apps can use these as templates or implement their own.

**Dependency Graph**:
```
@sudoku-web/sudoku (self-contained)
  └── Can use from @sudoku-web/template for generic utilities
```

---

### @sudoku-web/shared
**Responsibility**: Generic utilities with no application-specific logic

**Exports**:
- Time utilities: `calculateSeconds`, `formatSeconds`
- Platform helpers: Capacitor and Electron detection
- Date and string utilities

**No Dependencies**: Truly generic - can be used standalone

---

### @sudoku-web/types
**Responsibility**: Shared type definitions used across packages

**Exports**:
- Generic types: `User`, `AuthToken`, `Session<T>`, `Party`, etc.
- Uses TypeScript generics for flexibility

**No Dependencies**: Pure type definitions only

---

## Application Structure

### app-template (@sudoku-web/app-template)
**Purpose**: Standalone authentication, parties, and session management app

**Features**:
- User registration and login
- Profile management
- Party creation and member invitations
- Session tracking
- **Zero game-specific code** - can be extended for any collaborative app

**Imports From**:
- `@sudoku-web/auth` - User authentication
- `@sudoku-web/ui` - UI components and theming
- `@sudoku-web/template` - Collaboration features

**Build Command**: `npm run build:template`

---

### app-sudoku (@sudoku-web/app-sudoku)
**Purpose**: Sudoku game application extending template foundation

**Features**:
- All template app features (auth, parties, collaboration)
- Sudoku puzzle playing
- Multiplayer racing
- Daily puzzles
- Premium features (unlimited puzzles, hints, etc.)

**Imports From**:
- `@sudoku-web/auth` - User authentication
- `@sudoku-web/ui` - UI components and theming
- `@sudoku-web/template` - Collaboration features
- `@sudoku-web/sudoku` - Game logic

**Build Command**: `npm run build:sudoku`

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                   app-sudoku                                │
└──────────────────────────────────────────────────────────────┘
       ↓              ↓              ↓              ↓
   @auth       @ui           @template        @sudoku
       ↓        ↓              ↓ ↓ ↓           ↓
   ┌───────────────────────────────────────────────┐
   │         @shared (generic utilities)          │
   │         @types  (shared types)               │
   └───────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                 app-template                      │
└──────────────────────────────────────────────────┘
       ↓              ↓              ↓
   @auth        @ui           @template
       ↓         ↓              ↓ ↓ ↓
   ┌───────────────────────────────────────────────┐
   │         @shared (generic utilities)          │
   │         @types  (shared types)               │
   └───────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Why Separate Packages?

- **@sudoku-web/auth**: Complex, security-critical, reusable across apps
- **@sudoku-web/ui**: Shared styling and components ensure consistency
- **@sudoku-web/sudoku**: Game logic is specific to sudoku; extracted for clarity
- **@sudoku-web/template**: Generic collaboration features, not game-specific
- **@sudoku-web/shared**: Utilities needed by multiple packages
- **@sudoku-web/types**: Centralized type definitions

### 2. No Circular Dependencies

```
✓ @sudoku-web/shared has NO dependencies (can import into any package)
✓ @sudoku-web/types has NO dependencies (pure types)
✓ @sudoku-web/auth → @sudoku-web/shared (only)
✓ @sudoku-web/ui → @sudoku-web/shared (only)
✓ @sudoku-web/sudoku → @sudoku-web/shared (optional)
✓ @sudoku-web/template → @sudoku-web/auth, @sudoku-web/ui, @sudoku-web/shared
✗ No package imports from apps
✗ No circular imports between packages
```

### 3. Template is Game-Agnostic

The template package can be used to build any collaborative app:
- Party management
- Session tracking
- Member invitations
- Authentication flow
- Premium features

The sudoku-specific logic is isolated in the `@sudoku-web/sudoku` package.

### 4. Public API Design

Each package explicitly exports its public API via `src/index.ts`:
- Components are exported (not internal implementation details)
- Internal helpers are not exported
- Types are clearly marked as `export type`

---

## Creating a New App

To create a new app using this architecture:

```typescript
// 1. Create apps/my-app/package.json with dependencies:
{
  "dependencies": {
    "@sudoku-web/auth": "*",
    "@sudoku-web/ui": "*",
    "@sudoku-web/template": "*"
  }
}

// 2. Wrap your app with providers (same as template app)
import { AuthProvider } from '@sudoku-web/auth';
import { ThemeColorProvider } from '@sudoku-web/ui';
import { PartyProvider } from '@sudoku-web/template';

<AuthProvider useFetch={useFetch}>
  <ThemeColorProvider>
    <PartyProvider>
      <YourApp />
    </PartyProvider>
  </ThemeColorProvider>
</AuthProvider>

// 3. Use components and hooks from packages
import { Header, Footer } from '@sudoku-web/ui';
import { useParty } from '@sudoku-web/template';
```

---

## Migration Guide (v1.x → v2.0.0)

### Breaking Changes

1. **Import Paths Changed**

```javascript
// v1.x (old monolith)
import { useAuth } from './hooks/auth';
import { Header } from './components/Header';
import { UserProvider } from './providers';

// v2.0.0 (new packages)
import { useAuth, AuthProvider } from '@sudoku-web/auth';
import { Header } from '@sudoku-web/ui';
import { UserProvider } from '@sudoku-web/template';
```

2. **App Names Changed**

```bash
# v1.x
npm run build:sudoku     # built @sudoku-web/sudoku (the app)

# v2.0.0
npm run build:sudoku     # builds @sudoku-web/app-sudoku (the app)
npm run build            # builds @sudoku-web/sudoku (the package) + @sudoku-web/app-sudoku (app)
```

3. **AuthProvider Props Changed**

```typescript
// v1.x
<UserProvider>{children}</UserProvider>

// v2.0.0 (dependency injection pattern)
<AuthProvider useFetch={useFetch}>
  {children}
</AuthProvider>
```

### Migration Checklist

- [ ] Update import statements to use package aliases
- [ ] Update AuthProvider to accept useFetch prop
- [ ] Update app package.json to depend on new packages
- [ ] Test that app builds successfully
- [ ] Run test suite
- [ ] Verify TypeScript compilation passes

---

## Development Workflow

### Building All Packages
```bash
npm run build
```

### Building Specific App
```bash
npm run build:template
npm run build:sudoku
```

### Running Dev Server
```bash
npm run dev:template
npm run dev:sudoku
npm run dev              # runs both in parallel
```

### Testing
```bash
npm test                 # run all tests
npm test -w @sudoku-web/auth
npm test -w @sudoku-web/app-sudoku
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

---

## Constitutional Requirements

This architecture maintains compliance with the Sudoku Web Constitution v1.0.0:

✅ **Test-First Development**: All packages have >99% test pass rate (1,711+ tests)

✅ **Full TypeScript Type Safety**: Strict mode enabled, all packages type-check

✅ **Component-Driven Architecture**: Functional components and hooks throughout

✅ **Multi-Platform Compatibility**: Web, iOS (Capacitor), Android (Capacitor), Electron

✅ **User-Centric Design & Accessibility**: WCAG 2.1 compliance maintained

✅ **Version Management**: Major version bump (v2.0.0) documented

---

## Future Improvements

1. **Package Publishing**: Publish packages to npm for external use
2. **Shared UI Component Library**: Extended component library
3. **API Package**: Extract API client logic
4. **State Management**: Consider Redux, Zustand, or Jotai integration
5. **E2E Testing**: Add Cypress or Playwright tests
6. **Documentation Site**: Generate docs from JSDoc comments

---

## Support & Questions

For questions about the architecture, refer to:
- `/README.md` - Project overview
- `MIGRATION.md` - Upgrade guide from v1.x
- Package-specific `README.md` files in `packages/*/README.md`
- `/specs/003-modular-turborepo-architecture/` - Specification documents
