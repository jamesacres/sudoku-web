'use client';
import { Difficulty } from '@/types/serverTypes';
import { Tab } from '@/types/tabs';
import Link from 'next/link';
import { Camera, Users } from 'react-feather';
import { useSudokuPlusModal } from '@/providers/SudokuPlusModalProvider';

interface StartPuzzleTabProps {
  isOnline: boolean;
  isLoading: boolean;
  openSudokuOfTheDay: (difficulty: Difficulty) => Promise<void>;
  friendsList: string[] | undefined;
  setTab: (tab: Tab) => void;
}

export const StartPuzzleTab = ({
  isLoading,
  openSudokuOfTheDay,
  friendsList,
  setTab,
}: StartPuzzleTabProps) => {
  const { showModal } = useSudokuPlusModal();
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
        Challenge yourself daily with our Sudoku of the Day. Start on tricky,
        work your way up and challenge your friends!
      </p>
      <div className="mt-4 grid max-w-sm grid-cols-3 gap-3">
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.SIMPLE)}
          disabled={isLoading}
          className={`${isLoading ? 'cursor-wait' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-green-400 to-green-500 px-4 py-2 text-xl font-bold text-white shadow-md hover:from-green-500 hover:to-green-600 active:from-green-600 active:to-green-700 disabled:opacity-50`}
        >
          ✏️
          <span className="mt-2 text-base text-sm font-medium">Tricky</span>
        </button>
        <button
          onClick={() => openSudokuOfTheDay(Difficulty.EASY)}
          disabled={isLoading}
          className={`${isLoading ? 'cursor-wait' : 'cursor-pointer'} flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-yellow-400 to-yellow-500 px-4 py-2 text-xl font-bold text-white shadow-md hover:from-yellow-500 hover:to-yellow-600 active:from-yellow-600 active:to-yellow-700 disabled:opacity-50`}
        >
          😎😎
          <span className="mt-2 text-base text-sm font-medium">
            Challenging
          </span>
        </button>
        <button
          onClick={showModal}
          disabled={isLoading}
          className={`${isLoading ? 'cursor-wait' : 'cursor-pointer'} relative flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-4 py-2 text-xl font-bold text-white shadow-md hover:from-orange-500 hover:to-orange-600 active:from-orange-600 active:to-orange-700 disabled:opacity-50`}
        >
          🌶️🌶️🌶️
          <span className="mt-2 text-base text-sm font-medium">Hard</span>
          <span className="absolute -top-1 -right-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-xs font-bold text-black">
            +
          </span>
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

export default StartPuzzleTab;
