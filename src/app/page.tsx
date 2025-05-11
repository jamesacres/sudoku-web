'use client';
import Footer from '@/components/Footer';
import SimpleSudoku from '@/components/SimpleSudoku';
import { TimerDisplay } from '@/components/TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import {
  puzzleTextToPuzzle,
  puzzleToPuzzleText,
} from '@/helpers/puzzleTextToPuzzle';
import { useLocalStorage } from '@/hooks/localStorage';
import { useOnline } from '@/hooks/online';
import { useServerStorage } from '@/hooks/serverStorage';
import { UserContext } from '@/providers/UserProvider';
import { Difficulty, Party, ServerStateResult } from '@/types/serverTypes';
import { GameState, ServerState } from '@/types/state';
import { StateType } from '@/types/StateType';
import { Timer } from '@/types/timer';
import { UserProfile } from '@/types/userProfile';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Camera, ChevronDown, Heart, Loader, Plus, Users } from 'react-feather';

enum Tab {
  START_PUZZLE = 'START_PUZZLE',
  MY_PUZZLES = 'MY_PUZZLES',
  FRIENDS = 'FRIENDS',
}

interface UserSessions {
  [userId: string]:
    | {
        isLoading: boolean;
        sessions?: ServerStateResult<ServerState>[];
      }
    | undefined;
}

