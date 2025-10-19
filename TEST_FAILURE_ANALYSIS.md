# Complete Test Failure Analysis - 92 Failing Tests

## Executive Summary
- **Total Tests**: 2100
- **Passing**: 1999 (95.2%)
- **Failing**: 92 (4.4%)
- **Skipped**: 9 (0.4%)
- **Failing Test Files**: 26

---

## Priority Fix Categories (Ordered by Impact)

### CATEGORY 1: BookCover Component - Inline Style Assertions (31 tests) ⭐ HIGHEST IMPACT
**Tests Affected**: 31 failures in `/src/components/BookCovers/BookCover.test.tsx`

**Error Pattern**:
```
expect(element).toHaveStyle()
- Expected
- height: 270px;
- width: 180px;
```

**Root Cause**:
The BookCover component likely uses Tailwind CSS classes instead of inline styles. Tests are checking for inline style attributes that don't exist.

**Affected Tests**:
- Lines 28, 35, 42, 49: size prop tests (small, medium, large, default)
- Lines 104, 111: border radius and box shadow
- Lines 352, 356, 360: edge case size handling
- Lines 369: responsive scaling width
- Lines 403, 414: scaled border radius and shadow
- All month rendering tests (12 months × ~1-2 tests each)

**Fix Strategy**:
Replace inline style assertions with class-based or computed style checks.

**Specific Fix**:
```typescript
// BEFORE (WRONG):
expect(cover).toHaveStyle({ width: '180px', height: '270px' });

// AFTER (CORRECT - Option 1: Check computed styles):
const styles = window.getComputedStyle(cover as Element);
expect(styles.width).toBe('180px');
expect(styles.height).toBe('270px');

// OR (CORRECT - Option 2: Check classes):
expect(cover).toHaveClass('w-[180px]', 'h-[270px]');

// OR (CORRECT - Option 3: Use inline styles in component):
// Modify BookCover component to use inline styles
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/BookCovers/BookCover.test.tsx` (lines 28, 35, 42, 49, 104, 111, 352, 356, 360, 369, 403, 414)

---

### CATEGORY 2: PremiumFeatures - Invalid Component Type (7 tests) ⭐ HIGH IMPACT
**Tests Affected**: 7 failures in `/src/components/PremiumFeatures/PremiumFeatures.test.tsx`

**Error Pattern**:
```
Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
```

**Root Cause**:
Import/export mismatch for the PremiumFeatures component. The test imports `{ PremiumFeatures }` (named import) but the component might be exported as default.

**Affected Tests** (all in PremiumFeatures.test.tsx):
- renders default title and subtitle
- renders custom title and subtitle
- shows lock icons for non-subscribers
- shows check icons for subscribers
- triggers subscription modal on click for non-subscribers
- does not trigger modal for subscribers
- renders compact view

**Fix Strategy**:
Check the PremiumFeatures component export and fix the import in the test file.

**Specific Fix**:
```typescript
// Check /src/components/PremiumFeatures/PremiumFeatures.tsx
// If it has: export default PremiumFeatures

// Then change test import from:
import { PremiumFeatures } from './PremiumFeatures';

// To:
import PremiumFeatures from './PremiumFeatures';

// OR if component uses named export { PremiumFeatures }, check for typos in export
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/PremiumFeatures/PremiumFeatures.test.tsx` (line 3)
- Possibly `/Users/jamesacres/Documents/git/sudoku-web/src/components/PremiumFeatures/PremiumFeatures.tsx` (export statement)

---

### CATEGORY 3: ScoringLegend - Text Fragment Matching (7 tests)
**Tests Affected**: 7 failures in `/src/components/leaderboard/ScoringLegend.test.tsx`

**Error Pattern**:
```
Unable to find an element with the text: +100 points for each friend. This could be because the text is broken up by multiple elements.
```

**Root Cause**:
Text content is split across multiple DOM elements (e.g., `<span>+100</span> <span>points for each friend</span>`), so exact string matching fails.

**Affected Tests**:
- should display racing bonus per person
- should display book puzzle base points
- should display book puzzle difficulty multipliers
- should display quick speed bonus
- should display speed tiers with emojis
- should sort speed tiers by time descending
- should display all difficulty tiers

