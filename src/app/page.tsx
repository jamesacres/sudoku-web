'use client';
import SimpleSudoku from '@/components/SimpleSudoku';
import { TimerDisplay } from '@/components/TimerDisplay/TimerDisplay';
import puzzles from '@/data/puzzles/puzzles';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import {
  puzzleTextToPuzzle,
  puzzleToPuzzleText,
} from '@/helpers/puzzleTextToPuzzle';
import { useLocalStorage } from '@/hooks/localStorage';
import { ServerStateResult, useServerStorage } from '@/hooks/serverStorage';
import { Puzzle } from '@/types/puzzle';
import { GameState, ServerState } from '@/types/state';
import { StateType } from '@/types/StateType';
import { Timer } from '@/types/timer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Camera } from 'react-feather';

const getPuzzle = (
  puzzleId: number
): {
  initial: Puzzle<number>;
  final: Puzzle<number>;
} => {
  return puzzles[puzzleId];
};

const SessionRow = (session: ServerStateResult<ServerState>) => {
  const initial = puzzleToPuzzleText(session.state.initial);
  const final = puzzleToPuzzleText(session.state.final);
  const latest =
    session.state.answerStack[session.state.answerStack.length - 1];
  return (
    <li key={session.sessionId} className="rounded	border-2 border-slate-600">
      <Link href={`/puzzle?initial=${initial}&final=${final}`}>
        <SimpleSudoku
          initial={puzzleTextToPuzzle(initial)}
          final={puzzleTextToPuzzle(final)}
          latest={latest}
        />
        <button className="mr-2 inline-block w-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300">
          Continue Game
          {session.state.timer !== undefined && (
            <TimerDisplay seconds={calculateSeconds(session.state.timer)} />
          )}
        </button>
      </Link>
    </li>
  );
};

export default function Home() {
  const { listValues: listServerValues } = useServerStorage();
  const { listValues: listLocalPuzzles } = useLocalStorage({
    type: StateType.PUZZLE,
  });
  const { listValues: listLocalTimers } = useLocalStorage({
    type: StateType.TIMER,
  });
  const [sessions, setSessions] = useState<ServerStateResult<ServerState>[]>();

  const mergeSessions = (newSessions: ServerStateResult<ServerState>[]) => {
    setSessions((previousSessions) => {
      const mergedSessions = [...newSessions, ...(previousSessions || [])].sort(
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
  };

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
        mergeSessions(values);
      }
    };
    serverState();

    return () => {
      active = false;
    };
  }, [listServerValues, listLocalPuzzles, listLocalTimers]);

  const inProgress = sessions?.filter((session) => !session.state.completed);
  const completed = sessions?.filter((session) => session.state.completed);

  return (
    <div className="container mx-auto px-6">
      <div className="mb-4">
        <h1 className="mb-2 text-4xl font-extrabold">Get Started</h1>
        <p>Simply scan a sudoku from a puzzle book and solve on your device!</p>
        <Link
          href="/import"
          className="mr-2 mt-2 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          <Camera className="float-left mr-2" /> Import with camera
        </Link>
        <p>Or, solve our Sudoku of the Day!</p>
        <p>TODO</p>
        <p>Or, solve one of our favourites!</p>
        <Link href="/puzzle?puzzleId=1">Load Puzzle 1</Link>
      </div>
      {!!inProgress?.length && (
        <div className="mb-4">
          <h1 className="mb-2 text-4xl font-extrabold">In Progress</h1>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {inProgress?.map((session) => SessionRow(session))}
          </ul>
        </div>
      )}
      {!!completed?.length && (
        <div className="mb-4">
          <h1 className="mb-2 text-4xl font-extrabold">Completed</h1>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {completed?.map((session) => SessionRow(session))}
          </ul>
        </div>
      )}
    </div>
  );
}
