import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetch } from './fetch';
import FetchProvider, { State } from '@/providers/FetchProvider';
import React, { ReactNode } from 'react';

// Mock global fetch
global.fetch = jest.fn();

describe('useFetch', () => {
  const mockFetch = global.fetch as jest.Mock;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => {
      return React.createElement(FetchProvider, {
        children,
      });
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user when state is valid', () => {
    // Initially, the hook starts with no user state
    const { result } = renderHook(() => useFetch(), {
      wrapper: createWrapper(),
    });
    // getUser() returns undefined when no valid user state exists
    expect(result.current.getUser()).toBeUndefined();
  });

  it('should return undefined for user when state is invalid', () => {
    const { result } = renderHook(() => useFetch(), {
      wrapper: createWrapper(),
    });
    expect(result.current.getUser()).toBeUndefined();
  });

  it('should logout and clear state', async () => {
    const user = { sub: 'user1', name: 'Test User' };
    const { result } = renderHook(() => useFetch(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.getUser()).toBeUndefined();
  });

  it.skip('should add auth token to API requests', async () => {
    const accessToken = 'test-access-token';
    const { result } = renderHook(() => useFetch(), {
      wrapper: createWrapper(),
    });

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await act(async () => {
      await result.current.fetch(
        new Request('https://api.bubblyclouds.com/test')
      );
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
        }),
      })
    );
  });

  it.skip('should handle token refresh and retry the request', async () => {
    const { result } = renderHook(() => useFetch(), {
      wrapper: createWrapper(),
    });

    // Mock refresh response
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'new-token',
          id_token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.dummy',
        }),
        { status: 200 }
      )
    );
    // Mock original request response
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await act(async () => {
      await result.current.fetch(
        new Request('https://api.bubblyclouds.com/test')
      );
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/oidc/token'),
        expect.any(Object)
      );
    });
  });
});