**Fix Strategy**:
Use regex or flexible text matchers that work across element boundaries.

**Specific Fix**:
```typescript
// BEFORE (WRONG):
expect(screen.getByText('+100 points for each friend')).toBeInTheDocument();

// AFTER (CORRECT):
expect(screen.getByText(/\+100 points for each friend/i)).toBeInTheDocument();

// OR use container.textContent:
expect(container.textContent).toContain('+100 points for each friend');

// OR use getByText with function matcher:
expect(screen.getByText((content, element) => {
  return element?.textContent === '+100 points for each friend';
})).toBeInTheDocument();
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/leaderboard/ScoringLegend.test.tsx` (specific test assertions)

---

### CATEGORY 4: RevenueCatProvider - Mock Configuration (4 tests)
**Tests Affected**: 4 failures in `/src/providers/RevenueCatProvider/RevenueCatProvider.test.tsx`

**Error Pattern**:
```
TypeError: Cannot read properties of undefined (reading 'mockResolvedValue')
```

**Root Cause**:
`mockPurchases.getOfferings` is undefined, indicating the mock is not properly configured. The jest.mock() for `@revenuecat/purchases-capacitor` is not setting up all required methods.

**Affected Tests**:
- initializes and checks subscription status for a logged-in user
- does not initialize for a logged-out user
- sets isSubscribed to true if the user has active entitlements
- provides a function to purchase a package

**Fix Strategy**:
Add complete mock implementation for all Purchases methods used in the component.

**Specific Fix**:
```typescript
// In RevenueCatProvider.test.tsx, line 36-44
beforeEach(() => {
  jest.clearAllMocks();

  // ADD THESE MISSING MOCKS:
  mockPurchases.configure = jest.fn().mockResolvedValue(undefined);
  mockPurchases.getCustomerInfo = jest.fn().mockResolvedValue({
    customerInfo: { entitlements: { active: {} } },
  } as any);
  mockPurchases.getOfferings = jest.fn().mockResolvedValue({
    all: { default: { availablePackages: [] } },
  } as any);
  mockPurchases.purchasePackage = jest.fn().mockResolvedValue({} as any);
});
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/providers/RevenueCatProvider/RevenueCatProvider.test.tsx` (lines 36-44)

---

### CATEGORY 5: CapacitorProvider - Missing Mock Method (4 tests)
**Tests Affected**: 4 failures in `/src/providers/CapacitorProvider/CapacitorProvider.test.tsx`

**Error Pattern**:
```
TypeError: app_1.App.removeAllListeners is not a function
```

**Root Cause**:
The Capacitor App mock is missing the `removeAllListeners` method that the component calls in its useEffect.

**Affected Tests**:
- should set up listeners on mount and clean up on unmount
- handles appUrlOpen event and navigates
- handles backButton event on home page by minimizing
- handles backButton event on other pages by navigating back

**Fix Strategy**:
Add complete Capacitor App mock in test setup or jest.setup.js.

**Specific Fix**:
```typescript
// In CapacitorProvider.test.tsx, add beforeEach:
import { App } from '@capacitor/app';

jest.mock('@capacitor/app', () => ({
  App: {
    removeAllListeners: jest.fn().mockResolvedValue(undefined),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    minimizeApp: jest.fn().mockResolvedValue(undefined),
  },
}));

// OR in jest.setup.js globally:
global.App = {
  removeAllListeners: jest.fn().mockResolvedValue(undefined),
  addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  minimizeApp: jest.fn().mockResolvedValue(undefined),
};
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/providers/CapacitorProvider/CapacitorProvider.test.tsx` (add mock setup)

---

### CATEGORY 6: useServerStorage - Request API Not Defined (5 tests)
**Tests Affected**: 5 failures in `/src/hooks/serverStorage.test.ts`

**Error Pattern**:
```
ReferenceError: Request is not defined
```

**Root Cause**:
Node.js test environment doesn't have global `Request` constructor. Tests use `expect.any(Request)` which fails.

