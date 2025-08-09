'use client';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, CheckCircle, Clock, ArrowUp } from 'react-feather';
import { BookCover } from '@/components/BookCovers';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/providers/UserProvider';
import { useBook } from '@/providers/BookProvider/BookProvider';
import { useSessions } from '@/providers/SessionsProvider/SessionsProvider';
import SimpleSudoku from '@/components/SimpleSudoku';
import {
  puzzleTextToPuzzle,
  puzzleToPuzzleText,
} from '@/helpers/puzzleTextToPuzzle';
import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { TimerDisplay } from '@/components/TimerDisplay/TimerDisplay';
import { SudokuBookPuzzle } from '@/types/serverTypes';

export default function BookPage() {
  const router = useRouter();
  const { user, loginRedirect } = useContext(UserContext) || {};
  const {
    bookData,
    isLoading: bookLoading,
    error: bookError,
    fetchBookData,
  } = useBook();
  const { sessions, isLoading: sessionsLoading, fetchSessions } = useSessions();

  // Scroll to top functionality
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentMonth = new Date(new Date().toISOString()).toLocaleString(
    'en-US',
    {
      month: 'long',
      timeZone: 'UTC',
    }
  );

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        return;
      }

      // Fetch book data and sessions
      await fetchBookData();
      await fetchSessions();
    };

    loadData();
  }, [user, loginRedirect, router, fetchBookData, fetchSessions]);

  const handlePuzzleClick = (
    puzzle: { initial: string; final: string },
    isCompleted: boolean
  ) => {
    if (isCompleted) {
      return; // Don't allow playing completed puzzles
    }
    router.push(`/puzzle?initial=${puzzle.initial}&final=${puzzle.final}`);
  };

  const getPuzzleSession = (puzzle: { initial: string; final: string }) => {
    if (!sessions) return null;
    const initial = puzzleToPuzzleText(puzzleTextToPuzzle(puzzle.initial));
    const final = puzzleToPuzzleText(puzzleTextToPuzzle(puzzle.final));

    return sessions.find(
      (session) =>
        puzzleToPuzzleText(session.state.initial) === initial &&
        puzzleToPuzzleText(session.state.final) === final
    );
  };

  const getPuzzleStats = (puzzle: { initial: string; final: string }) => {
    const session = getPuzzleSession(puzzle);
    if (!session) {
      return { completed: false, percentage: 0, hasStarted: false };
    }

    const latest =
      session.state.answerStack[session.state.answerStack.length - 1];
    const percentage = calculateCompletionPercentage(
      session.state.initial,
      session.state.final,
      latest
    );

    return {
      completed: session.state.completed,
      percentage,
      hasStarted: session.state.answerStack.length > 1,
      session,
    };
  };

  const getAllTechniques = (techniques: SudokuBookPuzzle['techniques']) => {
    const allTechniques: {
      name: string;
      count: number;
      category: string;
      difficulty: number;
      color: string;
    }[] = [];

    // Map technique keys to human-readable names
    const techniqueNames: { [key: string]: string } = {
      // Basic
      lastDigit: 'Last Digit',
      hiddenSingleBox: 'Hidden Single (Box)',
      hiddenSingleLine: 'Hidden Single (Line)',
      hiddenSingleVariantRegion: 'Hidden Single (Variant Region)',
      nakedSingle: 'Naked Single',

      // Simple
      hiddenPair: 'Hidden Pair',
      lockedCandidate: 'Locked Candidate',
      hiddenTriple: 'Hidden Triple',
      hiddenQuadruple: 'Hidden Quadruple',
      nakedPair: 'Naked Pair',
      nakedTriple: 'Naked Triple',
      nakedQuadruple: 'Naked Quadruple',

      // Advanced
      xWing: 'X-Wing',
      swordfish: 'Swordfish',
      skyscraper: 'Skyscraper',
      twoStringKite: 'Two-String-Kite',
      crane: 'Crane',
      simpleColoring: 'Simple Coloring',
      yWing: 'Y-Wing',
      xYZWing: 'XYZ-Wing',
      wWing: 'W-Wing',
      finnedSashimiXWing: 'Finned/Sashimi X-Wing',
      emptyRectangle: 'Empty Rectangle',
      uniqueRectangleType1: 'Unique Rectangle Type 1',
      uniqueRectangleType2: 'Unique Rectangle Type 2',
      uniqueRectangleType3: 'Unique Rectangle Type 3',
      uniqueRectangleType4: 'Unique Rectangle Type 4',
      uniqueRectangleType5: 'Unique Rectangle Type 5',

      // Hard
      finnedSashimiSwordfish: 'Finned/Sashimi Swordfish',
      jellyfish: 'Jellyfish',
      bugBinaryUniversalGrave: 'BUG (Binary Universal Grave)',
      xChain: 'X-Chain',
      groupedXChain: 'Grouped X-Chain',
      YWing4WXYZWing: '4-Y-Wing (WXYZ-Wing)',
      yWing5: '5-Y-Wing',
      yWing6: '6-Y-Wing',
      yWing7: '7-Y-Wing',
      yWing8: '8-Y-Wing',
      yWing9: '9-Y-Wing',
      finnedSashimiJellyfish: 'Finned/Sashimi Jellyfish',

      // Brutal
      medusa3D: '3D Medusa',
      xyChain: 'XY-Chain',
      alternatingInferenceChainAIC: 'Alternating Inference Chain (AIC)',
      groupedAlternatingInferenceChainAIC:
        'Grouped Alternating Inference Chain (AIC)',

      // Beyond Brutal
      nishioForcingChain: 'Nishio Forcing Chain',
      nishioForcingNet: 'Nishio Forcing Net',
    };

    // Define difficulty order for categories
    const categoryDifficulty: {
      [key: string]: { order: number; color: string };
    } = {
      beyondBrutal: { order: 6, color: 'bg-black text-white' },
      brutal: { order: 5, color: 'bg-red-600 text-white' },
      hard: { order: 4, color: 'bg-red-500 text-white' },
      moreAdvanced: { order: 4, color: 'bg-orange-500 text-white' },
      advanced: { order: 3, color: 'bg-yellow-500 text-white' },
      simple: { order: 2, color: 'bg-blue-500 text-white' },
      basic: { order: 1, color: 'bg-green-500 text-white' },
    };

    // Extract techniques from all categories
    Object.entries(techniques || {}).forEach(
      ([category, categoryTechniques]) => {
        if (typeof categoryTechniques === 'object') {
          Object.entries(categoryTechniques as any).forEach(
            ([technique, count]) => {
              if (count && (count as number) > 0) {
                const categoryInfo = categoryDifficulty[category] || {
                  order: 0,
                  color: 'bg-gray-500 text-white',
                };
                const humanName = techniqueNames[technique] || technique;
                allTechniques.push({
                  name: humanName,
                  count: count as number,
                  category,
                  difficulty: categoryInfo.order,
                  color: categoryInfo.color,
                });
              }
            }
          );
        }
      }
    );

    // Sort by difficulty (hardest first), then by count
    return allTechniques.sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        return b.difficulty - a.difficulty; // Hardest first
      }
      return b.count - a.count; // Then by count
    });
  };

  const getDifficultyFromCoach = (coach: string) => {
    const difficultyMap: {
      [key: string]: { name: string; badgeColor: string; tileColor: string };
    } = {
      '1-very-easy': {
        name: '🟢 Very Easy',
        badgeColor: 'bg-green-400 text-white',
        tileColor:
          'bg-emerald-50 border-emerald-100 dark:bg-emerald-950 dark:border-emerald-900',
      },
      '2-easy': {
        name: '🟢 Easy',
        badgeColor: 'bg-green-500 text-white',
        tileColor:
          'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      },
      '3-moderately-easy': {
        name: '🟡 Moderately Easy',
        badgeColor: 'bg-lime-600 text-white',
        tileColor:
          'bg-lime-50 border-lime-200 dark:bg-lime-950 dark:border-lime-800',
      },
      '4-moderate': {
        name: '🟡 Moderate',
        badgeColor: 'bg-yellow-600 text-white',
        tileColor:
          'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      },
      '5-moderately-hard': {
        name: '🟠 Moderately Hard',
        badgeColor: 'bg-orange-500 text-white',
        tileColor:
          'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
      },
      '6-hard': {
        name: '🔴 Hard',
        badgeColor: 'bg-red-500 text-white',
        tileColor:
          'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      },
      '7-vicious': {
        name: '🔥 Vicious',
        badgeColor: 'bg-red-600 text-white',
        tileColor:
          'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700',
      },
      '8-fiendish': {
        name: '🔥 Fiendish',
        badgeColor: 'bg-red-700 text-white',
        tileColor:
          'bg-red-150 border-red-400 dark:bg-red-800 dark:border-red-600',
      },
      '9-devilish': {
        name: '🔥 Devilish',
        badgeColor: 'bg-red-800 text-white',
        tileColor:
          'bg-red-200 border-red-400 dark:bg-red-700 dark:border-red-500',
      },
      '10-hell': {
        name: '🔥🔥 Hell',
        badgeColor: 'bg-red-900 text-white',
        tileColor:
          'bg-red-300 border-red-500 dark:bg-red-600 dark:border-red-400',
      },
      '11-beyond-hell': {
        name: '🔥🔥🔥 Beyond Hell',
        badgeColor: 'bg-black text-white',
        tileColor:
          'bg-red-400 border-red-600 dark:bg-red-500 dark:border-red-300',
      },
    };

    return (
      difficultyMap[coach] || {
        name: coach,
        badgeColor: 'bg-gray-500 text-white',
        tileColor:
          'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800',
      }
    );
  };

  const isLoading = bookLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {bookLoading && sessionsLoading
              ? 'Loading puzzle book...'
              : bookLoading
                ? 'Loading puzzles...'
                : 'Loading your progress...'}
          </p>
        </div>
      </div>
    );
  }

  if (bookError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Error loading puzzle book: {bookError}
          </p>
          <button
            onClick={() => fetchBookData()}
            className="mt-4 mr-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No puzzle book data available.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="pt-safe bg-gradient-to-r from-blue-600 to-purple-600 px-6">
          <div className="container mx-auto max-w-6xl py-6 md:py-8">
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex cursor-pointer items-center text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </button>

            <div className="flex flex-col items-center text-white md:flex-row md:items-center">
              <div className="mb-4 md:mr-6 md:mb-0">
                <BookCover month={currentMonth} size="large" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold md:text-4xl">
                  {currentMonth} Puzzle Book
                </h1>
                <p className="text-white/80 md:text-lg">
                  {bookData.puzzles.length} technique-focused puzzles to
                  challenge your skills
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                  {/* Progress Stats */}
                  <div className="rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                    📊{' '}
                    {sessions
                      ?.filter((s) =>
                        bookData.puzzles.some(
                          (p) =>
                            puzzleToPuzzleText(s.state.initial) ===
                            puzzleToPuzzleText(puzzleTextToPuzzle(p.initial))
                        )
                      )
                      .filter((s) => s.state.completed).length || 0}{' '}
                    completed
                  </div>
                  <div className="rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                    🎯{' '}
                    {sessions
                      ?.filter((s) =>
                        bookData.puzzles.some(
                          (p) =>
                            puzzleToPuzzleText(s.state.initial) ===
                            puzzleToPuzzleText(puzzleTextToPuzzle(p.initial))
                        )
                      )
                      .filter(
                        (s) =>
                          !s.state.completed && s.state.answerStack.length > 1
                      ).length || 0}{' '}
                    in progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-6xl px-6 py-8">
          {/* Difficulty Jump Buttons */}
          <div className="mb-8">
            <h3 className="mb-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
              Jump to Difficulty
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { difficulty: '1-very-easy', label: '🟢 Very Easy' },
                { difficulty: '2-easy', label: '🟢 Easy' },
                {
                  difficulty: '3-moderately-easy',
                  label: '🟡 Moderately Easy',
                },
                { difficulty: '4-moderate', label: '🟡 Moderate' },
                {
                  difficulty: '5-moderately-hard',
                  label: '🟠 Moderately Hard',
                },
                { difficulty: '6-hard', label: '🔴 Hard' },
                { difficulty: '7-vicious', label: '🔥 Vicious' },
                { difficulty: '8-fiendish', label: '🔥 Fiendish' },
                { difficulty: '9-devilish', label: '🔥 Devilish' },
                { difficulty: '10-hell', label: '🔥🔥 Hell' },
                { difficulty: '11-beyond-hell', label: '🔥🔥🔥 Beyond Hell' },
              ].map((item) => {
                const jumpToDifficulty = () => {
                  const firstMatchingPuzzleIndex = bookData?.puzzles.findIndex(
                    (puzzle) => puzzle.difficulty.coach === item.difficulty
                  );

                  if (
                    firstMatchingPuzzleIndex !== -1 &&
                    firstMatchingPuzzleIndex !== undefined
                  ) {
                    const element = document.getElementById(
                      `puzzle-${firstMatchingPuzzleIndex}`
                    );
                    if (element) {
                      element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }
                  }
                };

                // Check if this difficulty exists in the book
                const hasThisDifficulty = bookData?.puzzles.some(
                  (puzzle) => puzzle.difficulty.coach === item.difficulty
                );

                if (!hasThisDifficulty) return null;

                return (
                  <button
                    key={item.difficulty}
                    onClick={jumpToDifficulty}
                    className="cursor-pointer rounded-full bg-white/20 px-3 py-2 text-xs font-medium text-gray-800 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 dark:text-gray-200"
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Puzzles Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {bookData.puzzles.map((puzzle, index) => {
              const stats = getPuzzleStats(puzzle);
              const difficulty = getDifficultyFromCoach(
                puzzle.difficulty.coach
              );
              const allTechniques = getAllTechniques(puzzle.techniques);
              const session = getPuzzleSession(puzzle);

              return (
                <div
                  key={index}
                  id={`puzzle-${index}`}
                  className={`group relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
                    stats.completed
                      ? 'cursor-default opacity-90'
                      : 'cursor-pointer hover:scale-105'
                  }`}
                  onClick={() => handlePuzzleClick(puzzle, !!stats.completed)}
                >
                  {/* Status Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    {stats.completed && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                    {stats.hasStarted && !stats.completed && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                        <Clock className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Mini Sudoku Preview */}
                  <div
                    className={`mb-4 flex justify-center rounded-xl p-2 ${difficulty.tileColor}`}
                  >
                    <div className="w-full max-w-none transform">
                      <div className="m-auto max-w-40">
                        <SimpleSudoku
                          initial={puzzleTextToPuzzle(puzzle.initial)}
                          final={puzzleTextToPuzzle(puzzle.final)}
                          latest={
                            session?.state.answerStack[
                              session.state.answerStack.length - 1
                            ]
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Puzzle Info */}
                  <div className="mb-4">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Puzzle #{index + 1}
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    {stats.hasStarted && (
                      <div className="mb-3">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {stats.percentage}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                          <div
                            className={`h-full transition-all ${
                              stats.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${stats.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Difficulty Badge and Timer */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${difficulty.badgeColor}`}
                      >
                        {difficulty.name}
                      </span>
                      {session?.state.timer && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <TimerDisplay
                            seconds={calculateSeconds(session.state.timer)}
                          />
                        </div>
                      )}
                    </div>

                    {/* All Techniques */}
                    {allTechniques.length > 0 && (
                      <div
                        className={`mb-3 rounded-xl p-3 ${difficulty.tileColor}`}
                      >
                        <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Recommended Techniques:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {allTechniques.map((technique, i) => (
                            <span
                              key={i}
                              className={`rounded-md px-2 py-1 text-xs font-medium ${technique.color}`}
                            >
                              {technique.name} ({technique.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4">
                      {!stats.completed && (
                        <div
                          className={`w-full rounded-xl px-2 py-2 font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95 ${
                            stats.hasStarted
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {stats.hasStarted ? (
                              <>
                                <Clock className="h-4 w-4" />
                                <span>Continue Playing</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                <span>Start Puzzle</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {stats.completed && (
                        <div className="w-full rounded-xl bg-green-100 px-4 py-3 text-center dark:bg-green-900/30">
                          <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-semibold">Completed!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pb-24"></div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="bg-theme-primary hover:bg-theme-primary-dark dark:bg-theme-primary-light dark:hover:bg-theme-primary fixed right-6 bottom-20 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
      <Footer>
        <Link
          href="/"
          className="group hover:text-theme-primary dark:hover:text-theme-primary-light inline-flex cursor-pointer flex-col items-center justify-center px-5 text-gray-500 transition-colors duration-200 active:opacity-70 dark:text-gray-400"
        >
          <ArrowLeft className="mb-1 h-6 w-6" />
          <span className="text-center text-xs font-medium">Back</span>
        </Link>
      </Footer>
    </>
  );
}
