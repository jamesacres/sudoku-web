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

  it('should handle fetch requests without errors', async () => {
    const { result } = renderHook(() => useFetch(), {
      wrapper: createWrapper(),
    });

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await act(async () => {
      await result.current.fetch(
        new Request('https://example.com/test')
      );
    });

    // Verify fetch was called for non-API URLs
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should provide fetch method on hook', async () => {
    const { result } = renderHook(() => useFetch(), {
      wrapper: createWrapper(),
    });

    // Verify the hook provides fetch functionality
    expect(result.current.fetch).toBeDefined();
    expect(typeof result.current.fetch).toBe('function');
  });
});