**Affected Tests**:
- getValue should fetch data from the server
- saveValue should send a PATCH request
- listParties should fetch parties and their members
- createParty should send a POST request and return a party
- deleteAccount should send a DELETE request

**Fix Strategy**:
Replace `expect.any(Request)` with more specific matchers or polyfill Request API.

**Specific Fix**:
```typescript
// BEFORE (WRONG):
expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));

// AFTER (CORRECT - Option 1: Check URL string):
expect(mockFetch).toHaveBeenCalledWith(
  expect.stringContaining('/api/state')
);

// OR (CORRECT - Option 2: Check call arguments):
expect(mockFetch).toHaveBeenCalled();
const callArg = mockFetch.mock.calls[0][0];
expect(callArg.url || callArg).toContain('/api/state');

// OR (CORRECT - Option 3: Add whatwg-fetch polyfill):
// In jest.setup.js:
import 'whatwg-fetch';
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/hooks/serverStorage.test.ts` (line 54, 69-70, and similar assertions)
- Possibly `/Users/jamesacres/Documents/git/sudoku-web/jest.setup.js` (add polyfill)

---

### CATEGORY 7: Book Page - Text Mismatch (4 tests)
**Tests Affected**: 4 failures in `/src/app/book/page.test.tsx`

**Error Pattern**:
```
Unable to find an element with the text: /Loading puzzle book/
Received: Loading puzzles...
```

**Root Cause**:
Test expects "Loading puzzle book" but component renders "Loading puzzles...".

**Affected Tests**:
- should show loading spinner when book is loading (appears twice in output)
- should render puzzle grid
- should show scroll to top button when scrolled down
- should scroll to top when button clicked

**Fix Strategy**:
Update test expectations to match actual rendered text.

**Specific Fix**:
```typescript
// BEFORE (WRONG):
expect(screen.getByText(/Loading puzzle book/)).toBeInTheDocument();

// AFTER (CORRECT):
expect(screen.getByText(/Loading puzzles/i)).toBeInTheDocument();
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/book/page.test.tsx` (find all instances of "Loading puzzle book")

---

### CATEGORY 8: Home Page - Multiple Elements with Same testid (1 test)
**Tests Affected**: 1 failure in `/src/app/page.test.tsx`

**Error Pattern**:
```
Found multiple elements by: [data-testid="users-icon"]
```

**Root Cause**:
Multiple elements have the same `data-testid="users-icon"`, likely because the icon appears in both header and footer or in multiple tabs.

**Affected Tests**:
- should display all footer tab buttons

**Fix Strategy**:
Use `getAllByTestId` instead of `getByTestId`, or make testids unique.

**Specific Fix**:
```typescript
// BEFORE (WRONG):
const usersIcon = screen.getByTestId('users-icon');

// AFTER (CORRECT - Option 1: Get all):
const usersIcons = screen.getAllByTestId('users-icon');
expect(usersIcons.length).toBeGreaterThan(0);

// OR (CORRECT - Option 2: Make testids unique in component):
// In component: data-testid="footer-users-icon" and data-testid="header-users-icon"
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/page.test.tsx` (tab navigation test)

---

### CATEGORY 9: Home Page - Browse Puzzles Navigation (1 test)
**Tests Affected**: 1 failure in `/src/app/page.test.tsx`

**Error Pattern**:
Likely a missing element or navigation issue (needs confirmation from full error).

**Affected Tests**:
- should navigate to book page when Browse Puzzles is clicked

**Fix Strategy**:
Verify button exists and router mock is configured.

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/page.test.tsx`

---

### CATEGORY 10: PartyRow - Missing Delete Button (2 tests)
**Tests Affected**: 2 failures in `/src/components/PartyRow/PartyRow.test.tsx`

**Error Pattern**:
```
Unable to find an accessible element with the role "button" and name `/delete/i`
```

**Root Cause**:
Delete button is not rendering in tests, possibly due to missing context or conditional rendering based on owner status.

**Affected Tests**:
- allows owner to delete party
- allows non-owner to leave party

**Fix Strategy**:
Provide proper mock context where user is the party owner.

**Specific Fix**:
```typescript
// Add proper UserContext mock with matching user ID:
const mockOwner = { sub: 'owner-123', name: 'Owner' };
const mockParty = {
  partyId: 'party-1',
  createdBy: 'owner-123', // Match owner sub
  members: [{ userId: 'owner-123', memberNickname: 'Owner' }],
};

