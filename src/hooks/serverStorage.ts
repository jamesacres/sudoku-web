'use client';

import { useCallback, useContext } from 'react';
import { useFetch } from './fetch';
import { UserContext } from '../providers/UserProvider';
import { StateType } from '@/types/StateType';
import { useOnline } from './online';

const app = 'sudoku';
const apiUrl = 'https://api.bubblyclouds.com';

interface SessionResponse<T> {
  sessionId: string;
  state: T;
  updatedAt: string;
}

interface SessionResult<T> {
  sessionId: string;
  state: T;
  updatedAt: Date;
}

interface Parties<T> {
  [partyId: string]: {
    memberSessions: {
      [userId: string]: T;
    };
  };
}

interface StateResponse<T> extends SessionResponse<T> {
  parties: Parties<SessionResponse<T>>;
}

export interface ServerStateResult<T> extends SessionResult<T> {
  parties?: Parties<SessionResult<T>>;
}

const responseToResult = <T>(
  response: StateResponse<T>
): ServerStateResult<T> => {
  return {
    parties: response.parties
      ? Object.entries(response.parties).reduce(
          (result, [partyId, partyResponse]) => {
            return {
              ...result,
              [partyId]: {
                memberSessions: Object.entries(
                  partyResponse.memberSessions
                ).reduce((result, [userId, memberSessionResponse]) => {
                  const memberSessionResult: SessionResult<T> = {
                    sessionId: response.sessionId,
                    state: memberSessionResponse.state,
                    updatedAt: new Date(memberSessionResponse.updatedAt),
                  };
                  return {
                    ...result,
                    [userId]: memberSessionResult,
                  };
                }, {}),
              },
            };
          },
          {}
        )
      : undefined,
    sessionId: response.sessionId,
    state: response.state,
    updatedAt: new Date(response.updatedAt),
  };
};

function useServerStorage({
  type,
  id,
}: { type?: StateType; id?: string } = {}) {
  const { user, logout } = useContext(UserContext) || {};
  const { fetch, getUser } = useFetch();
  const { isOnline } = useOnline();
  console.info('online', isOnline);

  const isLoggedIn = useCallback(() => {
    if (user) {
      if (getUser()) {
        return true;
      }
      console.warn('no longer logged in, logging out');
      if (logout) {
        logout();
      }
    }
    console.warn('not logged in');
    return false;
  }, [getUser, logout, user]);

  const getStateKey = useCallback(() => {
    let key = `${app}-${id}`;
    if (type !== StateType.PUZZLE) {
      key = `${key}-${type}`;
    }
    return key;
  }, [id, type]);

  const listValues = useCallback(async <T>(): Promise<
    ServerStateResult<T>[]
  > => {
    if (isOnline && isLoggedIn()) {
      try {
        console.info('fetching sessions');
        const response = await fetch(
          new Request(`${apiUrl}/sessions?app=${app}`)
        );
        if (response.ok) {
          return (<StateResponse<T>[]>await response.json()).map((item) =>
            responseToResult(item)
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  }, [fetch, isLoggedIn, isOnline]);

  const getValue = useCallback(async <T>(): Promise<
    ServerStateResult<T> | undefined
  > => {
    if (isOnline && isLoggedIn()) {
      try {
        const stateKey = getStateKey();
        console.info('fetching session', stateKey);
        const response = await fetch(
          new Request(`${apiUrl}/sessions/${stateKey}`)
        );
        if (response.ok) {
          return responseToResult(await response.json());
        }
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }, [getStateKey, fetch, isLoggedIn, isOnline]);

  const saveValue = useCallback(
    async <T>(state: T): Promise<ServerStateResult<T> | undefined> => {
      if (isOnline && isLoggedIn()) {
        try {
          const stateKey = getStateKey();
          console.info('fetching session', stateKey);
          const response = await fetch(
            new Request(`${apiUrl}/sessions/${stateKey}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                state,
              }),
            })
          );
          if (response.ok) {
            return responseToResult(await response.json());
          }
        } catch (e) {
          console.error(e);
        }
      }
      return undefined;
    },
    [getStateKey, fetch, isLoggedIn, isOnline]
  );

  return { listValues, getValue, saveValue };
}

export { useServerStorage };
