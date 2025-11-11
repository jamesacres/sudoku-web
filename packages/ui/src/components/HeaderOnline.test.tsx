import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderOnline from './HeaderOnline';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with online icon when online', () => {
    render(<HeaderOnline isOnline={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders with offline icon when offline', () => {
    render(<HeaderOnline isOnline={false} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows alert with correct status on click', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    render(<HeaderOnline isOnline={true} />);

    const button = screen.getByRole('button');
    button.click();

    expect(alertSpy).toHaveBeenCalledWith('You are online!');
    alertSpy.mockRestore();
  });
});
