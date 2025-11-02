# Migration Guide: v1.x to v2.0.0

This guide helps you migrate from the monolithic v1.x architecture to the modular v2.0.0 package-based architecture.

## Overview of Changes

Version 2.0.0 introduces a complete architectural refactoring:

- **Monolithic app** → **Modular package-based monorepo**
- **Single codebase** → **6 independent packages + 2 apps**
- **Relative imports** → **Package imports with type safety**
- **Tight coupling** → **Clear separation of concerns**

## Breaking Changes

### 1. Import Paths

All imports must now use package aliases instead of relative paths.

#### Authentication

```typescript
// ❌ v1.x (old)
import { useAuth } from './hooks/auth';
import { UserProvider } from './providers/UserProvider';
import { pkce } from './services/pkce';

// ✅ v2.0.0 (new)
import { useAuth, AuthProvider, pkce } from '@sudoku-web/auth';
```

#### UI Components

```typescript
// ❌ v1.x (old)
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ThemeSwitch } from './components/ThemeSwitch';

// ✅ v2.0.0 (new)
import { Header, Footer, ThemeSwitch } from '@sudoku-web/ui';
```

#### Template/Party Management

```typescript
// ❌ v1.x (old)
import { PartyProvider } from './providers/PartyProvider';
import { useLocalStorage } from './hooks/localStorage';
import { ErrorBoundary } from './components/ErrorBoundary';

// ✅ v2.0.0 (new)
import {
  PartyProvider,
  useLocalStorage,
  ErrorBoundary
} from '@sudoku-web/template';
```

#### Sudoku Logic

```typescript
// ❌ v1.x (old)
import { checkGrid, checkCell } from './helpers/checkAnswer';
import { useTimer } from './hooks/timer';
import { NumberPad } from './components/NumberPad';

// ✅ v2.0.0 (new)
import {
  checkGrid,
  checkCell,
  useTimer,
  NumberPad
} from '@sudoku-web/sudoku';
```

### 2. Provider Names and Props

Some providers have been renamed for consistency:

```typescript
// ❌ v1.x (old)
<UserProvider>
  <App />
</UserProvider>

// ✅ v2.0.0 (new)
import { useFetch } from '@sudoku-web/template';

<AuthProvider useFetch={useFetch}>
  <App />
</AuthProvider>
```

**Key Changes:**
- `UserProvider` → `AuthProvider` (in @sudoku-web/auth)
- `AuthProvider` now requires `useFetch` prop (dependency injection)
- `UserProvider` in @sudoku-web/template is now a different provider for user profile state

### 3. App Names and Build Commands

```bash
# ❌ v1.x (old)
npm run build:sudoku     # built the sudoku app

# ✅ v2.0.0 (new)
npm run build:sudoku     # builds @sudoku-web/app-sudoku
npm run build:template   # builds @sudoku-web/app-template
npm run build            # builds all packages and apps
```

### 4. File Structure

```
# ❌ v1.x (old)
src/
├── components/
├── hooks/
├── pages/
├── providers/
└── services/

# ✅ v2.0.0 (new)
packages/
├── auth/              # Authentication package
├── ui/                # UI components package
├── template/          # Template/party package
├── sudoku/            # Sudoku logic package
├── shared/            # Shared utilities
└── types/             # Shared types

apps/
├── template/          # Template app
└── sudoku/            # Sudoku app
```

### 5. TypeScript Configuration

```json
// v1.x used standard Next.js paths
// v2.0.0 uses workspace packages

// tsconfig.json now includes:
{
  "compilerOptions": {
    "paths": {
      "@sudoku-web/auth": ["./packages/auth/src"],
      "@sudoku-web/ui": ["./packages/ui/src"],
      "@sudoku-web/template": ["./packages/template/src"],
      "@sudoku-web/sudoku": ["./packages/sudoku/src"],
      "@sudoku-web/shared": ["./packages/shared/src"],
      "@sudoku-web/types": ["./packages/types/src"]
    }
  }
}
```

## Migration Steps

### Step 1: Update Package Dependencies

Add package dependencies to your app's `package.json`:

```json
{
  "dependencies": {
    "@sudoku-web/auth": "*",
    "@sudoku-web/ui": "*",
    "@sudoku-web/template": "*",
    "@sudoku-web/sudoku": "*"
  }
}
```

Then run:
```bash
npm install
```

### Step 2: Update Import Statements

Use a find-and-replace strategy to update imports:

