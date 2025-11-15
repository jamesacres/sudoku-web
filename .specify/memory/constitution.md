<!--
SYNC IMPACT REPORT
=================
Version Change: Template (v0.0.0) → v1.0.0 (Initial ratification)
Added Principles: (5)
  1. Test-First Development
  2. Full TypeScript Type Safety
  3. Component-Driven Architecture
  4. Multi-Platform Compatibility
  5. User-Centric Design & Accessibility

Added Sections:
  - Core Principles (5 detailed principles)
  - Quality Standards
  - Development Workflow
  - Governance

Templates Requiring Review:
  ⚠ .specify/templates/spec-template.md (ensure section requirements align)
  ⚠ .specify/templates/plan-template.md (verify Constitution Check section)
  ⚠ .specify/templates/tasks-template.md (ensure task types reflect principles)

Follow-up Items:
  - None - all placeholders filled with concrete values
  - Review amendment procedure in Governance section for future changes

Ratified: 2025-11-01 | Version: 1.0.0
-->

# Sudoku Web Constitution

## Core Principles

### I. Test-First Development

Every feature must be testable and tested. The codebase maintains >99% test pass rate with comprehensive coverage across unit, integration, and component tests.

**Non-negotiable rules:**
- All new features require accompanying tests written before or concurrent with implementation
- Jest testing framework must be used for all tests
- Test setup must include proper mocks for third-party libraries (Capacitor, RevenueCat, Fetch API)
- All component tests use React Testing Library patterns
- Hook tests must verify state changes and side effects
- Skipped tests are permitted ONLY for manual/exploratory test suites that cannot be automated reliably

**Rationale:** With 1987 passing tests across 88 test suites, this project has proven that comprehensive testing prevents regressions, documents expected behavior, and enables confident refactoring. Test coverage protects the multi-platform experience.

### II. Full TypeScript Type Safety

Every source file must be valid TypeScript with strict type checking enabled. No `any` types without explicit justification.

**Non-negotiable rules:**
- All components, hooks, helpers, and pages must export proper TypeScript types
- React component props must be typed with interfaces or type aliases
- Function parameters and return types must be explicit
- Third-party library definitions must be included (@types packages)
- Build verification: TypeScript compilation must pass with zero errors
- Breaking changes to types require MAJOR version bumps

**Rationale:** This multi-platform project (web, iOS, Android, Electron) requires robust type safety to prevent platform-specific bugs. Strong typing makes component props and API contracts explicit and maintainable across different deployment targets.

### III. Component-Driven Architecture

The codebase is organized around reusable, self-contained React components following Next.js App Router conventions.

**Non-negotiable rules:**
- React components must be functional components with hooks (no class components)
- Component files must use PascalCase naming (e.g., `SudokuInput.tsx`)
- Each component should have a single responsibility and clear prop interface
- Shared components live in `/src/components`, page-specific components in page directories
- Styling must use Tailwind CSS utility classes; no inline styles except dynamic values
- Custom hooks live in `/src/hooks` and are testable in isolation
- Type definitions live in `/src/types`

**Rationale:** Clear component boundaries make the codebase maintainable across multiple platforms and easier to test. Consistent naming and organization reduces cognitive load and enables rapid feature development.

### IV. Multi-Platform Compatibility

Code must be written to support web (Next.js), iOS (Capacitor), Android (Capacitor), and desktop (Electron) platforms.

**Non-negotiable rules:**
- Platform-specific code must be isolated and mockable in tests
- Browser APIs must have graceful fallbacks or platform detection
- Capacitor plugins (camera, storage, app lifecycle) must be properly mocked in test setup
- No direct DOM manipulation; use React APIs and Next.js patterns
- Features like in-app purchases (RevenueCat), notifications, and native APIs must be abstracted behind provider wrappers
- Code reviews must verify platform compatibility considerations

**Rationale:** This project serves users on four different platforms. Shared code patterns reduce duplication and maintenance burden while ensuring consistent behavior across all platforms.

### V. User-Centric Design & Accessibility

The application must be accessible and intuitive for all users, including those with disabilities.

**Non-negotiable rules:**
- Components must follow WCAG 2.1 Level AA accessibility standards
- Interactive elements must have proper ARIA labels and semantic HTML
- Keyboard navigation must work for all interactive features
- Dark mode support is required (via next-themes)
- Performance is a user experience metric: pages must load quickly and respond to input with <100ms latency
- User feedback (errors, success messages, loading states) must be clear and non-blocking

**Rationale:** Sudoku players come from diverse backgrounds and use various devices. Accessible, performant design expands the user base and improves overall product quality.

## Quality Standards

### Testing Gates

- All PRs require passing test suite (99%+ pass rate)
- New components require ≥80% line coverage in test files
- Breaking changes require test updates and documentation
- Integration tests required for: multi-platform features, state management changes, API contract changes

### Code Style & Formatting

- ESLint and Prettier enforce consistent formatting
- TypeScript strict mode enabled in tsconfig.json
- No console.log or console.error in production code; use structured logging if needed
- Dead code must be removed; unused imports flagged by linter

### Performance Expectations

- Next.js build must complete without errors or warnings
- Page load time targets: <3s initial, <500ms navigation
- Component render should not trigger excessive re-renders
- Bundle size monitoring recommended for third-party dependencies

## Development Workflow

### Code Review Requirements

- All changes require PR review before merge
- Reviewers must verify: test coverage, TypeScript compliance, accessibility, multi-platform compatibility
- Approval from code owner or designated reviewer required
- Automated checks (linting, tests, build) must pass

### Version Management

- Semantic Versioning: MAJOR.MINOR.BUILD
- MAJOR: Breaking changes (breaking API, removed features, type changes affecting public interfaces)
- MINOR: New features or enhancements (new components, new hooks, new pages)
- PATCH: Bug fixes, test improvements, documentation updates, refactoring without behavior change
- Version bumps documented in commit messages and CHANGELOG

### Feature Development

1. Specification phase: Define requirements, acceptance criteria, platform considerations
2. Test phase: Write tests covering the specification
3. Implementation phase: Build components and integrate into app
4. Review phase: Code review for compliance with Constitution principles
5. Validation phase: Verify on all platforms (web, iOS, Android, desktop)

## Governance

### Constitution Precedence

This Constitution supersedes all other guidelines, coding standards, and project practices. In case of conflict between Constitution principles and other documentation, Constitution principles take priority.

### Amendment Procedure

1. **Proposal**: New principles or changes are proposed with clear rationale and impact analysis
2. **Discussion**: Team discusses implications for existing code and processes
3. **Approval**: Changes require consensus from code owners
4. **Version Bump**: Constitution version is incremented (MAJOR/MINOR/PATCH as appropriate)
5. **Implementation**: Dependent templates (spec, plan, tasks) are updated to reflect constitutional changes
6. **Documentation**: Commit message notes constitutional amendment and version change

### Compliance Review

- Constitution review occurs at quarterly intervals or after MAJOR version bumps
- All PRs must be evaluated for constitutional compliance by reviewers
- Deviations from Constitution principles must be explicitly justified in PR comments
- Systematic deviations indicate need for Constitution amendment

### Runtime Guidance

For day-to-day development decisions, refer to:
- **Code Style**: See `code_style` memory for specific conventions
- **Project Structure**: See `project_structure` memory for file organization
- **Tech Stack**: See `tech_stack` memory for approved libraries and tools
- **Testing**: Refer to test suite patterns in existing components for examples

Ambiguities not covered by Constitution should be resolved by code owners in consultation with reviewers.

---

**Version**: 1.0.0 | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-01
