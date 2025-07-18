'use client';
import Sudoku from '@/components/Sudoku';
import { puzzleTextToPuzzle } from '@/helpers/puzzleTextToPuzzle';
import { sha256 } from '@/helpers/sha256';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Puzzle } from '@/types/puzzle';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function PuzzlePageComponent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get('initial');
  const final = searchParams.get('final');
  const redirectUri = `/puzzle?initial=${initial}&final=${final}`;
  const { requestWakeLock } = useWakeLock();
  const [puzzle, setPuzzle] = useState<{
    initial: Puzzle<number>;
    final: Puzzle<number>;
    puzzleId: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (initial && final) {
        setPuzzle({
          puzzleId: await sha256(initial),
          initial: puzzleTextToPuzzle(initial),
          final: puzzleTextToPuzzle(final),
        });
      }
    })();
  }, [initial, final]);

  // Request wake lock when puzzle loads
  useEffect(() => {
    if (puzzle) {
      requestWakeLock();
    }
    // Cleanup happens automatically in the useWakeLock hook
  }, [puzzle, requestWakeLock]);

  return (
    <div className="-mb-24">
      {puzzle && <Sudoku puzzle={puzzle} redirectUri={redirectUri} />}
    </div>
  );
}

export default function PuzzlePage() {
  return (
    <Suspense>
      <PuzzlePageComponent />
    </Suspense>
  );
}
