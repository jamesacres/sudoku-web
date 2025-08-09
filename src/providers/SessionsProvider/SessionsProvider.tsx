'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { ServerStateResult } from '@/types/serverTypes';
import { ServerState, GameState } from '@/types/state';
import { StateType } from '@/types/StateType';
import { Timer } from '@/types/timer';
import { useServerStorage } from '@/hooks/serverStorage';
import { useLocalStorage } from '@/hooks/localStorage';

interface SessionsContextType {
  sessions: ServerStateResult<ServerState>[] | null;
  isLoading: boolean;
  fetchSessions: () => Promise<void>;
  refetchSessions: () => Promise<void>;
  setSessions: (sessions: ServerStateResult<ServerState>[]) => void;
  clearSessions: () => void;
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
  const { listValues: listServerValues } = useServerStorage();
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
        const oneMonthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
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

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        isLoading,
        fetchSessions,
        refetchSessions,
        setSessions,
        clearSessions,
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
