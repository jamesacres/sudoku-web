'use client';
import Sudoku from '@/components/Sudoku';
import puzzles from '@/data/puzzles/puzzles';
import { puzzleTextToPuzzle } from '@/helpers/puzzleTextToPuzzle';
import { sha256 } from '@/helpers/sha256';
import { Puzzle } from '@/types/puzzle';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const DEFAULT_PUZZLE_ID = '1';

const getPuzzle = (puzzleId: number): { initial: Puzzle; final: Puzzle } => {
  return puzzles[puzzleId];
};

function PuzzlePageComponent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get('initial');
  const final = searchParams.get('final');
  const puzzleId = searchParams.get('puzzleId');
  const [puzzle, setPuzzle] = useState<{
    initial: Puzzle;
    final: Puzzle;
    puzzleId: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (initial && final) {
        setPuzzle({
          puzzleId: puzzleId || (await sha256(initial)),
          initial: puzzleTextToPuzzle(initial),
          final: puzzleTextToPuzzle(final),
        });
      } else {
        let puzzleData = getPuzzle(Number(puzzleId || DEFAULT_PUZZLE_ID));
        if (!puzzleData) {
          puzzleData = getPuzzle(Number(DEFAULT_PUZZLE_ID));
        }
        setPuzzle({
          puzzleId: puzzleId || DEFAULT_PUZZLE_ID,
          ...puzzleData,
        });
      }
    })();
  }, [initial, final, puzzleId]);

  return <div>{puzzle && <Sudoku puzzle={puzzle} />}</div>;
}

export default function PuzzlePage() {
  return (
    <Suspense>
      <PuzzlePageComponent />
    </Suspense>
  );
}
