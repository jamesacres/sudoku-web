import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberPad } from './NumberPad';

describe('NumberPad', () => {
  const mockSelectNumber = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all 9 number buttons', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      for (let i = 1; i <= 9; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('should render buttons in correct order (1-9)', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(9);

      for (let i = 1; i <= 9; i++) {
        expect(buttons[i - 1]).toHaveTextContent(i.toString());
      }
    });

    it('should use grid layout with 9 columns on mobile', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const gridContainer = container.querySelector('.grid-cols-9');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should use grid layout with 3 columns on desktop', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const gridContainer = container.querySelector('.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should use 3 rows on desktop', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const gridContainer = container.querySelector('.lg\\:grid-rows-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have consistent text size for numbers', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('text-2xl');
      });
    });
  });

  describe('button interactions', () => {
    it('should call selectNumber when a button is clicked', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      fireEvent.click(screen.getByText('5'));

      expect(mockSelectNumber).toHaveBeenCalledWith(5);
    });

    it('should pass correct number for each button', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      for (let i = 1; i <= 9; i++) {
        mockSelectNumber.mockClear();
        fireEvent.click(screen.getByText(i.toString()));
        expect(mockSelectNumber).toHaveBeenCalledWith(i);
      }
    });

    it('should handle multiple clicks on same button', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const button = screen.getByText('3');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockSelectNumber).toHaveBeenCalledTimes(3);
      expect(mockSelectNumber).toHaveBeenCalledWith(3);
    });

    it('should allow clicking different numbers in sequence', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('9'));

      expect(mockSelectNumber).toHaveBeenNthCalledWith(1, 1);
      expect(mockSelectNumber).toHaveBeenNthCalledWith(2, 5);
      expect(mockSelectNumber).toHaveBeenNthCalledWith(3, 9);
    });
  });

  describe('disabled state', () => {
    it('should disable all buttons when isInputDisabled is true', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={true} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should enable all buttons when isInputDisabled is false', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should not call selectNumber when disabled', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={true} />
      );

      fireEvent.click(screen.getByText('5'));

      expect(mockSelectNumber).not.toHaveBeenCalled();
    });

    it('should apply disabled styling', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={true} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('disabled:opacity-50');
        expect(button).toHaveClass('disabled:cursor-not-allowed');
      });
    });

    it('should toggle between enabled and disabled', () => {
      const { container, rerender } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      let buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });

      rerender(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={true} />
      );

      buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });

      rerender(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('styling', () => {
    it('should have rounded corners', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('rounded-sm');
      });
    });

    it('should have padding', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('px-4');
        expect(button).toHaveClass('py-2');
      });
    });

    it('should have cursor pointer when enabled', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('cursor-pointer');
      });
    });

    it('should have flex display', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('flex');
        expect(button).toHaveClass('items-center');
        expect(button).toHaveClass('justify-center');
      });
    });

    it('should have full height and width', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('h-full');
        expect(button).toHaveClass('w-full');
      });
    });

    it('should have proper text color', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('text-black');
        expect(button).toHaveClass('dark:text-white');
      });
    });
  });

  describe('responsive behavior', () => {
    it('should render container with responsive grid classes', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('mb-0');
      expect(gridContainer).toHaveClass('h-full');
      expect(gridContainer).toHaveClass('w-full');
    });

    it('should have different layouts for mobile and desktop', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-9'); // mobile first
      expect(gridContainer).toHaveClass('lg:grid-cols-3'); // desktop
      expect(gridContainer).toHaveClass('lg:grid-rows-3');
    });
  });

  describe('number uniqueness', () => {
    it('should not have duplicate numbers', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      for (let i = 1; i <= 9; i++) {
        const elements = screen.getAllByText(i.toString());
        expect(elements).toHaveLength(1);
      }
    });

    it('should include all numbers 1-9', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const numbers = new Set<number>();
      for (let i = 1; i <= 9; i++) {
        numbers.add(i);
      }

      for (let num of numbers) {
        expect(screen.getByText(num.toString())).toBeInTheDocument();
      }
    });

    it('should not include 0', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have button elements for semantic HTML', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should have accessible button labels', () => {
      const { container } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button, index) => {
        const expectedNumber = (index + 1).toString();
        expect(button.textContent).toBe(expectedNumber);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle prop changes', () => {
      const { rerender } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const newMockSelectNumber = jest.fn();
      rerender(
        <NumberPad selectNumber={newMockSelectNumber} isInputDisabled={false} />
      );

      fireEvent.click(screen.getByText('5'));
      expect(newMockSelectNumber).toHaveBeenCalledWith(5);
    });

    it('should handle rapid clicking', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      const button = screen.getByText('7');
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(mockSelectNumber).toHaveBeenCalledTimes(10);
      expect(mockSelectNumber).toHaveBeenCalledWith(7);
    });

    it('should maintain functionality after disable/enable toggle', () => {
      const { rerender } = render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      fireEvent.click(screen.getByText('1'));
      expect(mockSelectNumber).toHaveBeenCalledWith(1);

      mockSelectNumber.mockClear();

      rerender(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={true} />
      );

      fireEvent.click(screen.getByText('1'));
      expect(mockSelectNumber).not.toHaveBeenCalled();

      rerender(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      fireEvent.click(screen.getByText('1'));
      expect(mockSelectNumber).toHaveBeenCalledWith(1);
    });

    it('should work with different selectNumber callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = render(
        <NumberPad selectNumber={callback1} isInputDisabled={false} />
      );

      fireEvent.click(screen.getByText('3'));
      expect(callback1).toHaveBeenCalledWith(3);

      rerender(<NumberPad selectNumber={callback2} isInputDisabled={false} />);

      fireEvent.click(screen.getByText('3'));
      expect(callback2).toHaveBeenCalledWith(3);
    });
  });

  describe('performance', () => {
    it('should render efficiently with many clicks', () => {
      render(
        <NumberPad selectNumber={mockSelectNumber} isInputDisabled={false} />
      );

      for (let i = 0; i < 50; i++) {
        const num = (i % 9) + 1;
        fireEvent.click(screen.getByText(num.toString()));
      }

      expect(mockSelectNumber).toHaveBeenCalledTimes(50);
    });
  });
});
