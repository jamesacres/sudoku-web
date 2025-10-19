import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeaderUser from './HeaderUser';
import { UserContext, UserContextInterface } from '@/providers/UserProvider';
import { UserProfile } from '@/types/userProfile';
import { useOnline } from '@/hooks/online';

// Mock the useOnline hook
jest.mock('@/hooks/online');

// Mock UserButton
jest.mock('./UserButton', () => ({
  __esModule: true,
  UserButton: ({ user }: { user: UserProfile }) => (
    <div data-testid="user-button">User Button - {user.name}</div>
  ),
}));

describe('HeaderUser', () => {
  const mockUser: UserProfile = {
    sub: 'test-user-id',
    name: 'John Doe',
    given_name: 'John',
    family_name: 'Doe',
    picture: 'https://example.com/avatar.jpg',
  };

  let mockLogout: jest.Mock;
  let mockLoginRedirect: jest.Mock;
  let mockUseOnline: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout = jest.fn();
    mockLoginRedirect = jest.fn();
    mockUseOnline = useOnline as jest.Mock;
    mockUseOnline.mockReturnValue({ isOnline: true });
  });

  const renderWithContext = (contextValue: Partial<UserContextInterface> | null) => {
    return render(
      <UserContext.Provider value={contextValue as UserContextInterface}>
        <HeaderUser />
      </UserContext.Provider>
    );
  };

  describe('rendering logged in user', () => {
    it('should render UserButton when user is logged in', () => {
      renderWithContext({ user: mockUser, logout: mockLogout });
      expect(screen.getByTestId('user-button')).toBeInTheDocument();
      expect(
        screen.getByText(`User Button - ${mockUser.name}`)
      ).toBeInTheDocument();
    });

    it('should not render sign-in button when user is logged in', () => {
      renderWithContext({ user: mockUser, logout: mockLogout });
      expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    });
  });

  describe('rendering logged out user', () => {
    it('should render sign-in button when user is not logged in and online', () => {
      renderWithContext({ user: undefined, loginRedirect: mockLoginRedirect });
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('should not render anything when user is not logged in and offline', () => {
      mockUseOnline.mockReturnValue({ isOnline: false });
      renderWithContext({ user: undefined, loginRedirect: mockLoginRedirect });
      expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-button')).not.toBeInTheDocument();
    });
  });

  describe('sign-in button functionality', () => {
    it('should call loginRedirect when sign-in button is clicked', async () => {
      renderWithContext({ user: undefined, loginRedirect: mockLoginRedirect });
      const signInButton = screen.getByText('Sign in');
      fireEvent.click(signInButton);
      await waitFor(() => {
        expect(mockLoginRedirect).toHaveBeenCalledWith({ userInitiated: true });
      });
    });

    it('should disable sign-in button when isLoggingIn is true', () => {
      renderWithContext({
        user: undefined,
        loginRedirect: mockLoginRedirect,
        isLoggingIn: true,
      });
      const signInButton = screen.getByRole('button');
      expect(signInButton).toBeDisabled();
      expect(signInButton).toHaveClass('cursor-wait');
    });
  });

  describe('undefined context', () => {
    it('should handle undefined context gracefully', () => {
      renderWithContext(null);
      expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    });
  });

  describe('context changes', () => {
    it('should update when user logs in', () => {
      const { rerender } = renderWithContext({
        user: undefined,
        loginRedirect: mockLoginRedirect,
      });
      expect(screen.getByText('Sign in')).toBeInTheDocument();

      rerender(
        <UserContext.Provider
          value={{ user: mockUser, logout: mockLogout } as unknown as UserContextInterface}
        >
          <HeaderUser />
        </UserContext.Provider>
      );

      expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
      expect(screen.getByTestId('user-button')).toBeInTheDocument();
    });
  });
});