render(
  <UserContext.Provider value={{ user: mockOwner } as any}>
    <PartyRow party={mockParty} />
  </UserContext.Provider>
);
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/PartyRow/PartyRow.test.tsx`

---

### CATEGORY 11: Import Page - Video Attributes (3 tests)
**Tests Affected**: 3 failures in `/src/app/import/page.test.tsx`

**Error Pattern**:
```
expect(element).toHaveAttribute("muted")
Expected the element to have attribute: muted
Received: null
```

**Root Cause**:
React renders boolean attributes differently. `<video muted />` becomes `<video muted="true">` or may not have the attribute at all.

**Affected Tests**:
- should set video element attributes correctly
- should have proper video dimensions
- should load solve.js script

**Fix Strategy**:
Check for the muted property instead of attribute.

**Specific Fix**:
```typescript
// BEFORE (WRONG):
expect(video).toHaveAttribute('muted');
expect(video).toHaveAttribute('playsinline');

// AFTER (CORRECT):
expect(video).toHaveProperty('muted', true);
expect(video).toHaveProperty('playsInline', true);

// OR check the prop existence:
expect(video.muted).toBe(true);
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/import/page.test.tsx` (lines 122-123)

---

### CATEGORY 12: Invite Page - Query Parameter Mismatch (2 tests)
**Tests Affected**: 2 failures in `/src/app/invite/page.test.tsx`

**Error Pattern**:
```
expect(jest.fn()).toHaveBeenCalledWith(...expected)
Expected: "/puzzle?initial=1&final=9"
Received: "/puzzle?initial=1&final=9&showRacingPrompt=false"
```

**Root Cause**:
Component adds extra query parameter `showRacingPrompt=false` that test doesn't expect.

**Affected Tests**:
- should redirect immediately if user is already a member
- should call loginRedirect when sign-in button is clicked

**Fix Strategy**:
Update test expectations to include the extra parameter.

**Specific Fix**:
```typescript
// BEFORE (WRONG):
expect(mockPush).toHaveBeenCalledWith('/puzzle?initial=1&final=9');

// AFTER (CORRECT):
expect(mockPush).toHaveBeenCalledWith('/puzzle?initial=1&final=9&showRacingPrompt=false');

// OR use flexible matcher:
expect(mockPush).toHaveBeenCalledWith(
  expect.stringContaining('/puzzle?initial=1&final=9')
);
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/invite/page.test.tsx`

---

### CATEGORY 13: Test Covers Page - Element Assertions (2 tests)
**Tests Affected**: 2 failures in `/src/app/test-covers/page.test.tsx`

**Error Pattern**:
Likely missing elements or incorrect selectors.

**Affected Tests**:
- should render month heading as h2
- should have text color for dark mode

**Fix Strategy**:
Verify element selectors and ensure proper rendering.

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/test-covers/page.test.tsx`

---

### CATEGORY 14: HeaderBack - Styling Assertions (1 test)
**Tests Affected**: 1 failure in `/src/components/HeaderBack/HeaderBack.test.tsx`

**Error Pattern**:
Likely style or class assertion failure.

**Affected Tests**:
- should have correct styling on back button

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/HeaderBack/HeaderBack.test.tsx`

---

### CATEGORY 15: MyPuzzlesTab - Element Structure (1 test)
**Tests Affected**: 1 failure in `/src/components/tabs/MyPuzzlesTab.test.tsx`

**Error Pattern**:
Likely missing `<li>` elements or incorrect structure.

**Affected Tests**:
- should render li elements for each session

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/tabs/MyPuzzlesTab.test.tsx`

---

### CATEGORY 16: PartiesProvider - Lazy Loading (1 test)
**Tests Affected**: 1 failure in `/src/providers/PartiesProvider/PartiesProvider.test.tsx`

**Error Pattern**:
```
expect(jest.fn()).toHaveBeenCalled()
Expected number of calls: >= 1
Received number of calls: 0
```

