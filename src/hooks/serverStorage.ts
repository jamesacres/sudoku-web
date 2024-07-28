'use client';

import { useCallback, useContext } from 'react';
import { useFetch } from './fetch';
import { UserContext } from '../providers/UserProvider';
import { StateType } from '@/types/StateType';

const apiUrl = 'https://api.bubblyclouds.com';

interface SessionResponse<T> {
  state: T;
  updatedAt: string;
}

interface SessionResult<T> {
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
  parties: Parties<SessionResult<T>>;
}

const responseToResult = <T>(
  response: StateResponse<T>
): ServerStateResult<T> => {
  return {
    parties: Object.entries(response.parties).reduce(
      (result, [partyId, partyResponse]) => {
        return {
          ...result,
          [partyId]: {
            memberSessions: Object.entries(partyResponse.memberSessions).reduce(
              (result, [userId, memberSessionResponse]) => {
                const memberSessionResult: SessionResult<T> = {
                  state: memberSessionResponse.state,
                  updatedAt: new Date(memberSessionResponse.updatedAt),
                };
                return {
                  ...result,
                  [userId]: memberSessionResult,
                };
              },
              {}
            ),
          },
        };
      },
      {}
    ),
    state: response.state,
    updatedAt: new Date(response.updatedAt),
  };
};

function useServerStorage({ type, id }: { type: StateType; id: string }) {
  const { user } = useContext(UserContext) || {};
  const { fetch } = useFetch();

  const getStateKey = useCallback(() => {
    let key = `sudoku-${id}`;
    if (type !== StateType.PUZZLE) {
      key = `${key}-${type}`;
    }
    return key;
  }, [id, type]);

  const getValue = useCallback(async <T>(): Promise<
    ServerStateResult<T> | undefined
  > => {
    if (user) {
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
  }, [getStateKey, fetch, user]);

  const saveValue = useCallback(
    async <T>(state: T): Promise<ServerStateResult<T> | undefined> => {
      if (user) {
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
    [getStateKey, fetch, user]
  );

  return { getValue, saveValue };
}

export { useServerStorage };
