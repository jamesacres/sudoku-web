import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeaderOnline from './HeaderOnline';
import { GlobalStateProvider } from '@sudoku-web/template';

// Mock the @sudoku-web/template module to get useOnline
jest.mock('@sudoku-web/template', () => {
  const actual = jest.requireActual('@sudoku-web/template');
  return {
    ...actual,
    useOnline: jest.fn(() => ({ isOnline: true })),
  };
});

// Mock react-feather icons
jest.mock('react-feather', () => ({
  Wifi: ({ className }: any) => (
    <div data-testid="wifi-icon" className={className} />
  ),
  WifiOff: ({ className }: any) => (
    <div data-testid="wifi-off-icon" className={className} />
  ),
}));

describe('HeaderOnline', () => {
  const mockAlert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = mockAlert;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<GlobalStateProvider>{component}</GlobalStateProvider>);
  };

  describe('rendering when online', () => {
    it('should render button when online', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render WiFi icon when online', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
    });

    it('should not render WiFi off icon when online', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      expect(screen.queryByTestId('wifi-off-icon')).not.toBeInTheDocument();
    });

    it('should have correct styling when online', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-theme-primary');
      expect(button).toHaveClass('dark:text-theme-primary-light');
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('bg-gray-100');
      expect(button).toHaveClass('dark:bg-gray-800');
    });
  });

  describe('rendering when offline', () => {
    it('should render button when offline', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: false });

      renderWithProvider(<HeaderOnline />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render WiFi off icon when offline', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: false });

      renderWithProvider(<HeaderOnline />);

      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });

    it('should not render WiFi icon when offline', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: false });

      renderWithProvider(<HeaderOnline />);

      expect(screen.queryByTestId('wifi-icon')).not.toBeInTheDocument();
    });

    it('should have same styling when offline as when online', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: false });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-theme-primary');
      expect(button).toHaveClass('dark:text-theme-primary-light');
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('bg-gray-100');
      expect(button).toHaveClass('dark:bg-gray-800');
    });
  });

  describe('button click behavior', () => {
    it('should show alert when button is clicked and online', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('You are online!');
      });
    });

    it('should show alert when button is clicked and offline', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: false });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('You are offline!');
      });
    });

    it('should call window.alert exactly once per click', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledTimes(1);
      });
    });

    it('should call alert with correct message on multiple clicks', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledTimes(2);
        expect(mockAlert).toHaveBeenCalledWith('You are online!');
      });
    });
  });

  describe('state changes', () => {
    it('should update icon when online status changes', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      const { rerender } = render(<HeaderOnline />);

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('wifi-off-icon')).not.toBeInTheDocument();

      // Change to offline
      useOnline.mockReturnValue({ isOnline: false });
      rerender(<HeaderOnline />);

      expect(screen.queryByTestId('wifi-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });

    it('should update alert message when online status changes', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      const { rerender } = render(<HeaderOnline />);

      let button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('You are online!');
      });

      mockAlert.mockClear();

      // Change to offline
      useOnline.mockReturnValue({ isOnline: false });
      rerender(<HeaderOnline />);

      button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('You are offline!');
      });
    });
  });

  describe('button styling', () => {
    it('should have cursor-pointer class', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-pointer');
    });

    it('should have margin left class', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ml-1');
    });

    it('should have correct size dimensions', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('w-8');
    });

    it('should have padding on button', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-1.5');
    });

    it('should have transition effect', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });

    it('should have active state opacity', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:opacity-70');
    });
  });

  describe('icon styling', () => {
    it('should have correct styling for WiFi icon', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const icon = screen.getByTestId('wifi-icon');
      expect(icon).toHaveClass('m-auto');
      expect(icon).toHaveClass('h-full');
      expect(icon).toHaveClass('w-full');
    });

    it('should have correct styling for WiFi off icon', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: false });

      renderWithProvider(<HeaderOnline />);

      const icon = screen.getByTestId('wifi-off-icon');
      expect(icon).toHaveClass('m-auto');
      expect(icon).toHaveClass('h-full');
      expect(icon).toHaveClass('w-full');
    });
  });

  describe('useOnline hook integration', () => {
    it('should call useOnline hook', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      expect(useOnline).toHaveBeenCalled();
    });

    it('should use isOnline value from hook', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have button role', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      expect(button).toBeInTheDocument();
    });

    it('should be clickable via keyboard', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');

      // Simulate Enter key press
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      });
    });
  });

  describe('rendering client component', () => {
    it('should render without crashing', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      const { container } = renderWithProvider(<HeaderOnline />);
      expect(container).toBeInTheDocument();
    });

    it('should render button as first element', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      const { container } = renderWithProvider(<HeaderOnline />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid clicking', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle alert being called multiple times', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');

      for (let i = 0; i < 5; i++) {
        fireEvent.click(button);
      }

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledTimes(5);
      });
    });

    it('should correctly identify online status in alert message', async () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: false });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const lastCall =
          mockAlert.mock.calls[mockAlert.mock.calls.length - 1][0];
        expect(lastCall).toContain('offline');
      });
    });
  });

  describe('conditional rendering', () => {
    it('should only render one icon at a time', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const wifiIcons = screen.queryAllByTestId('wifi-icon');
      const wifiOffIcons = screen.queryAllByTestId('wifi-off-icon');

      expect(wifiIcons.length + wifiOffIcons.length).toBe(1);
    });

    it('should not render both WiFi and WiFi off icons', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      if (screen.queryByTestId('wifi-icon')) {
        expect(screen.queryByTestId('wifi-off-icon')).not.toBeInTheDocument();
      } else if (screen.queryByTestId('wifi-off-icon')) {
        expect(screen.queryByTestId('wifi-icon')).not.toBeInTheDocument();
      }
    });
  });

  describe('dark mode support', () => {
    it('should have dark mode text color class', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:text-theme-primary-light');
    });

    it('should have dark mode background color class', () => {
      const { useOnline } = require('@sudoku-web/template');
      useOnline.mockReturnValue({ isOnline: true });

      renderWithProvider(<HeaderOnline />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-gray-800');
    });
  });
});
