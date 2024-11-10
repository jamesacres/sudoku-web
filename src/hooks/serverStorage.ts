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

export interface SessionResult<T> {
  sessionId: string;
  state: T;
  updatedAt: Date;
}

export interface SessionParty<T> {
  memberSessions: {
    [userId: string]: T | undefined;
  };
}

export interface Parties<T> {
  [partyId: string]: SessionParty<T> | undefined;
}

interface StateResponse<T> extends SessionResponse<T> {
  parties: Parties<SessionResponse<T>>;
}

export interface ServerStateResult<T> extends SessionResult<T> {
  parties?: Parties<SessionResult<T>>;
}

interface PartyResponse {
  partyId: string;
  appId: string;
  partyName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MemberResponse {
  userId: string;
  resourceId: string;
  memberNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberResult
  extends Omit<MemberResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;
  isUser: boolean;
}

export interface PartyResult
  extends Omit<PartyResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;
  members: MemberResult[];
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
                  partyResponse!.memberSessions
                ).reduce((result, [userId, memberSessionResponse]) => {
                  const memberSessionResult: SessionResult<T> = {
                    sessionId: response.sessionId,
                    state: memberSessionResponse!.state,
                    updatedAt: new Date(memberSessionResponse!.updatedAt),
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
    ServerStateResult<T>[] | undefined
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
    return undefined;
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

  const partyResponseToResult = useCallback(
    (party: PartyResponse, members: MemberResult[]) => {
      return {
        ...party,
        members,
        createdAt: new Date(party.createdAt),
        updatedAt: new Date(party.updatedAt),
        isOwner: party.createdBy === user?.sub,
      };
    },
    [user]
  );

  const memberResponseToResult = useCallback(
    (member: MemberResponse, partyCreatedBy?: string) => {
      return {
        ...member,
        createdAt: new Date(member.createdAt),
        updatedAt: new Date(member.updatedAt),
        isOwner: member.userId === partyCreatedBy,
        isUser: member.userId === user?.sub,
      };
    },
    [user]
  );

  const listParties = useCallback(async (): Promise<
    PartyResult[] | undefined
  > => {
    if (isOnline && isLoggedIn()) {
      try {
        console.info('fetching parties');
        const response = await fetch(
          new Request(`${apiUrl}/parties?app=${app}`)
        );
        if (response.ok) {
          const result: PartyResult[] = [];
          const partiesResponse = <PartyResponse[]>await response.json();
          for (const party of partiesResponse) {
            const memberResponse = await fetch(
              new Request(`${apiUrl}/members?resourceId=party-${party.partyId}`)
            );
            const membersResponse =
              memberResponse.ok &&
              <MemberResponse[]>await memberResponse.json();
            const members = membersResponse
              ? membersResponse.map((member) =>
                  memberResponseToResult(member, party.createdBy)
                )
              : [];
            result.push(partyResponseToResult(party, members));
          }
          return result;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }, [
    fetch,
    isLoggedIn,
    isOnline,
    memberResponseToResult,
    partyResponseToResult,
  ]);

  const createParty = useCallback(
    async ({
      partyName,
      memberNickname,
    }: {
      partyName: string;
      memberNickname: string;
    }): Promise<PartyResult | undefined> => {
      if (isOnline && isLoggedIn()) {
        try {
          const response = await fetch(
            new Request(`${apiUrl}/parties`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                partyName,
                memberNickname,
                appId: app,
              }),
            })
          );
          if (response.ok) {
            const partyResponse = (await response.json()) as PartyResponse;
            return partyResponseToResult(partyResponse, [
              memberResponseToResult(
                {
                  memberNickname,
                  createdAt: partyResponse.createdAt,
                  resourceId: `party-${partyResponse.partyId}`,
                  updatedAt: partyResponse.updatedAt,
                  userId: user?.sub || '',
                },
                user?.sub
              ),
            ]);
          }
        } catch (e) {
          console.error(e);
        }
      }
      return undefined;
    },
    [
      fetch,
      isLoggedIn,
      isOnline,
      memberResponseToResult,
      partyResponseToResult,
      user,
    ]
  );

  return { listValues, getValue, saveValue, listParties, createParty };
}

export { useServerStorage };