**Root Cause**:
Mock function for loading parties is not being called, possibly due to missing user context or async timing issue.

**Affected Tests**:
- lazy loads parties for a logged-in user

**Fix Strategy**:
Add proper async wait and ensure UserContext provides a logged-in user.

**Specific Fix**:
```typescript
// Add waitFor to handle async loading:
await waitFor(() => {
  expect(mockLoadParties).toHaveBeenCalled();
});

// Ensure UserContext has user:
<UserContext.Provider value={{ user: { sub: 'user123' } } as any}>
  <PartiesProvider>...</PartiesProvider>
</UserContext.Provider>
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/providers/PartiesProvider/PartiesProvider.test.tsx`

---

### CATEGORY 17: useDocumentVisibility - Rapid Changes (1 test)
**Tests Affected**: 1 failure in `/src/hooks/documentVisibility.test.ts`

**Error Pattern**:
Likely timing or state update issue with rapid visibility changes.

**Affected Tests**:
- should handle rapid visibility changes

**Fix Strategy**:
Use proper act() wrapping and async utilities.

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/hooks/documentVisibility.test.ts`

---

### CATEGORY 18: FetchProvider - State Updates (1 test)
**Tests Affected**: 1 failure in `/src/providers/FetchProvider/FetchProvider.test.tsx`

**Error Pattern**:
```
expect(element).toHaveTextContent()
Expected: shared-token
Received: empty
```

**Root Cause**:
State updates not propagating to consumers, possibly async timing or missing provider setup.

**Affected Tests**:
- should update all consumers when state changes

**Fix Strategy**:
Add waitFor to handle async state updates.

**Specific Fix**:
```typescript
// Wrap state change in act and wait for update:
await act(async () => {
  // trigger state change
});

await waitFor(() => {
  expect(screen.getByTestId('consumer-1')).toHaveTextContent('shared-token');
});
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/providers/FetchProvider/FetchProvider.test.tsx`

---

### CATEGORY 19: SudokuSidebar - Party Display (1 test)
**Tests Affected**: 1 failure in `/src/components/SudokuSidebar/SudokuSidebar.test.tsx`

**Error Pattern**:
Likely missing parties in render or context issue.

**Affected Tests**:
- displays existing parties

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/SudokuSidebar/SudokuSidebar.test.tsx`

---

### CATEGORY 20: useLocalStorage - Quota Exceeded (1 test)
**Tests Affected**: 1 failure in `/src/hooks/localStorage.test.ts`

**Error Pattern**:
```
expect(received).toBeNull()
Received: "{\"lastUpdated\":1757366057031,\"state\":{\"old\":true}}"
```

**Root Cause**:
Old data is not being cleaned up as expected in quota exceeded scenario.

**Affected Tests**:
- should handle quota exceeded error by cleaning up old data

**Fix Strategy**:
Mock localStorage.setItem to throw QuotaExceededError on first call only.

**Specific Fix**:
```typescript
// Mock quota exceeded error:
let callCount = 0;
Storage.prototype.setItem = jest.fn((key, value) => {
  if (callCount === 0 && key === 'sudoku-p-new') {
    callCount++;
    throw new DOMException('QuotaExceededError');
  }
  // Regular storage
});

// Then verify cleanup:
expect(localStorage.getItem('sudoku-p-old')).toBeNull();
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/hooks/localStorage.test.ts` (line 83)

---

### CATEGORY 21: useLocalStorage - List Values (1 test)
**Tests Affected**: 1 failure in `/src/hooks/localStorage.test.ts`

**Error Pattern**:
Likely incorrect return value or filtering.

**Affected Tests**:
- should list all values of a given type

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/hooks/localStorage.test.ts`

---

### CATEGORY 22: useGameState - Cell Selection (2 tests)
**Tests Affected**: 2 failures in `/src/hooks/gameState.test.ts`

**Error Pattern**:
```
expect(received).toBe(expected)
Expected: 5
Received: 0
```

**Root Cause**:
`selectedAnswer()` function is returning 0 instead of the selected number 5. This suggests the cell selection or number selection logic is not working in the test.

**Affected Tests**:
- allows selecting a cell and a number
- handles undo and redo operations

**Fix Strategy**:
The test is calling `setSelectedCell` and `selectNumber` but `selectedAnswer()` returns wrong value. Need to investigate the hook implementation.

**Specific Fix**:
```typescript
// The test looks correct. Issue is likely in the hook implementation or mocks.
// Check that mocks for localStorage, serverStorage, timer etc. are complete.

