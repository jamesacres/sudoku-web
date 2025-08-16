'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { ServerStateResult, Party } from '@/types/serverTypes';
import { ServerState, GameState } from '@/types/state';
import { StateType } from '@/types/StateType';
import { Timer } from '@/types/timer';
import { UserSessions } from '@/types/userSessions';
import { useServerStorage } from '@/hooks/serverStorage';
import { useLocalStorage } from '@/hooks/localStorage';

interface SessionsContextType {
  sessions: ServerStateResult<ServerState>[] | null;
  isLoading: boolean;
  fetchSessions: () => Promise<void>;
  refetchSessions: () => Promise<void>;
  setSessions: (sessions: ServerStateResult<ServerState>[]) => void;
  clearSessions: () => void;
  // Friend sessions
  friendSessions: UserSessions;
  isFriendSessionsLoading: boolean;
  fetchFriendSessions: (parties: Party[]) => Promise<void>;
  clearFriendSessions: () => void;
}

const SessionsContext = createContext<SessionsContextType | null>(null);

interface SessionsProviderProps {
  children: ReactNode;
}

export const SessionsProvider = ({ children }: SessionsProviderProps) => {
  const [sessions, setSessionsState] = useState<
    ServerStateResult<ServerState>[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [friendSessions, setFriendSessions] = useState<UserSessions>({});
  const [isFriendSessionsLoading, setIsFriendSessionsLoading] = useState(false);
  const friendSessionsRef = useRef<UserSessions>({});
  const { listValues: listServerValues } = useServerStorage();

  // Update ref whenever friendSessions state changes
  friendSessionsRef.current = friendSessions;
  const {
    prefix,
    listValues: listLocalPuzzles,
    saveValue: saveLocalPuzzle,
  } = useLocalStorage({
    type: StateType.PUZZLE,
  });
  const { listValues: listLocalTimers, saveValue: saveLocalTimer } =
    useLocalStorage({
      type: StateType.TIMER,
    });

  const mergeSessions = useCallback(
    (newSessions: ServerStateResult<ServerState>[]) => {
      setSessionsState((previousSessions) => {
        if (previousSessions) {
          // If missing previously, update local with server value
          const missingLocally = newSessions.filter(
            (serverValue) =>
              !previousSessions?.find(
                (session) => serverValue.sessionId === session.sessionId
              )
          );
          missingLocally.map((serverState) => {
            const { sessionId: sessionIdWithPrefix, state } = serverState;
            if (sessionIdWithPrefix.startsWith(prefix) && state) {
              const sessionId = sessionIdWithPrefix.replace(prefix, '');
              const { timer: serverTimerState, ...serverGameState } = state;
              console.info('Saving missing local puzzle', sessionId);
              saveLocalPuzzle<GameState>(serverGameState, {
                overrideId: sessionId,
              });
              if (serverTimerState) {
                console.info('Saving missing local timer', sessionId);
                saveLocalTimer<Timer>(serverTimerState, {
                  overrideId: sessionId,
                });
              }
            }
          });

          // Set sessions to combination of previous local and new server
          const mergedSessions = [...newSessions, ...previousSessions].sort(
            // Sort newest first
            ({ updatedAt: a }, { updatedAt: b }) => b.getTime() - a.getTime()
          );
          const uniqueSessions = mergedSessions.filter(
            ({ sessionId }, i) =>
              // If index greater then filter out duplicate
              i <=
              mergedSessions.findIndex((other) => other.sessionId === sessionId)
          );
          return uniqueSessions;
        }
        return newSessions;
      });
    },
    [prefix, saveLocalPuzzle, saveLocalTimer]
  );

  const loadSessionsData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Clear existing sessions first
      setSessionsState(null);

      // Load local sessions
      const localGameStates = listLocalPuzzles<GameState>();
      const localTimers = listLocalTimers<Timer>();
      const localSessions: ServerStateResult<ServerState>[] =
        localGameStates.map((localGameState) => {
          return {
            ...localGameState,
            updatedAt: new Date(localGameState.lastUpdated),
            state: {
              ...localGameState.state,
              timer: localTimers.find(
                (timer) => timer.sessionId === localGameState.sessionId
              )?.state,
            },
          };
        });
      mergeSessions(localSessions);

      // Load server sessions
      const serverSessions = await listServerValues<ServerState>();
      if (serverSessions) {
        // Filter out server sessions older than a month
        const oneMonthAgo = new Date().getTime() - 32 * 24 * 60 * 60 * 1000;
        const recentServerSessions = serverSessions.filter(
          (session) => session.updatedAt.getTime() >= oneMonthAgo
        );
        mergeSessions(recentServerSessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [listLocalPuzzles, listLocalTimers, listServerValues, mergeSessions]);

  const fetchSessions = useCallback(async () => {
    // If sessions already exist or currently loading, don't fetch again
    if (sessions || isLoading) {
      return;
    }

    await loadSessionsData();
  }, [sessions, isLoading, loadSessionsData]);

  const refetchSessions = useCallback(async () => {
    // Force refetch regardless of current state
    await loadSessionsData();
  }, [loadSessionsData]);

  const setSessions = useCallback(
    (newSessions: ServerStateResult<ServerState>[]) => {
      setSessionsState(newSessions);
    },
    []
  );

  const clearSessions = useCallback(() => {
    setSessionsState(null);
  }, []);

  const fetchFriendSessions = useCallback(
    async (parties: Party[]) => {
      if (isFriendSessionsLoading) {
        return;
      }

      setIsFriendSessionsLoading(true);

      try {
        // Get all unique friend user IDs from all parties
        const friendUserIds = Array.from(
          new Set(
            parties
              .flatMap(({ members }) => members)
              .map(({ userId }) => userId)
          )
        );

        // Set loading state for each user first
        const loadingStates: UserSessions = {};
        friendUserIds.forEach((userId) => {
          if (
            !friendSessionsRef.current[userId] ||
            (!friendSessionsRef.current[userId]?.isLoading &&
              !friendSessionsRef.current[userId]?.sessions)
          ) {
            loadingStates[userId] = { isLoading: true };
          }
        });

        // Update state with loading indicators
        setFriendSessions((prev) => ({ ...prev, ...loadingStates }));

        // Fetch sessions for users that need loading
        const fetchPromises = friendUserIds
          .filter((userId) => loadingStates[userId]) // Only fetch for users we marked as loading
          .map(async (userId) => {
            try {
              // Find a party this user belongs to (we need partyId for the API call)
              const userParty = parties.find((party) =>
                party.members.some((member) => member.userId === userId)
              );

              if (!userParty) {
                return { userId, sessions: null };
              }

              const serverValuesForUser = await listServerValues<ServerState>({
                partyId: userParty.partyId,
                userId,
              });

              if (serverValuesForUser) {
                // Filter out friends' sessions older than a month
                const oneMonthAgo =
                  new Date().getTime() - 32 * 24 * 60 * 60 * 1000;
                const recentFriendSessions = serverValuesForUser.filter(
                  (session) => session.updatedAt.getTime() >= oneMonthAgo
                );
                return { userId, sessions: recentFriendSessions };
              } else {
                return { userId, sessions: null };
              }
            } catch (error) {
              console.error(
                `Error fetching sessions for user ${userId}:`,
                error
              );
              return { userId, sessions: null };
            }
          });

        const results = await Promise.all(fetchPromises);

        // Update state with results
        setFriendSessions((prev) => {
          const updated = { ...prev };
          results.forEach(({ userId, sessions }) => {
            updated[userId] = {
              isLoading: false,
              sessions: sessions || undefined,
            };
          });
          return updated;
        });
      } catch (error) {
        console.error('Error fetching friend sessions:', error);
      } finally {
        setIsFriendSessionsLoading(false);
      }
    },
    [listServerValues, isFriendSessionsLoading]
  );

  const clearFriendSessions = useCallback(() => {
    setFriendSessions({});
  }, []);

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        isLoading,
        fetchSessions,
        refetchSessions,
        setSessions,
        clearSessions,
        friendSessions,
        isFriendSessionsLoading,
        fetchFriendSessions,
        clearFriendSessions,
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
};
