'use client';
import Sudoku from '@/components/Sudoku';
import puzzles from '@/data/puzzles/puzzles';
import { puzzleTextToPuzzle } from '@/helpers/puzzleTextToPuzzle';
import { sha256 } from '@/helpers/sha256';
import { useFetch } from '@/hooks/fetch';
import { UserContext } from '@/providers/UserProvider';
import { Puzzle } from '@/types/puzzle';
import { useSearchParams } from 'next/navigation';
import { Suspense, useContext, useEffect, useRef, useState } from 'react';

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

  const initialized = useRef(false);
  const { user } = useContext(UserContext) || {};
  const { fetch } = useFetch();
  useEffect(() => {
    (async () => {
      if (!initialized.current) {
        initialized.current = true;
        if (user) {
          const fetchSession = async () => {
            console.info('fetching session');
            // TODO move somewhere sensible
            // TODO add handler for all requests that if we ever get a 401 we should logout the user
            const response = await fetch(
              new Request('https://api.bubblyclouds.com/sessions/sudoku-1')
            );
            if (response.ok) {
              const session = await response.json();
              console.info(session);
            }
          };
          await fetchSession();

          // TODO fetch on load
          // TODO update parties from response
          // TODO overwrite local storage if last updated newer than local
          // TODO update server if local storage newer than server
          // TODO on every puzzle change update server with debounce, update parties from response
          // TODO only fetch when needed
          // fetchSession();
        }
      }
    })();
  }, [user, fetch]);

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