const StartPuzzle = (
  isOnline: boolean,
  isLoading: boolean,
  openSudokuOfTheDay: (difficulty: Difficulty) => Promise<void>,
  friendsList: string[] | undefined,
  setTab: (tab: Tab) => void
) => {
  return (
    <div className="mb-4">
      <h1 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-4xl font-bold text-transparent">
        New Puzzle
      </h1>

      <h2 className="mt-8 mb-2 bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
        📸 Import
      </h2>
      <p className="mt-2">
        Scan an unsolved puzzle from a newspaper, puzzle book or sudoku website.
        Solve it and challenge your friends!
      </p>
      <Link
        href="/import"
        className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-3 text-base font-medium text-white shadow-md hover:from-blue-500 hover:to-blue-600 active:from-blue-600 active:to-blue-700"
      >
        <Camera className="mr-2 h-5 w-5" /> Import with camera
      </Link>

      <h2 className="mt-8 mb-2 bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-2xl font-bold text-transparent">
        🌱 Sudoku of the Day
      </h2>
      <p>
        Challenge yourself daily with our Sudoku of the Day. Start on level 1,
        work your way up and challenge your friends!
      </p>
      <div className="mt-4 grid max-w-sm grid-cols-2 gap-3">
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.SIMPLE)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-green-400 to-green-500 px-4 py-2 text-xl font-bold text-white shadow-md hover:from-green-500 hover:to-green-600 active:from-green-600 active:to-green-700 disabled:opacity-50`}
        >
          ✏️
          <span className="mt-2 text-base font-medium">Level 1</span>
        </button>
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.EASY)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-yellow-400 to-yellow-500 px-4 py-2 text-xl font-bold text-white shadow-md hover:from-yellow-500 hover:to-yellow-600 active:from-yellow-600 active:to-yellow-700 disabled:opacity-50`}
        >
          😎😎
          <span className="mt-2 text-base font-medium">Level 2</span>
        </button>
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.INTERMEDIATE)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-4 py-2 text-xl font-bold text-white shadow-md hover:from-orange-500 hover:to-orange-600 active:from-orange-600 active:to-orange-700 disabled:opacity-50`}
        >
          🌶️🌶️🌶️
          <span className="mt-2 text-base font-medium">Level 3</span>
        </button>
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.EXPERT)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-red-400 to-red-500 px-4 py-2 text-xl font-bold text-white shadow-md hover:from-red-500 hover:to-red-600 active:from-red-600 active:to-red-700 disabled:opacity-50`}
        >
          🔥🔥🔥🔥
          <span className="mt-2 text-base font-medium">Level 4</span>
        </button>
      </div>

      <h2 className="mt-8 mb-2 bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
        Puzzles from Friends
      </h2>
      <p>
        Compete against{' '}
        {friendsList?.length
          ? friendsList.slice(0, 5).join(', ')
          : 'your friends'}{' '}
        and see who is the fastest!
      </p>
      <button
        onClick={() => setTab(Tab.FRIENDS)}
        className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-purple-500 px-6 py-3 text-base font-medium text-white shadow-md hover:from-purple-500 hover:to-purple-600 active:from-purple-600 active:to-purple-700"
      >
        <Users className="mr-2 h-5 w-5" /> Play with Friends
      </button>
    </div>
  );
};
const MyPuzzles = (sessions?: ServerStateResult<ServerState>[]) => {
  const inProgress = sessions?.filter((session) => !session.state.completed);
  const completed = sessions?.filter((session) => session.state.completed);
  return (
    <div className="mb-4">
      <h1 className="mb-2 text-4xl font-extrabold">My Puzzles</h1>
      {!!inProgress?.length && (
        <div className="mb-4">
          <h2 className="mb-2 text-2xl font-extrabold">In Progress</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {inProgress?.map((session) => SessionRow({ mySession: session, display: 'my' }))}
          </ul>
        </div>
      )}
      {!!completed?.length && (
        <div className="mb-4">
          <h2 className="mb-2 text-2xl font-extrabold">Completed</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {completed?.map((session) => SessionRow({ mySession: session, display: 'my' }))}
          </ul>
        </div>
      )}
    </div>
  );
};
const Friends = (
  user: UserProfile | undefined,
  parties: Party[] | undefined,
  expandUser: (partyId: string, userId: string) => void,
  userSessions: UserSessions,
  mySessions: ServerStateResult<ServerState>[] | undefined
) => {
  return (
    <div className="mb-4">
      <h1 className="mb-2 text-4xl font-extrabold">Friends</h1>
      <p className="mb-4">
        Invite others using the sidebar when solving a puzzle, then come back
        here to see their own puzzles.
      </p>
      <p className="mb-4">
        Select a friend below to see and solve their puzzles. Who will be the
        quickest?
      </p>

      {parties?.length ? (
        <>
          <ul className="space-y-4 pb-16">
            {parties?.map(({ partyId, members, partyName }) => (
              <li key={partyId}>
                <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-zinc-800/80">
                  <h3 className="text-theme-primary dark:text-theme-primary-light text-xl font-semibold">
                    {partyName}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {members
                      .filter(({ userId }) => userId !== user?.sub)
                      .map(({ userId, memberNickname }) => (
                        <li
                          key={userId}
                          className="rounded-xl bg-gray-50 dark:bg-zinc-700/40"
                        >
                          <button
                            className="flex w-full cursor-pointer items-center p-3"
                            onClick={() => expandUser(partyId, userId)}
                          >
                            <span className="mr-2 text-xl">🧍</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {memberNickname}
                            </span>
                            {userSessions[userId]?.isLoading ? (
                              <Loader className="mr-0 ml-auto animate-spin" />
                            ) : (
                              <>
                                {userSessions[userId]?.sessions ? (
                                  <></>
                                ) : (
                                  <ChevronDown className="mr-0 ml-auto" />
                                )}
                              </>
                            )}
                          </button>
                          {userSessions[userId]?.sessions && (
                            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                              {userSessions[userId]?.sessions?.map(
                                (userSession) =>
                                  SessionRow({
                                    memberSession: userSession,
                                    mySession: mySessions?.find(
                                      (session) =>
                                        session.sessionId ===
                                        userSession.sessionId
                                    ),
                                    display: 'my',
                                    memberNickname
                                  })
                              )}
                            </ul>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

const SessionRow = ({
  mySession,
  memberSession,
  display,
  memberNickname,
}: {
  mySession?: ServerStateResult<ServerState>;
  memberSession?: ServerStateResult<ServerState>;
  display: 'my' | 'user';
  memberNickname?: string
}) => {
  const session = mySession || memberSession;
  if (!session) {
    return;
  }
  const initial = puzzleToPuzzleText(session.state.initial);
  const final = puzzleToPuzzleText(session.state.final);

  // Session may be from a friend, display userSession when provided
  const displaySession = display === 'my' ? mySession : memberSession;

  const latest =
    displaySession?.state.answerStack[
      displaySession?.state.answerStack.length - 1
    ];
  return (
    <li
      key={session.sessionId}
      className="rounded-sm border-2 border-zinc-600 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-300"
    >
      <Link href={`/puzzle?initial=${initial}&final=${final}`}>
        <SimpleSudoku
          initial={puzzleTextToPuzzle(initial)}
          final={puzzleTextToPuzzle(final)}
          latest={latest}
        />
        <div className="mr-2 inline-block w-full px-4 py-2 text-center text-white">
          <p>{(mySession?.state.answerStack.length || 0) > 1 ? mySession?.state.completed ? 'You Completed!' : 'Continue Game' : 'Start Game'}</p>
          {memberSession && mySession?.state.timer !== undefined && 'Your time'}
          {mySession?.state.timer !== undefined && (
            <TimerDisplay seconds={calculateSeconds(mySession.state.timer)} />
          )}
          {memberNickname ? <p>{(memberSession?.state.answerStack.length || 0) > 1 ? memberSession?.state.completed ? `${memberNickname} Completed!` : `${memberNickname} in progress` : `${memberNickname} not started`}</p> : <></>}
          {memberSession?.state.timer !== undefined && (
            <TimerDisplay seconds={calculateSeconds(memberSession.state.timer)} />
          )}
        </div>
      </Link>
    </li>
  );
};

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
        // Merge with local
        mergeSessions(values);
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
      (userSessions[userId].isLoading || userSessions[userId].sessions)
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
      setUserSessions({
        ...userSessions,
        [userId]: { isLoading: false, sessions: serverValuesForUser },
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
        {tab === Tab.START_PUZZLE &&
          StartPuzzle(
            isOnline,
            isLoading,
            openSudokuOfTheDay,
            friendsList,
            setTab
          )}
        {tab === Tab.MY_PUZZLES && MyPuzzles(sessions)}
        {tab === Tab.FRIENDS &&
          Friends(user, parties, expandUser, userSessions, sessions)}
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