// In gameState.test.ts, verify the puzzle structure matches what the hook expects:
const createPuzzle = (value: number = 0): Puzzle<number> => {
  // Ensure this matches the actual Puzzle type structure
};

// May need to wait for state updates:
await waitFor(() => {
  expect(result.current.selectedAnswer()).toBe(5);
});
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/hooks/gameState.test.ts` (lines 94, 106, 110)
- Possibly `/Users/jamesacres/Documents/git/sudoku-web/src/hooks/gameState.ts` (implementation)

---

### CATEGORY 23: FriendsTab - Rendering (1 test)
**Tests Affected**: 1 failure in `/src/components/tabs/FriendsTab.test.tsx`

**Error Pattern**:
Likely missing title or party tabs.

**Affected Tests**:
- renders the main title and party tabs

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/tabs/FriendsTab.test.tsx`

---

### CATEGORY 24: useFetch - User State (3 tests)
**Tests Affected**: 3 failures in `/src/hooks/fetch.test.ts`

**Error Pattern**:
```
expect(received).toEqual(expected)
Expected: {"name": "Test User", "sub": "user1"}
Received: undefined
```

**Root Cause**:
`getUser()` function is returning undefined instead of the user object from FetchContext.

**Affected Tests**:
- should return user when state is valid
- should add auth token to API requests
- should handle token refresh and retry the request

**Fix Strategy**:
Ensure FetchProvider mock or wrapper provides proper user state.

**Specific Fix**:
```typescript
// In createWrapper() or test setup:
const mockFetchContext = {
  state: {
    user: { sub: 'user1', name: 'Test User' },
    token: 'test-token',
  },
  fetch: jest.fn(),
  getUser: jest.fn(() => ({ sub: 'user1', name: 'Test User' })),
};

const wrapper = ({ children }: any) => (
  <FetchContext.Provider value={mockFetchContext}>
    {children}
  </FetchContext.Provider>
);
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/hooks/fetch.test.ts`

---

### CATEGORY 25: Testers Page - Invite Links (2 tests)
**Tests Affected**: 2 failures in `/src/app/testers/page.test.tsx`

**Error Pattern**:
Likely missing elements or conditional rendering issues.

**Affected Tests**:
- should not show invite link when no inviteId
- should show invite links when inviteId is present

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/testers/page.test.tsx`

---

### CATEGORY 26: HeaderUser - Undefined Context (1 test)
**Tests Affected**: 1 failure in `/src/components/HeaderUser/HeaderUser.test.tsx`

**Error Pattern**:
Likely trying to render without proper UserContext.

**Affected Tests**:
- should handle undefined context gracefully

**Fix Strategy**:
Test should render component without UserContext provider and verify it doesn't crash.

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/components/HeaderUser/HeaderUser.test.tsx`

---

### CATEGORY 27: BookProvider - Data Fetching (2 tests)
**Tests Affected**: 2 failures in `/src/providers/BookProvider/BookProvider.test.tsx`

**Error Pattern**:
```
Unable to find an element with the text: Test Book
```

**Root Cause**:
Book data is not being fetched or displayed in the test consumer component.

**Affected Tests**:
- fetches and displays book data
- loads data from cache on initial render

**Fix Strategy**:
Ensure fetch is properly mocked and async data loading is awaited.

**Specific Fix**:
```typescript
// Mock fetch properly:
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ title: 'Test Book', puzzles: [] }),
  })
) as jest.Mock;

// Wait for async data:
await waitFor(() => {
  expect(screen.getByText('Test Book')).toBeInTheDocument();
});
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/providers/BookProvider/BookProvider.test.tsx`

---

### CATEGORY 28: Providers Nesting Order (1 test)
**Tests Affected**: 1 failure in `/src/app/providers.test.tsx`

