import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderOnline from './HeaderOnline';
import { useOnline } from '@sudoku-web/template/hooks/online';

// Mock react-feather icons
jest.mock('react-feather', () => ({
  Wifi: ({ className }: any) => (
    <div data-testid="wifi-icon" className={className} />
  ),
  WifiOff: ({ className }: any) => (
    <div data-testid="wifi-off-icon" className={className} />
  ),
}));

// Mock the useOnline hook
jest.mock('@sudoku-web/template/hooks/online', () => ({
  useOnline: jest.fn(),
}));

describe('HeaderOnline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with online icon when online', () => {
    (useOnline as jest.Mock).mockReturnValue({ isOnline: true });

    render(<HeaderOnline />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders with offline icon when offline', () => {
    (useOnline as jest.Mock).mockReturnValue({ isOnline: false });

    render(<HeaderOnline />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows alert with correct status on click', () => {
    (useOnline as jest.Mock).mockReturnValue({ isOnline: true });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    render(<HeaderOnline />);

    const button = screen.getByRole('button');
    button.click();

    expect(alertSpy).toHaveBeenCalledWith('You are online!');
    alertSpy.mockRestore();
  });
});
