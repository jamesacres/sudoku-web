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
import { Difficulty, ServerStateResult } from '@/types/serverTypes';
import { GameState, ServerState } from '@/types/state';
import { StateType } from '@/types/StateType';
import { Timer } from '@/types/timer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Camera, Heart, Plus, UserPlus, Users } from 'react-feather';

enum Tab {
  START_PUZZLE = 'START_PUZZLE',
  MY_PUZZLES = 'MY_PUZZLES',
  FRIENDS = 'FRIENDS',
}

const StartPuzzle = (
  isOnline: boolean,
  isLoading: boolean,
  openSudokuOfTheDay: (difficulty: Difficulty) => Promise<void>
) => {
  return (
    <div className="mb-4">
      <h1 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-4xl font-bold text-transparent">
        Start Puzzle
      </h1>
      <p className="mt-4">
        Feeling competitive? Share puzzles with friends and family and race to
        the finish!
      </p>

      <h2 className="mt-8 mb-2 bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-2xl font-bold text-transparent">
        🌱 Sudoku of the Day
      </h2>
      <p>
        Challenge yourself daily with our Sudoku of the Day. We publish four new
        challenges at midnight UTC. Start on level 1, work your way up and
        challenge your friends!
      </p>
      <div className="mt-4 grid max-w-sm grid-cols-2 gap-3">
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.SIMPLE)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-green-400 to-green-500 px-4 py-6 text-xl font-bold text-white shadow-md hover:from-green-500 hover:to-green-600 active:from-green-600 active:to-green-700 disabled:opacity-50`}
        >
          ✏️
          <span className="mt-2 text-base font-medium">Level 1</span>
        </button>
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.EASY)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-500 px-4 py-6 text-xl font-bold text-white shadow-md hover:from-yellow-500 hover:to-yellow-600 active:from-yellow-600 active:to-yellow-700 disabled:opacity-50`}
        >
          😎😎
          <span className="mt-2 text-base font-medium">Level 2</span>
        </button>
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.INTERMEDIATE)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-orange-400 to-orange-500 px-4 py-6 text-xl font-bold text-white shadow-md hover:from-orange-500 hover:to-orange-600 active:from-orange-600 active:to-orange-700 disabled:opacity-50`}
        >
          🌶️🌶️🌶️
          <span className="mt-2 text-base font-medium">Level 3</span>
        </button>
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.EXPERT)}
          disabled={!isOnline || isLoading}
          className={`${isLoading ? 'cursor-wait' : !isOnline ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-red-400 to-red-500 px-4 py-6 text-xl font-bold text-white shadow-md hover:from-red-500 hover:to-red-600 active:from-red-600 active:to-red-700 disabled:opacity-50`}
        >
          🔥🔥🔥🔥
          <span className="mt-2 text-base font-medium">Level 4</span>
        </button>
      </div>

      <h2 className="mt-8 mb-2 bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
        📸 Import
      </h2>
      <p className="mt-2">
        Scan an unsolved puzzle in seconds from a newspaper, puzzle book or
        sudoku website. Solve it in this app, check your work, and challenge
        your friends!
      </p>
      <Link
        href="/import"
        className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-3 text-base font-medium text-white shadow-md hover:from-blue-500 hover:to-blue-600 active:from-blue-600 active:to-blue-700"
      >
        <Camera className="mr-2 h-5 w-5" /> Import with camera
      </Link>

      <h2 className="mt-8 mb-2 bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
        Puzzles from Friends
      </h2>
      <p>Coming soon!</p>
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
            {inProgress?.map((session) => SessionRow(session))}
          </ul>
        </div>
      )}
      {!!completed?.length && (
        <div className="mb-4">
          <h2 className="mb-2 text-2xl font-extrabold">Completed</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {completed?.map((session) => SessionRow(session))}
          </ul>
        </div>
      )}
    </div>
  );
};
const Friends = () => {
  return (
    <div className="mb-4">
      <h1 className="mb-2 text-4xl font-extrabold">Friends</h1>
      <p className="mb-4">
        Challenge your friends and family to solve Sudoku puzzles with you!
      </p>
      <p className="mb-4">
        Simply invite them to a party you have created and they can start one of
        your puzzles. If you didn&apos;t create the party, ask the owner to
        invite them.
      </p>
      <p className="mb-4">
        We recommend creating more than one party, e.g. one for your family and
        one for your friends. All party members can see each other&apos;s
        puzzles and compete.
      </p>

      <h2 className="mb-2 text-2xl font-extrabold">My Parties</h2>
      <Link
        href="/"
        className="mt-2 mr-2 inline-block rounded-sm bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
      >
        <Users className="float-left mr-2" /> Create a Party
      </Link>
      <h2 className="mb-2">Test Party</h2>
      <Link
        href="/"
        className="mt-2 mr-2 inline-block rounded-sm bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
      >
        <UserPlus className="float-left mr-2" /> Invite to Party (only if
        created by user)
      </Link>
    </div>
  );
};

const SessionRow = (session: ServerStateResult<ServerState>) => {
  const initial = puzzleToPuzzleText(session.state.initial);
  const final = puzzleToPuzzleText(session.state.final);
  const latest =
    session.state.answerStack[session.state.answerStack.length - 1];
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
          Continue Game
          {session.state.timer !== undefined && (
            <TimerDisplay seconds={calculateSeconds(session.state.timer)} />
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
  const { getSudokuOfTheDay, listValues: listServerValues } =
    useServerStorage();
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
    };
    serverState();

    return () => {
      active = false;
    };
  }, [listServerValues, listLocalPuzzles, listLocalTimers, mergeSessions]);

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
    thisTab === tab ? 'bg-zinc-100 dark:bg-zinc-800' : '';
  return (
    <>
      <div className="container mx-auto px-6">
        {tab === Tab.START_PUZZLE &&
          StartPuzzle(isOnline, isLoading, openSudokuOfTheDay)}
        {tab === Tab.MY_PUZZLES && MyPuzzles(sessions)}
        {tab === Tab.FRIENDS && Friends()}
      </div>
      <Footer>
        <button
          onClick={() => setTab(Tab.START_PUZZLE)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 ${tabBackground(Tab.START_PUZZLE)}`}
        >
          <Plus className="mb-2 h-5 w-5" />
          <span className="text-center text-sm">Start Puzzle</span>
        </button>
        <button
          onClick={() => setTab(Tab.MY_PUZZLES)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 ${tabBackground(Tab.MY_PUZZLES)}`}
        >
          <Heart className="mb-2 h-5 w-5" />
          <span className="text-center text-sm">My Puzzles</span>
        </button>
        <button
          onClick={() => setTab(Tab.FRIENDS)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 ${tabBackground(Tab.FRIENDS)}`}
        >
          <Users className="mb-2 h-5 w-5" />
          <span className="text-center text-sm">Friends</span>
        </button>
      </Footer>
    </>
  );
}
