'use client';
import Sudoku from '@/components/Sudoku';
import { buildPuzzleUrl } from '@/helpers/buildPuzzleUrl';
import { puzzleTextToPuzzle } from '@/helpers/puzzleTextToPuzzle';
import { sha256 } from '@/helpers/sha256';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Puzzle } from '@/types/puzzle';
import { GameStateMetadata } from '@/types/state';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function PuzzlePageComponent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get('initial');
  const final = searchParams.get('final');

  const alreadyCompleted = searchParams.get('alreadyCompleted') === 'true';
  const showRacingPrompt = searchParams.get('showRacingPrompt') !== 'false';

  const { requestWakeLock } = useWakeLock();
  const [puzzle, setPuzzle] = useState<{
    initial: Puzzle<number>;
    final: Puzzle<number>;
    puzzleId: string;
    redirectUri: string;
    metadata: Partial<GameStateMetadata>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (initial && final) {
        const metadata: Partial<GameStateMetadata> = {
          difficulty: searchParams.get('difficulty') || undefined,
          sudokuId: searchParams.get('sudokuId') || undefined,
          sudokuBookPuzzleId:
            searchParams.get('sudokuBookPuzzleId') || undefined,
          scannedAt: searchParams.get('scannedAt') || undefined,
        };
        const redirectUri = buildPuzzleUrl(initial, final, metadata);
        setPuzzle({
          redirectUri,
          metadata,
          puzzleId: await sha256(initial),
          initial: puzzleTextToPuzzle(initial),
          final: puzzleTextToPuzzle(final),
        });
      }
    })();
  }, [initial, final, searchParams]);

  // Request wake lock when puzzle loads
  useEffect(() => {
    if (puzzle) {
      requestWakeLock();
    }
    // Cleanup happens automatically in the useWakeLock hook
  }, [puzzle, requestWakeLock]);

  return (
    <div className="-mb-24">
      {puzzle && (
        <Sudoku
          puzzle={puzzle}
          alreadyCompleted={alreadyCompleted}
          showRacingPrompt={showRacingPrompt}
        />
      )}
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
