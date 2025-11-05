import React, { useContext } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import RevenueCatProvider, { RevenueCatContext } from './RevenueCatProvider';
import { UserContext, UserContextInterface } from '../UserProvider';
import { Purchases } from '@revenuecat/purchases-capacitor';

// Mock the auth helpers
jest.mock('@sudoku-web/auth', () => ({
  ...jest.requireActual('@sudoku-web/auth'),
  isCapacitor: () => true,
  isAndroid: () => false,
  isIOS: () => true,
  isElectron: () => false,
}));

// Mock the Capacitor purchases SDK
jest.mock('@revenuecat/purchases-capacitor');

// Mock the Web purchases SDK to prevent real network calls
jest.mock('@revenuecat/purchases-js', () => ({
  Purchases: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    getSharedInstance: jest.fn(() => ({
      getOfferings: jest.fn(),
      getCustomerInfo: jest.fn(),
      purchase: jest.fn(),
    })),
  },
  LogLevel: {
    Debug: 'Debug',
  },
}));

const mockPurchases = Purchases as jest.Mocked<typeof Purchases>;

const TestConsumer = () => {
  const context = useContext(RevenueCatContext);
  return <div>{context?.isSubscribed ? 'Subscribed' : 'Not Subscribed'}</div>;
};

describe('RevenueCatProvider', () => {
  const mockUser: UserContextInterface['user'] = { sub: 'user1', name: 'Test' };

  const renderWithUser = (user: UserContextInterface['user'] | null) => {
    return render(
      <UserContext.Provider value={{ user } as any}>
        <RevenueCatProvider>
          <TestConsumer />
        </RevenueCatProvider>
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPurchases.configure.mockResolvedValue(undefined);
    mockPurchases.getCustomerInfo.mockResolvedValue({
      customerInfo: { entitlements: { active: {} } },
    } as any);
    mockPurchases.getOfferings.mockResolvedValue({
      all: { default: { availablePackages: [] } },
    } as any);
  });

  it('initializes and checks subscription status for a logged-in user', async () => {
    renderWithUser(mockUser);
    await waitFor(() => {
      expect(mockPurchases.configure).toHaveBeenCalled();
      expect(mockPurchases.getCustomerInfo).toHaveBeenCalled();
    });
  });

  it('does not initialize for a logged-out user', () => {
    renderWithUser(null);
    expect(mockPurchases.configure).not.toHaveBeenCalled();
  });

  it('sets isSubscribed to true if the user has active entitlements', async () => {
    mockPurchases.getCustomerInfo.mockResolvedValue({
      customerInfo: { entitlements: { active: { Plus: {} } } },
    } as any);
    renderWithUser(mockUser);
    await waitFor(() => {
      expect(screen.getByText('Subscribed')).toBeInTheDocument();
    });
  });

  it('provides a function to purchase a package', async () => {
    const mockPackage = { identifier: 'test_package' } as any;
    mockPurchases.purchasePackage.mockResolvedValue({
      customerInfo: { entitlements: { active: {} } },
    } as any);

    let context: any;
    const Consumer = () => {
      context = useContext(RevenueCatContext);
      return null;
    };
    render(
      <UserContext.Provider value={{ user: mockUser } as any}>
        <RevenueCatProvider>
          <Consumer />
        </RevenueCatProvider>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(context.purchasePackage).toBeDefined();
    });

    await act(async () => {
      await context.purchasePackage(mockPackage);
    });

    expect(mockPurchases.purchasePackage).toHaveBeenCalledWith({
      aPackage: mockPackage,
    });
  });
});
