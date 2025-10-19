import React, { useContext } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import PartiesProvider, { PartiesContext } from './PartiesProvider';
import { useServerStorage } from '@/hooks/serverStorage';
import { UserContext, UserContextInterface } from '@/providers/UserProvider';
import { Party } from '@/types/serverTypes';

jest.mock('@/hooks/serverStorage');

const mockUseServerStorage = useServerStorage as jest.Mock;

const TestConsumer = () => {
  const context = useContext(PartiesContext);
  return <div>{context?.parties.length} parties</div>;
};

describe('PartiesProvider', () => {
  let mockListParties: jest.Mock;
  let mockCreateParty: jest.Mock;

  beforeEach(() => {
    mockListParties = jest.fn().mockResolvedValue([]);
    mockCreateParty = jest.fn();
    mockUseServerStorage.mockReturnValue({
      listParties: mockListParties,
      createParty: mockCreateParty,
      updateParty: jest.fn(),
      leaveParty: jest.fn(),
      removeMember: jest.fn(),
      deleteParty: jest.fn(),
    });
  });

  const renderWithUser = (user: UserContextInterface['user']) => {
    return render(
      <UserContext.Provider value={{ user } as any}>
        <PartiesProvider>
          <TestConsumer />
        </PartiesProvider>
      </UserContext.Provider>
    );
  };

  it('lazy loads parties for a logged-in user', async () => {
    const mockParties: Party[] = [
      {
        partyId: '1',
        appId: 'app-1',
        partyName: 'Test Party',
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isOwner: true,
        members: [],
      },
    ];
    mockListParties.mockResolvedValue(mockParties);
    const user = { sub: 'user1', name: 'Test' };

    let context: any;
    const Consumer = () => {
      context = useContext(PartiesContext);
      return <div>{context?.parties.length} parties</div>;
    };

    render(
      <UserContext.Provider value={{ user } as any}>
        <PartiesProvider>
          <Consumer />
        </PartiesProvider>
      </UserContext.Provider>
    );

    // Explicitly call lazyLoadParties since it's not called automatically on mount
    await act(async () => {
      await context.lazyLoadParties();
    });

    await waitFor(() => {
      expect(mockListParties).toHaveBeenCalled();
      expect(screen.getByText('1 parties')).toBeInTheDocument();
    });
  });

  it('does not load parties for a logged-out user', () => {
    renderWithUser(undefined);
    expect(mockListParties).not.toHaveBeenCalled();
    expect(screen.getByText('0 parties')).toBeInTheDocument();
  });

  it('allows creating a party', async () => {
    const newParty: Party = {
      partyId: '2',
      appId: 'app-1',
      partyName: 'New Party',
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      isOwner: true,
      members: [],
    };
    mockCreateParty.mockResolvedValue(newParty);
    const user = { sub: 'user1', name: 'Test' };

    let context: any;
    const Consumer = () => {
      context = useContext(PartiesContext);
      return null;
    };

    render(
      <UserContext.Provider value={{ user } as any}>
        <PartiesProvider>
          <Consumer />
        </PartiesProvider>
      </UserContext.Provider>
    );

    await act(async () => {
      await context.saveParty({ partyName: 'New Party', memberNickname: 'Me' });
    });

    expect(mockCreateParty).toHaveBeenCalledWith({
      partyName: 'New Party',
      memberNickname: 'Me',
    });
    expect(context.parties).toContain(newParty);
  });
});
