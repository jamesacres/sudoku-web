# @sudoku-web/sudoku

Sudoku game logic and components package.

## Purpose

Provides Sudoku-specific game logic, components, and utilities including puzzle generation, solving algorithms, and game UI.

## Public API

This package exports:
- Components: `SudokuGrid`, `NumberPad`, `Timer`, `RaceTrack`
- Hooks: `useTimer`, `useSudokuState`
- Helpers: `solve`, `validate`, `generate`, `checkAnswer`
- Types: `Cell`, `SudokuGrid`, `SudokuState`, `RaceSession`
- Utils: Puzzle utilities, cell calculations

## Integration

```tsx
import { SudokuGrid, useTimer, useSudokuState } from '@sudoku-web/sudoku';

function SudokuGame() {
  const { grid, updateCell } = useSudokuState();
  const { time, start, stop } = useTimer();

  return <SudokuGrid grid={grid} onCellChange={updateCell} />;
}
```

## Development

- `npm run type-check` - TypeScript type checking
- `npm run lint` - Linting
- `npm test` - Run tests
