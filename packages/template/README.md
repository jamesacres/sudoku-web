# @sudoku-web/template

Template/collaboration package for party and session management.

## Purpose

Provides generic collaborative features including party management, session handling, and member invitations. This package is game-agnostic and can be used by any collaborative application.

## Public API

This package exports:
- Components: `PartyList`, `PartyDetails`, `InvitationForm`, `SessionList`
- Hooks: `useParty`, `useMembership`, `useSession`, `useInvitations`
- Providers: `PartyProvider`
- Services: `partyService`, `membershipService`
- Types: `Party`, `PartyMember`, `Session`, `PartyInvitation`
- Re-exports from: `@sudoku-web/auth`, `@sudoku-web/ui`, `@sudoku-web/shared`

## Integration

```tsx
import { PartyProvider, useParty } from '@sudoku-web/template';

// Wrap your app with PartyProvider
<PartyProvider>
  <App />
</PartyProvider>

// Use party functionality in components
function MyComponent() {
  const { parties, createParty, inviteMember } = useParty();
  // ...
}
```

## Development

- `npm run type-check` - TypeScript type checking
- `npm run lint` - Linting
- `npm test` - Run tests
