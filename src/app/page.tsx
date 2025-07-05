'use client';
import Footer from '@/components/Footer';
import StartPuzzleTab from '@/components/tabs/StartPuzzleTab';
import MyPuzzlesTab from '@/components/tabs/MyPuzzlesTab';
import FriendsTab from '@/components/tabs/FriendsTab';
import ActivityWidget from '@/components/ActivityWidget';
import { useLocalStorage } from '@/hooks/localStorage';
import { useOnline } from '@/hooks/online';
import { useServerStorage } from '@/hooks/serverStorage';
import { UserContext } from '@/providers/UserProvider';
import { Difficulty, Party, ServerStateResult } from '@/types/serverTypes';
import { GameState, ServerState } from '@/types/state';
import { StateType } from '@/types/StateType';
import { Timer } from '@/types/timer';
import { Tab } from '@/types/tabs';
import { UserSessions } from '@/types/userSessions';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Heart, Plus, Users } from 'react-feather';

export default function Home() {
  const [tab, setTab] = useState(Tab.START_PUZZLE);
  const router = useRouter();
  const { user, loginRedirect } = useContext(UserContext) || {};
  const { isOnline } = useOnline();
  const [isLoading, setIsLoading] = useState(false);
  const {
    getSudokuOfTheDay,
    listParties,
    listValues: listServerValues,
  } = useServerStorage();
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
  const [sessions, setSessions] = useState<ServerStateResult<ServerState>[]>();
  const [userSessions, setUserSessions] = useState<UserSessions>({});
  const [parties, setParties] = useState<Party[]>();

  const mergeSessions = useCallback(
    (newSessions: ServerStateResult<ServerState>[]) => {
      setSessions((previousSessions) => {
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
        }

        // Set sessions to combination of previous local and new server
        const mergedSessions = [
          ...newSessions,
          ...(previousSessions || []),
        ].sort(
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
      });
    },
    [prefix, saveLocalPuzzle, saveLocalTimer]
  );

  useEffect(() => {
    let active = true;

    const localState = () => {
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
    };
    localState();

    const serverState = async () => {
      const values = await listServerValues<ServerState>();
      if (active && values) {
        // Filter out server sessions older than a month
        const oneMonthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
        const recentServerSessions = values.filter(
          (session) => session.updatedAt.getTime() >= oneMonthAgo
        );
        // Merge with local
        mergeSessions(recentServerSessions);
      }
      const parties = await listParties();
      setParties(parties);
    };
    serverState();

    return () => {
      active = false;
    };
  }, [
    listServerValues,
    listLocalPuzzles,
    listLocalTimers,
    mergeSessions,
    listParties,
  ]);

  const friendsList = Array.from(
    new Set(
      parties
        ?.map(({ members }) =>
          members
            .filter(({ userId }) => userId !== user?.sub)
            .map(({ memberNickname }) => memberNickname)
        )
        .flat()
    )
  );

  const expandUser = async (partyId: string, userId: string) => {
    if (
      userSessions[userId] &&
      (userSessions[userId]?.isLoading || userSessions[userId]?.sessions)
    ) {
      // Already got sessions
      return;
    }
    setUserSessions({
      ...userSessions,
      [userId]: { isLoading: true },
    });
    const serverValuesForUser = await listServerValues<ServerState>({
      partyId,
      userId,
    });
    if (serverValuesForUser) {
      // Filter out friends' sessions older than a month
      const oneMonthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
      const recentFriendSessions = serverValuesForUser.filter(
        (session) => session.updatedAt.getTime() >= oneMonthAgo
      );
      setUserSessions({
        ...userSessions,
        [userId]: { isLoading: false, sessions: recentFriendSessions },
      });
    } else {
      setUserSessions({
        ...userSessions,
        [userId]: { isLoading: false },
      });
    }
  };

  const openSudokuOfTheDay = async (difficulty: Difficulty): Promise<void> => {
    setIsLoading(true);
    if (!user) {
      if (loginRedirect) {
        loginRedirect();
      }
      return;
    }
    const result = await getSudokuOfTheDay(difficulty);
    if (result) {
      router.push(`/puzzle?initial=${result.initial}&final=${result.final}`);
      return;
    }
    setIsLoading(false);
  };

  const tabBackground = (thisTab: Tab) =>
    thisTab === tab
      ? 'bg-transparent text-theme-primary dark:text-theme-primary-light font-semibold'
      : 'text-gray-500 dark:text-gray-400';

  return (
    <>
      <div className="container mx-auto px-6">
        <ActivityWidget sessions={sessions} />
        {tab === Tab.START_PUZZLE && (
          <StartPuzzleTab
            isOnline={isOnline}
            isLoading={isLoading}
            openSudokuOfTheDay={openSudokuOfTheDay}
            friendsList={friendsList}
            setTab={setTab}
          />
        )}
        {tab === Tab.MY_PUZZLES && <MyPuzzlesTab sessions={sessions} />}
        {tab === Tab.FRIENDS && (
          <FriendsTab
            user={user}
            parties={parties}
            expandUser={expandUser}
            userSessions={userSessions}
            mySessions={sessions}
          />
        )}
      </div>
      <Footer>
        <button
          onClick={() => setTab(Tab.START_PUZZLE)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 transition-colors duration-200 active:opacity-70 ${tabBackground(Tab.START_PUZZLE)}`}
        >
          <Plus className="text-theme-primary dark:text-theme-primary-light mb-1 h-6 w-6" />
          <span className="text-center text-xs font-medium">New Puzzle</span>
        </button>
        <button
          onClick={() => setTab(Tab.MY_PUZZLES)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 transition-colors duration-200 active:opacity-70 ${tabBackground(Tab.MY_PUZZLES)}`}
        >
          <Heart className="text-theme-primary dark:text-theme-primary-light mb-1 h-6 w-6" />
          <span className="text-center text-xs font-medium">My Puzzles</span>
        </button>
        <button
          onClick={() => setTab(Tab.FRIENDS)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 transition-colors duration-200 active:opacity-70 ${tabBackground(Tab.FRIENDS)}`}
        >
          <Users className="text-theme-primary dark:text-theme-primary-light mb-1 h-6 w-6" />
          <span className="text-center text-xs font-medium">Friends</span>
        </button>
      </Footer>
    </>
  );
}
