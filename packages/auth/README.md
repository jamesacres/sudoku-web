# @sudoku-web/auth

Authentication package for Sudoku Web applications.

## Purpose

Provides authentication functionality including user management, session handling, and OAuth integration.

## Public API

This package exports:
- Components: `LoginForm`, `RegisterForm`, `OAuthProviders`
- Hooks: `useAuth`, `useSession`, `useUser`
- Providers: `AuthProvider`
- Services: `tokenService`, `sessionService`
- Types: `User`, `AuthToken`, `SessionState`

## Integration

```tsx
import { AuthProvider, useAuth } from '@sudoku-web/auth';

// Wrap your app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Use authentication in components
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

## Development

- `npm run type-check` - TypeScript type checking
- `npm run lint` - Linting
- `npm test` - Run tests
