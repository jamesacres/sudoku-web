'use server';
import Sudoku from '@/components/Sudoku';
import puzzles, { Puzzle } from '@/data/puzzles/puzzles';
import { notFound } from 'next/navigation';

const getPuzzle = (puzzleId: number): Puzzle => {
  return puzzles[puzzleId];
};

export default async function PuzzlePage({
  params: { puzzleId },
}: {
  params: { puzzleId: string };
}) {
  const puzzle = getPuzzle(Number(puzzleId));
  if (!puzzle) {
    return notFound();
  }
  return (
    <div>
      <Sudoku puzzle={puzzle} />
    </div>
  );
}