#### Authentication Imports

```bash
# Find old imports
grep -r "from '.*\/hooks\/auth'" src/
grep -r "from '.*\/providers\/UserProvider'" src/

# Replace with
from '@sudoku-web/auth'
```

#### UI Imports

```bash
# Find old imports
grep -r "from '.*\/components\/(Header|Footer)" src/

# Replace with
from '@sudoku-web/ui'
```

#### Template/Party Imports

```bash
# Find old imports
grep -r "from '.*\/providers\/PartyProvider'" src/

# Replace with
from '@sudoku-web/template'
```

#### Sudoku Imports

```bash
# Find old imports
grep -r "from '.*\/helpers\/checkAnswer'" src/
grep -r "from '.*\/components\/NumberPad'" src/

# Replace with
from '@sudoku-web/sudoku'
```

### Step 3: Update Provider Setup

Update your root app component:

```typescript
// ❌ v1.x (old)
import { UserProvider } from './providers/UserProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { PartyProvider } from './providers/PartyProvider';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <PartyProvider>
          <Routes />
        </PartyProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// ✅ v2.0.0 (new)
import { AuthProvider } from '@sudoku-web/auth';
import { ThemeColorProvider } from '@sudoku-web/ui';
import {
  PartyProvider,
  UserProvider,
  useFetch
} from '@sudoku-web/template';

function App() {
  return (
    <ThemeColorProvider>
      <AuthProvider useFetch={useFetch}>
        <UserProvider>
          <PartyProvider>
            <Routes />
          </PartyProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeColorProvider>
  );
}
```

### Step 4: Update Context Usage

```typescript
// ❌ v1.x (old)
import { useContext } from 'react';
import { UserContext } from './providers/UserProvider';

const { user } = useContext(UserContext);

// ✅ v2.0.0 (new)
import { useContext } from 'react';
import { UserContext } from '@sudoku-web/auth';

const { user } = useContext(UserContext);
```

### Step 5: Test Your Application

```bash
# Type checking
npm run type-check

# Run tests
npm test

# Build the app
npm run build

# Run in development
npm run dev
```

## Migration Checklist

Use this checklist to ensure a complete migration:

- [ ] **Dependencies**
  - [ ] Add package dependencies to `package.json`
  - [ ] Run `npm install`
  - [ ] Verify no errors in package installation

- [ ] **Import Statements**
  - [ ] Update authentication imports to `@sudoku-web/auth`
  - [ ] Update UI component imports to `@sudoku-web/ui`
  - [ ] Update party/template imports to `@sudoku-web/template`
  - [ ] Update sudoku logic imports to `@sudoku-web/sudoku`
  - [ ] Remove old relative import paths

- [ ] **Provider Setup**
  - [ ] Update `AuthProvider` (formerly `UserProvider`)
  - [ ] Add `useFetch` prop to `AuthProvider`
  - [ ] Update provider nesting order
  - [ ] Verify all required providers are present

- [ ] **Context Usage**
  - [ ] Update `UserContext` imports
  - [ ] Update `PartyContext` imports
  - [ ] Update other context imports

- [ ] **Type Definitions**
  - [ ] Update type imports from packages
  - [ ] Remove duplicate type definitions
  - [ ] Verify TypeScript compilation

- [ ] **Build & Test**
  - [ ] Run `npm run type-check` (should pass)
  - [ ] Run `npm run lint` (should pass)
  - [ ] Run `npm test` (all tests should pass)
  - [ ] Run `npm run build` (should build successfully)
  - [ ] Test app functionality in browser

- [ ] **Platform Builds**
  - [ ] Test web build: `npm run build`
  - [ ] Test iOS build: `npm run build:ios` (if applicable)
  - [ ] Test Android build: `npm run build:android` (if applicable)
  - [ ] Test Electron build: `npm run build:electron` (if applicable)

## Common Migration Issues

### Issue 1: Module Not Found

**Error:**
```
Module not found: Can't resolve '@sudoku-web/auth'
```

**Solution:**
1. Verify package is listed in `package.json` dependencies
2. Run `npm install`
3. Restart your dev server

### Issue 2: Type Errors

**Error:**
```
Property 'useFetch' is missing in type 'AuthProviderProps'
```

**Solution:**
Update `AuthProvider` to include `useFetch` prop:

```typescript
import { useFetch } from '@sudoku-web/template';

<AuthProvider useFetch={useFetch}>
  {children}
</AuthProvider>
```