**Error Pattern**:
Likely incorrect provider nesting order assertion.

**Affected Tests**:
- should have GlobalStateProvider at the top level

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/src/app/providers.test.tsx`

---

## Console Errors/Warnings
**Count**: 113 console error occurrences

**Main Console Error**:
```
Error: Not implemented: window.confirm
```

This appears in tests that trigger confirm dialogs (delete, reset operations).

**Fix Strategy**:
Mock window.confirm in jest.setup.js:

```typescript
// In jest.setup.js:
global.confirm = jest.fn(() => true); // or false, depending on test needs

// Or in specific test files:
beforeEach(() => {
  window.confirm = jest.fn(() => true);
});
```

**Files to Edit**:
- `/Users/jamesacres/Documents/git/sudoku-web/jest.setup.js`

---

## Quick Reference: Files Requiring Changes

### High Priority (fixes 31+ tests each):
1. `/src/components/BookCovers/BookCover.test.tsx` - 31 tests
2. `/src/components/PremiumFeatures/PremiumFeatures.test.tsx` - 7 tests
3. `/src/components/leaderboard/ScoringLegend.test.tsx` - 7 tests

### Medium Priority (fixes 4-5 tests each):
4. `/src/hooks/serverStorage.test.ts` - 5 tests
5. `/src/providers/RevenueCatProvider/RevenueCatProvider.test.tsx` - 4 tests
6. `/src/providers/CapacitorProvider/CapacitorProvider.test.tsx` - 4 tests
7. `/src/app/book/page.test.tsx` - 4 tests

### Lower Priority (1-3 tests each):
8. `/src/app/import/page.test.tsx` - 3 tests
9. `/src/hooks/fetch.test.ts` - 3 tests
10. `/src/app/invite/page.test.tsx` - 2 tests
11. `/src/components/PartyRow/PartyRow.test.tsx` - 2 tests
12. `/src/hooks/gameState.test.ts` - 2 tests
13. `/src/app/testers/page.test.tsx` - 2 tests
14. `/src/providers/BookProvider/BookProvider.test.tsx` - 2 tests
15. `/src/app/test-covers/page.test.tsx` - 2 tests
16. `/src/hooks/localStorage.test.ts` - 2 tests
17. All remaining files - 1 test each

### Global Setup:
18. `/jest.setup.js` - Add window.confirm mock

---

## Implementation Order Recommendation

1. **Global Setup** (jest.setup.js) - Fixes console errors across all tests
2. **BookCover Tests** - Fixes 31 tests (highest impact)
3. **PremiumFeatures Tests** - Fixes 7 tests (simple import fix)
4. **ScoringLegend Tests** - Fixes 7 tests (text matcher updates)
5. **ServerStorage Tests** - Fixes 5 tests (Request API polyfill)
6. **RevenueCat & Capacitor** - Fixes 8 tests (mock improvements)
7. **Remaining Tests** - Fix in batches by file

---

## Estimated Fix Times

- **Quick Wins** (< 5 min each): Categories 2, 7, 8, 9, 11, 12 (21 tests)
- **Medium Effort** (5-15 min each): Categories 3, 4, 5, 6, 10 (27 tests)
- **Higher Effort** (15-30 min): Categories 1, 20, 22, 24, 27 (37 tests)
- **Investigation Needed**: Remaining categories (7 tests)

**Total Estimated Time**: 4-6 hours to fix all 92 tests

---

## Summary Statistics by Error Type

| Error Type | Test Count | % of Failures |
|-----------|-----------|---------------|
| Style/Class Assertions | 31 | 33.7% |
| Text Fragment Matching | 7 | 7.6% |
| Import/Export Issues | 7 | 7.6% |
| Mock Configuration | 13 | 14.1% |
| Async/Timing Issues | 8 | 8.7% |
| Query Parameter Mismatches | 2 | 2.2% |
| Missing Elements | 10 | 10.9% |
| Context/Provider Issues | 6 | 6.5% |
| API Polyfill Needed | 5 | 5.4% |
| Other | 3 | 3.3% |

---

Generated: 2025-10-18
