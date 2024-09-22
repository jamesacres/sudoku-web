'use client';
import SimpleSudoku from '@/components/SimpleSudoku';
import puzzles from '@/data/puzzles/puzzles';
import {
  puzzleTextToPuzzle,
  puzzleToPuzzleText,
} from '@/helpers/puzzleTextToPuzzle';
import { ServerStateResult, useServerStorage } from '@/hooks/serverStorage';
import { Puzzle } from '@/types/puzzle';
import { ServerState } from '@/types/state';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const getPuzzle = (
  puzzleId: number
): { initial: Puzzle<number>; final: Puzzle<number> } => {
  return puzzles[puzzleId];
};

const SessionRow = (session: ServerStateResult<ServerState>) => {
  const initial = puzzleToPuzzleText(session.state.initial);
  const final = puzzleToPuzzleText(session.state.final);
  return (
    <li key={session.sessionId}>
      <Link href={`/puzzle?initial=${initial}&final=${final}`}>
        <SimpleSudoku puzzle={puzzleTextToPuzzle(initial)} />
      </Link>
    </li>
  );
};

export default function Home() {
  const { listValues } = useServerStorage();
  const [sessions, setSessions] = useState<ServerStateResult<ServerState>[]>();

  useEffect(() => {
    let active = true;

    const serverState = async () => {
      const values = await listValues<ServerState>();
      if (active) {
        setSessions(values);
      }
    };
    serverState();

    return () => {
      active = false;
    };
  }, [listValues]);
  return (
    <div className="container mx-auto p-6">
      <Link href="/import">Import</Link>
      <Link href="/puzzle?puzzleId=1">Load Puzzle 1</Link>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
        {sessions?.map((session) => SessionRow(session))}
      </ul>
    </div>
  );
}