### Issue 3: Circular Dependency

**Error:**
```
Circular dependency detected
```

**Solution:**
- Ensure packages only import from lower-level packages
- Never import from apps into packages
- Use the dependency graph in ARCHITECTURE.md as reference

### Issue 4: Old Provider Names

**Error:**
```
UserProvider is not exported from '@sudoku-web/auth'
```

**Solution:**
- In v2.0.0, `AuthProvider` is the authentication provider
- `UserProvider` is now in `@sudoku-web/template` for user profile state
- Update imports accordingly

## Before/After Examples

### Example 1: Authentication Flow

```typescript
// ❌ v1.x (old)
import { useAuth } from './hooks/auth';
import { UserProvider } from './providers/UserProvider';

function App() {
  return (
    <UserProvider>
      <AuthenticatedApp />
    </UserProvider>
  );
}

function AuthenticatedApp() {
  const { user, login, logout } = useAuth();
  // ...
}

// ✅ v2.0.0 (new)
import { useContext } from 'react';
import { AuthProvider, UserContext } from '@sudoku-web/auth';
import { useFetch } from '@sudoku-web/template';

function App() {
  return (
    <AuthProvider useFetch={useFetch}>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { user, login, logout } = useContext(UserContext);
  // ...
}
```

### Example 2: Party Management

```typescript
// ❌ v1.x (old)
import { PartyProvider } from './providers/PartyProvider';
import { useParty } from './hooks/party';

function App() {
  return (
    <PartyProvider>
      <PartyList />
    </PartyProvider>
  );
}

function PartyList() {
  const { parties } = useParty();
  // ...
}

// ✅ v2.0.0 (new)
import { useContext } from 'react';
import { PartyProvider, PartyContext } from '@sudoku-web/template';

function App() {
  return (
    <PartyProvider>
      <PartyList />
    </PartyProvider>
  );
}

function PartyList() {
  const { parties } = useContext(PartyContext);
  // ...
}
```

### Example 3: Sudoku Game

```typescript
// ❌ v1.x (old)
import { NumberPad } from './components/NumberPad';
import { useTimer } from './hooks/timer';
import { checkGrid } from './helpers/checkAnswer';

function SudokuGame() {
  const timer = useTimer();
  const isComplete = checkGrid(grid);

  return (
    <div>
      <NumberPad onSelect={handleSelect} />
    </div>
  );
}

// ✅ v2.0.0 (new)
import {
  NumberPad,
  useTimer,
  checkGrid
} from '@sudoku-web/sudoku';

function SudokuGame() {
  const timer = useTimer();
  const isComplete = checkGrid(grid);

  return (
    <div>
      <NumberPad onSelect={handleSelect} />
    </div>
  );
}
```

## Benefits of v2.0.0

After migration, you'll enjoy:

- ✅ **Better type safety** - Explicit package boundaries with TypeScript
- ✅ **Clearer dependencies** - Understand what depends on what
- ✅ **Faster builds** - Incremental builds with Turborepo
- ✅ **Easier testing** - Test packages independently
- ✅ **Better code organization** - Clear separation of concerns
- ✅ **Reusable packages** - Use packages in multiple apps
- ✅ **Independent versioning** - Update packages independently

## Getting Help

If you encounter issues during migration:

1. **Check the documentation:**
   - [ARCHITECTURE.md](/home/node/sudoku-web/ARCHITECTURE.md) - Package architecture
   - [README.md](/home/node/sudoku-web/README.md) - Project overview
   - Package READMEs - Individual package documentation

2. **Verify your setup:**
   - Run `npm run type-check` to find type errors
   - Run `npm run lint` to find code issues
   - Check browser console for runtime errors

3. **Search for patterns:**
   - Look at the template or sudoku app for reference implementations
   - Check package `index.ts` files for available exports

## Summary

**Key Points:**
- Import from packages, not relative paths
- Use `@sudoku-web/auth`, `@sudoku-web/ui`, `@sudoku-web/template`, `@sudoku-web/sudoku`
- `AuthProvider` requires `useFetch` prop
- Update provider names and nesting
- Test thoroughly after migration

**Next Steps:**
1. Complete migration checklist above
2. Read ARCHITECTURE.md for package details
3. Explore package READMEs for API documentation
4. Start building with modular packages!

---

**Version:** 2.0.0
**Last Updated:** 2025-11-02
