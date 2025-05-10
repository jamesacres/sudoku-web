'use client';

import { useCallback, useContext, useRef } from 'react';
import { useFetch } from './fetch';
import { UserContext } from '../providers/UserProvider';
import { StateType } from '@/types/StateType';
import { useOnline } from './online';
import {
  MemberResponse,
  Member,
  PartyResponse,
  Party,
  ServerStateResult,
  Session,
  StateResponse,
  Invite,
  InviteResponse,
  PublicInvite,
  SudokuOfTheDay,
  SudokuOfTheDayResponse,
  Difficulty,
} from '@/types/serverTypes';
import { UserProfile } from '@/types/userProfile';

const app = 'sudoku';
const apiUrl = 'https://api.bubblyclouds.com';

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
                  const memberSessionResult: Session<T> = {
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

const partyResponseToResult = (
  party: PartyResponse,
  members: Member[],
  user: UserProfile | undefined
) => {
  return {
    ...party,
    members,
    createdAt: new Date(party.createdAt),
    updatedAt: new Date(party.updatedAt),
    isOwner: party.createdBy === user?.sub,
  };
};

const memberResponseToResult = (
  member: MemberResponse,
  user: UserProfile | undefined,
  partyCreatedBy?: string
) => {
  return {
    ...member,
    createdAt: new Date(member.createdAt),
    updatedAt: new Date(member.updatedAt),
    isOwner: member.userId === partyCreatedBy,
    isUser: member.userId === user?.sub,
  };
};

function useServerStorage({
  type: initialType,
  id: initialId,
}: { type?: StateType; id?: string } = {}) {
  const state = useRef({
    id: initialId,
    type: initialType,
  });
  const { user, logout } = useContext(UserContext) || {};
  const { fetch, getUser } = useFetch();
  const { isOnline } = useOnline();

  const setIdAndType = ({
    type: newType,
    id: newId,
  }: { type?: StateType; id?: string } = {}) => {
    state.current.id = newId;
    state.current.type = newType;
  };
  const getStateKey = useCallback(() => {
    const { id, type } = state.current;
    if (!(id && type)) {
      throw Error('Unknown id and type');
    }
    let key = `${app}-${id}`;
    if (type !== StateType.PUZZLE) {
      key = `${key}-${type}`;
    }
    return key;
  }, []);

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

  const listParties = useCallback(async (): Promise<Party[] | undefined> => {
    if (isOnline && isLoggedIn()) {
      try {
        console.info('fetching parties');
        const response = await fetch(
          new Request(`${apiUrl}/parties?app=${app}`)
        );
        if (response.ok) {
          const result: Party[] = [];
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
                  memberResponseToResult(member, user, party.createdBy)
                )
              : [];
            result.push(partyResponseToResult(party, members, user));
          }
          return result;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }, [fetch, isLoggedIn, isOnline, user]);

  const createParty = useCallback(
    async ({
      partyName,
      memberNickname,
    }: {
      partyName: string;
      memberNickname: string;
    }): Promise<Party | undefined> => {
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
            return partyResponseToResult(
              partyResponse,
              [
                memberResponseToResult(
                  {
                    memberNickname,
                    createdAt: partyResponse.createdAt,
                    resourceId: `party-${partyResponse.partyId}`,
                    updatedAt: partyResponse.updatedAt,
                    userId: user?.sub || '',
                  },
                  user,
                  user?.sub
                ),
              ],
              user
            );
          }
        } catch (e) {
          console.error(e);
        }
      }
      return undefined;
    },
    [fetch, isLoggedIn, isOnline, user]
  );

  const createInvite = useCallback(
    async ({
      resourceId,
      description,
      sessionId,
      redirectUri,
      expiresAt,
    }: {
      resourceId: string;
      description: string;
      sessionId: string;
      redirectUri: string;
      expiresAt: string;
    }): Promise<Invite | undefined> => {
      if (isOnline && isLoggedIn()) {
        try {
          const response = await fetch(
            new Request(`${apiUrl}/invites`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                resourceId,
                description,
                sessionId,
                redirectUri,
                expiresAt,
              }),
            })
          );
          if (response.ok) {
            const inviteResponse = (await response.json()) as InviteResponse;
            return {
              ...inviteResponse,
              expiresAt: new Date(inviteResponse.expiresAt),
              createdAt: new Date(inviteResponse.createdAt),
              updatedAt: new Date(inviteResponse.updatedAt),
            };
          }
        } catch (e) {
          console.error(e);
        }
      }
      return undefined;
    },
    [fetch, isLoggedIn, isOnline]
  );

  const getPublicInvite = useCallback(
    async (inviteId: string): Promise<PublicInvite | undefined> => {
      if (isOnline) {
        try {
          const response = await fetch(
            new Request(`${apiUrl}/invites/${inviteId}`)
          );
          if (response.ok) {
            const publicInviteResponse =
              (await response.json()) as PublicInvite;
            return publicInviteResponse;
          }
        } catch (e) {
          console.error(e);
        }
      }
      return undefined;
    },
    [fetch, isOnline]
  );

  const createMember = useCallback(
    async ({
      inviteId,
      memberNickname,
    }: {
      inviteId: string;
      memberNickname: string;
    }): Promise<Member | undefined> => {
      if (isOnline && isLoggedIn()) {
        try {
          const response = await fetch(
            new Request(`${apiUrl}/members`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inviteId,
                memberNickname,
              }),
            })
          );
          if (response.ok) {
            const memberResponse = (await response.json()) as MemberResponse;
            return {
              ...memberResponse,
              createdAt: new Date(memberResponse.createdAt),
              updatedAt: new Date(memberResponse.updatedAt),
              isOwner: false,
              isUser: true,
            };
          }
        } catch (e) {
          console.error(e);
        }
      }
      return undefined;
    },
    [fetch, isLoggedIn, isOnline]
  );

  const getSudokuOfTheDay = useCallback(
    async (difficulty: Difficulty): Promise<SudokuOfTheDay | undefined> => {
      if (isOnline && isLoggedIn()) {
        try {
          console.info('fetching sudoku of the day', difficulty);
          const response = await fetch(
            new Request(`${apiUrl}/sudoku/ofTheDay?difficulty=${difficulty}`)
          );
          if (response.ok) {
            const sudokuOfTheDayResponse =
              (await response.json()) as SudokuOfTheDayResponse;
            return {
              ...sudokuOfTheDayResponse,
              createdAt: new Date(sudokuOfTheDayResponse.createdAt),
              updatedAt: new Date(sudokuOfTheDayResponse.updatedAt),
            };
          }
        } catch (e) {
          console.error(e);
        }
      }
      return undefined;
    },
    [fetch, isLoggedIn, isOnline]
  );

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    if (isOnline && isLoggedIn() && user) {
      try {
        console.info('deleting account', user.sub);
        const response = await fetch(
          new Request(`${apiUrl}/account`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
        return response.ok;
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  }, [fetch, isLoggedIn, isOnline, user]);

  return {
    setIdAndType,
    listValues,
    getValue,
    saveValue,
    listParties,
    createParty,
    createInvite,
    getPublicInvite,
    createMember,
    getSudokuOfTheDay,
    deleteAccount,
  };
}
export { useServerStorage };
