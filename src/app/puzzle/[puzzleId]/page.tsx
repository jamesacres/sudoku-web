'use server';
import Sudoku from '@/components/Sudoku';
import puzzles from '@/data/puzzles/puzzles';
import { Puzzle } from '@/types/puzzle';
import { notFound } from 'next/navigation';

const getPuzzle = (puzzleId: number): { initial: Puzzle; final: Puzzle } => {
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
