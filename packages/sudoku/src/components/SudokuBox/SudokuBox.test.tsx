import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SudokuBox from './SudokuBox';
import { PuzzleBox } from '../../types/puzzle';

// Mock SudokuInput to avoid complex dependencies
jest.mock('../SudokuInput', () => {
  return function MockSudokuInput({
    cellId,
    value,
    isInitial,
    selectedCell,
    validation,
    setSelectedCell,
    onDragStart,
    isZoomMode,
  }: any) {
    const isSelected = selectedCell === cellId;
    let backgroundClass = '';

    if (!isNaN(value) && value && validation !== undefined) {
      backgroundClass = validation ? 'bg-green-600' : 'bg-red-600';
    } else if (isSelected) {
      backgroundClass = `dark:bg-theme-primary-dark/75 bg-theme-primary-lighter${isInitial ? '/50' : ''}`;
    }

    const textClass = isInitial
      ? 'text-zinc-500 dark:text-zinc-400'
      : 'text-zinc-900 dark:text-zinc-50';

    const handlePointerDown = (e: React.PointerEvent) => {
      setSelectedCell(cellId);
      if (isZoomMode && onDragStart) {
        onDragStart(e);
      }
    };

    return (
      <div
        data-cell-container-id={cellId}
        onPointerDown={handlePointerDown}
        className={`flex h-full w-full items-center justify-center border border-zinc-300 dark:border-zinc-400 ${backgroundClass}`}
      >
        {!isNaN(value) && value ? (
          <div
            data-cell-id={cellId}
            className={`text-center text-lg sm:text-3xl ${textClass}`}
          >
            {value}
          </div>
        ) : null}
      </div>
    );
  };
});

describe('SudokuBox', () => {
  // Helper to create test puzzle boxes
  const createEmptyBox = (): PuzzleBox => ({
    0: [0, 0, 0],
    1: [0, 0, 0],
    2: [0, 0, 0],
  });

  const createFilledBox = (): PuzzleBox => ({
    0: [1, 2, 3],
    1: [4, 5, 6],
    2: [7, 8, 9],
  });

  const createInitialBox = (): PuzzleBox => ({
    0: [1, 0, 3],
    1: [0, 5, 0],
    2: [7, 0, 9],
  });

  const mockSetSelectedCell = jest.fn();
  const mockSelectNumber = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render a grid container with correct data-box-id', () => {
      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={createEmptyBox()}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      const boxElement = container.querySelector('[data-box-id="0-0"]');
      expect(boxElement).toBeInTheDocument();
      expect(boxElement).toHaveClass('grid');
      expect(boxElement).toHaveClass('grid-cols-3');
      expect(boxElement).toHaveClass('grid-rows-3');
    });

    it('should render 9 SudokuInput components (one for each cell)', () => {
      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={createEmptyBox()}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      const cellContainers = container.querySelectorAll(
        '[data-cell-container-id]'
      );
      expect(cellContainers).toHaveLength(9);
    });

    it('should display values from answer box', () => {
      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={createFilledBox()}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      const cellValues = container.querySelectorAll('[data-cell-id]');
      expect(cellValues).toHaveLength(9);

      // Check that numbers 1-9 are rendered
      for (let i = 1; i <= 9; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('should apply border classes for styling', () => {
      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={createEmptyBox()}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      const boxElement = container.querySelector('[data-box-id="0-0"]');
      expect(boxElement).toHaveClass('border');
      expect(boxElement).toHaveClass('border-2');
    });
  });

  describe('cell selection', () => {
    it('should call setSelectedCell when a cell is clicked', () => {
      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={createEmptyBox()}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      const firstCell = container.querySelector('[data-cell-container-id]');
      fireEvent.pointerDown(firstCell!);

      expect(mockSetSelectedCell).toHaveBeenCalled();
    });

    it('should pass correct cellId to setSelectedCell', () => {
      const { container } = render(
        <SudokuBox
          boxId="1-2"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={createEmptyBox()}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      const firstCell = container.querySelector('[data-cell-container-id]');
      fireEvent.pointerDown(firstCell!);

      // The cellId should be calculated as box and position
      const cellId = firstCell?.getAttribute('data-cell-container-id');
      expect(mockSetSelectedCell).toHaveBeenCalledWith(cellId);
    });

    it('should show correct cell as selected based on selectedCell prop', () => {
      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell="0-0,cell:0,0"
          setSelectedCell={mockSetSelectedCell}
          answer={createEmptyBox()}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      const selectedCellElement = container.querySelector(
        '[data-cell-container-id="0-0,cell:0,0"]'
      );
      expect(selectedCellElement).toHaveClass('bg-theme-primary-lighter');
    });
  });

  describe('validation display', () => {
    it('should display green background for valid cells', () => {
      const validation: PuzzleBox<boolean | undefined> = {
        0: [true, undefined, undefined],
        1: [undefined, undefined, undefined],
        2: [undefined, undefined, undefined],
      };

      const answer: PuzzleBox = {
        0: [1, 0, 0],
        1: [0, 0, 0],
        2: [0, 0, 0],
      };

      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={answer}
          selectNumber={mockSelectNumber}
          validation={validation}
          initial={createEmptyBox()}
        />
      );

      const validCell = container.querySelector(
        '[data-cell-container-id="0-0,cell:0,0"]'
      );
      expect(validCell).toHaveClass('bg-green-600');
    });

    it('should display red background for invalid cells', () => {
      const validation: PuzzleBox<boolean | undefined> = {
        0: [false, undefined, undefined],
        1: [undefined, undefined, undefined],
        2: [undefined, undefined, undefined],
      };

      const answer: PuzzleBox = {
        0: [1, 0, 0],
        1: [0, 0, 0],
        2: [0, 0, 0],
      };

      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={answer}
          selectNumber={mockSelectNumber}
          validation={validation}
          initial={createEmptyBox()}
        />
      );

      const invalidCell = container.querySelector(
        '[data-cell-container-id="0-0,cell:0,0"]'
      );
      expect(invalidCell).toHaveClass('bg-red-600');
    });

    it('should not show validation color when validation is undefined', () => {
      const answer: PuzzleBox = {
        0: [1, 0, 0],
        1: [0, 0, 0],
        2: [0, 0, 0],
      };

      const { container } = render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={answer}
          selectNumber={mockSelectNumber}
          validation={undefined}
          initial={createEmptyBox()}
        />
      );

      const cell = container.querySelector(
        '[data-cell-container-id="0-0,cell:0,0"]'
      );
      expect(cell).not.toHaveClass('bg-green-600');
      expect(cell).not.toHaveClass('bg-red-600');
    });
  });

  describe('edge cases', () => {
    it('should handle partial fills', () => {
      const answer: PuzzleBox = {
        0: [1, 2, 0],
        1: [0, 0, 6],
        2: [0, 0, 9],
      };

      render(
        <SudokuBox
          boxId="0-0"
          selectedCell={null}
          setSelectedCell={mockSetSelectedCell}
          answer={answer}
          selectNumber={mockSelectNumber}
          initial={createEmptyBox()}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
    });
  });
});
