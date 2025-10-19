import { renderHook, act, waitFor } from '@testing-library/react';
import { useServerStorage } from './serverStorage';
import { useFetch } from './fetch';
import { useOnline } from './online';
import { StateType } from '@/types/StateType';
import { UserContext, UserContextInterface } from '@/providers/UserProvider';
import React from 'react';

jest.mock('./fetch');
jest.mock('./online');

const mockUseFetch = useFetch as jest.Mock;
const mockUseOnline = useOnline as jest.Mock;

describe('useServerStorage', () => {
  let mockFetch: jest.Mock;
  let mockGetUser: jest.Mock;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(UserContext.Provider, {
      value: { user: { sub: 'user123' } } as any,
      children,
    });
  };

  beforeEach(() => {
    mockFetch = jest.fn();
    mockGetUser = jest.fn(() => ({ sub: 'user123' }));
    mockUseFetch.mockReturnValue({ fetch: mockFetch, getUser: mockGetUser });
    mockUseOnline.mockReturnValue({ isOnline: true });
  });

  it('getValue should fetch data from the server', async () => {
    const mockData = {
      state: { a: 1 },
      updatedAt: new Date().toISOString(),
      parties: {},
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(
      () => useServerStorage({ type: StateType.PUZZLE, id: '123' }),
      { wrapper }
    );

    let value: any;
    await act(async () => {
      value = await result.current.getValue();
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
    expect(value?.state).toEqual({ a: 1 });
  });

  it('saveValue should send a PATCH request', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const { result } = renderHook(
      () => useServerStorage({ type: StateType.PUZZLE, id: '123' }),
      { wrapper }
    );

    await act(async () => {
      await result.current.saveValue({ data: 'test' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('listParties should fetch parties and their members', async () => {
    const mockPartyResponse = [
      {
        partyId: 'p1',
        createdBy: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockMemberResponse = [
      { userId: 'user123', memberNickname: 'Player 1' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPartyResponse),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMemberResponse),
    });

    const { result } = renderHook(() => useServerStorage(), { wrapper });

    let parties: any;
    await act(async () => {
      parties = await result.current.listParties();
    });

    expect(parties).toHaveLength(1);
    expect(parties![0].isOwner).toBe(true);
    expect(parties![0].members).toHaveLength(1);
  });

  it('createParty should send a POST request and return a party', async () => {
    const mockPartyResponse = {
      partyId: 'p1',
      partyName: 'New Party',
      createdBy: 'user123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPartyResponse),
    });
    const { result } = renderHook(() => useServerStorage(), { wrapper });

    let party: any;
    await act(async () => {
      party = await result.current.createParty({
        partyName: 'New Party',
        memberNickname: 'Me',
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST' })
    );
    expect(party?.partyName).toBe('New Party');
  });

  it('deleteAccount should send a DELETE request', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useServerStorage(), { wrapper });

    let success;
    await act(async () => {
      success = await result.current.deleteAccount();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(success).toBe(true);
  });
});
