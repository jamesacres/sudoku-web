'use client';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play } from 'react-feather';
import { BookCover } from '@/components/BookCovers';

export default function BookPage() {
  const router = useRouter();
  const currentMonth = new Date(new Date().toISOString()).toLocaleString(
    'en-US',
    {
      month: 'long',
      timeZone: 'UTC',
    }
  );

  // Sample August puzzles with different techniques
  const puzzles = [
    {
      id: 1,
      title: 'Naked Singles',
      description: 'Focus on finding cells with only one possible value',
      difficulty: 'Easy',
      technique: 'Basic Logic',
      initial:
        '5.....71...6.9..4..8...2...1...3...9.4.....3.7...5...6...3...2..9..7.8...15.....2',
      final:
        '534628719126975348789431256218367495964182537375954681643713825291546873857289164',
    },
    {
      id: 2,
      title: 'Hidden Singles',
      description:
        'Find numbers that can only go in one cell within a row, column, or box',
      difficulty: 'Easy',
      technique: 'Basic Logic',
      initial:
        '9..5..1...6.....3....32.8.....8..3.......1.......6..9.....5.39....8.....2..1..7',
      final:
        '978563142564179283123428756215847639349681527687235418451296375836754921792315864',
    },
    {
      id: 3,
      title: 'Naked Pairs',
      description:
        'Two cells with the same two candidates eliminate those numbers from peers',
      difficulty: 'Medium',
      technique: 'Intermediate Logic',
      initial:
        '2...6....5.9....3..8..91.....3...5...5.....8...4...1.....28..4..3....9.7....5...1',
      final:
        '213768954569124738478539126834617295195243867627895413951372684346851279782496351',
    },
    {
      id: 4,
      title: 'Pointing Pairs',
      description:
        'When candidates in a box point to one row/column, eliminate from other cells',
      difficulty: 'Medium',
      technique: 'Intermediate Logic',
      initial:
        '..5...1...8..6....4....9.....1..4.6.....7.....9.3..2.....5....1....8..3...2...95',
      final:
        '725348169381267954467519832951624376234876541869135247598743621142695738673821495',
    },
    {
      id: 5,
      title: 'Box-Line Reduction',
      description:
        'Eliminate candidates from boxes when they must be in a specific line',
      difficulty: 'Medium',
      technique: 'Intermediate Logic',
      initial:
        '..9..5.1...1..9....8....2.6.....78..........4.78.....2.5....3....6..1...7.3..9..',
      final:
        '629387514351429768478561923264915387913672845587243169192854637845736291736198452',
    },
    {
      id: 6,
      title: 'X-Wing Pattern',
      description:
        'Advanced pattern that eliminates candidates across rows and columns',
      difficulty: 'Hard',
      technique: 'Advanced Pattern',
      initial:
        '1.......2.9.4...5...6......8.3..1....7...4....2..9.8......1...7...6.3.4.......9',
      final:
        '143758962296143857578629431869321475357894621412576398625987143731462589984235716',
    },
    {
      id: 7,
      title: 'Y-Wing Strategy',
      description:
        'Three cells forming a chain pattern for advanced elimination',
      difficulty: 'Hard',
      technique: 'Advanced Pattern',
      initial:
        '....9.1..6..2.......1..4.......5..1.43.....29.8.......7..2.......6..3..5.3....',
      final:
        '827596134635241879914378526269453781143687295578129643751832469392764518486915327',
    },
    {
      id: 8,
      title: 'Swordfish Pattern',
      description: 'Complex three-line pattern for eliminating candidates',
      difficulty: 'Expert',
      technique: 'Expert Pattern',
      initial:
        '..3......4....8..........21........37.......42........1..........3....5......8..',
      final:
        '513726948476985321829341752264153879158679234937824156381597462692438517745261389',
    },
  ];

  const handlePuzzleClick = (puzzle: (typeof puzzles)[0]) => {
    router.push(`/puzzle?initial=${puzzle.initial}&final=${puzzle.final}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hard':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTechniqueColor = (technique: string) => {
    switch (technique) {
      case 'Basic Logic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Intermediate Logic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Advanced Pattern':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'Expert Pattern':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="pt-safe bg-gradient-to-r from-blue-600 to-purple-600 px-6">
          <div className="container mx-auto max-w-4xl py-6 md:py-8">
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
                  Technique-focused puzzles to challenge your skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              Featured Techniques
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Each puzzle is crafted to teach and reinforce specific solving
              techniques
            </p>
          </div>

          {/* Puzzles Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {puzzles.map((puzzle) => (
              <div
                key={puzzle.id}
                className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                onClick={() => handlePuzzleClick(puzzle)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {puzzle.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {puzzle.description}
                    </p>
                  </div>
                  <Play className="ml-4 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getDifficultyColor(puzzle.difficulty)}`}
                  >
                    {puzzle.difficulty}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getTechniqueColor(puzzle.technique)}`}
                  >
                    {puzzle.technique}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Puzzle #{puzzle.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-24"></div>
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
