'use client';
import Footer from '@/components/Footer';
import MyPuzzlesTab from '@/components/tabs/MyPuzzlesTab';
import FriendsTab from '@/components/tabs/FriendsTab';
import ActivityWidget from '@/components/ActivityWidget';
import { useOnline } from '@/hooks/online';
import { useServerStorage } from '@/hooks/serverStorage';
import { UserContext } from '@/providers/UserProvider';
import { RevenueCatContext } from '@/providers/RevenueCatProvider';
import { useSessions } from '@/providers/SessionsProvider/SessionsProvider';
import { useParties } from '@/hooks/useParties';
import { Difficulty } from '@/types/serverTypes';
import { Tab } from '@/types/tabs';
import { SubscriptionContext } from '@/types/subscriptionContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  Star,
  Zap,
  Award,
  RotateCcw,
  Droplet,
  UserPlus,
  CheckCircle,
  Lock,
  Camera,
} from 'react-feather';
import Link from 'next/link';
import Image from 'next/image';
import { BookCover } from '@/components/BookCovers';
import { buildPuzzleUrl } from '@/helpers/buildPuzzleUrl';

export default function Home() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || Tab.START_PUZZLE);
  const router = useRouter();
  const { user, loginRedirect } = useContext(UserContext) || {};
  const { isSubscribed, subscribeModal } = useContext(RevenueCatContext) || {};
  useOnline();
  const [isLoading, setIsLoading] = useState(false);
  const { getSudokuOfTheDay } = useServerStorage();
  const { parties } = useParties({});
  const { sessions, refetchSessions, lazyLoadFriendSessions } = useSessions();

  useEffect(() => {
    // Always refetch sessions when returning to homepage to get latest progress
    refetchSessions();
  }, [refetchSessions]);

  // Lazy load friend sessions when parties are available
  useEffect(() => {
    if (parties && parties.length > 0) {
      lazyLoadFriendSessions(parties);
    }
  }, [parties, lazyLoadFriendSessions]);

  const friendsList = Array.from(
    new Set(
      parties
        ?.map(({ members }) =>
          members
            .filter(({ userId }) => userId !== user?.sub)
            .map(({ memberNickname }) => memberNickname)
        )
        .flat()
    )
  );

  const openSudokuOfTheDay = async (difficulty: Difficulty): Promise<void> => {
    setIsLoading(true);
    if (!user) {
      setIsLoading(false);
      const confirmed = confirm(
        'You need to sign in to continue. Would you like to sign in now?'
      );
      if (confirmed && loginRedirect) {
        loginRedirect({ userInitiated: true });
      }
      return;
    }
    const result = await getSudokuOfTheDay(difficulty);
    if (result) {
      router.push(
        buildPuzzleUrl(result.initial, result.final, {
          difficulty,
          sudokuId: result.sudokuId,
        })
      );
      return;
    }
    setIsLoading(false);
  };

  const openBook = (): void => {
    if (!user) {
      const confirmed = confirm(
        'You need to sign in to access the puzzle book. Would you like to sign in now?'
      );
      if (confirmed && loginRedirect) {
        loginRedirect({ userInitiated: true });
      }
      return;
    }

    // Just navigate to book page, let it handle loading
    router.push('/book');
  };

  const premiumFeatures = [
    {
      icon: Calendar,
      title: 'Unlimited play and race',
      description: 'Race friends in real-time more than once a day',
      isPremium: !isSubscribed,
    },
    {
      icon: UserPlus,
      title: 'Create unlimited racing parties',
      description: 'Host private competitions with friends and family',
      isPremium: !isSubscribed,
    },
    {
      icon: RotateCcw,
      title: 'Unlimited undo, check and reveal',
      description: 'Remove daily undo, check and reveal limits',
      isPremium: !isSubscribed,
    },
    {
      icon: Droplet,
      title: 'All themes unlocked',
      description: 'Personalise your racing experience',
      isPremium: !isSubscribed,
    },
    {
      icon: Users,
      title: 'Unlimited party management',
      description:
        'Create and join as many parties as you like. Remove members from your party.',
      isPremium: !isSubscribed,
    },
  ];

  const handlePremiumFeatureClick = (context?: SubscriptionContext) => {
    if (!isSubscribed) {
      subscribeModal?.showModalIfRequired(
        () => {},
        () => {},
        context
      );
    }
  };

  const tabBackground = (thisTab: Tab) =>
    thisTab === tab
      ? 'bg-transparent text-theme-primary dark:text-theme-primary-light font-semibold'
      : 'text-gray-500 dark:text-gray-400';

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate daily streak from sessions
  const calculateDailyStreak = useCallback(() => {
    if (!sessions || sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDates = sessions
      .map((session) => {
        const date = new Date(session.updatedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter((date, index, array) => array.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => b - a); // Sort newest first

    let streak = 0;
    let currentDate = today.getTime();

    for (const sessionDate of sessionDates) {
      if (sessionDate === currentDate) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000; // Go back one day
      } else if (sessionDate === currentDate + 24 * 60 * 60 * 1000) {
        // Session from yesterday, continue streak
        streak++;
        currentDate = sessionDate - 24 * 60 * 60 * 1000;
      } else {
        break; // Gap in streak
      }
    }

    return streak;
  }, [sessions]);

  const dailyStreak = calculateDailyStreak();

  return (
    <>
      {tab === Tab.START_PUZZLE ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Racing Hero Section */}
          <div className="pt-safe relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 px-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 container mx-auto max-w-4xl py-4 text-center text-white md:py-6">
              <div className="mb-3 flex justify-center md:mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm md:h-20 md:w-20">
                  <Image
                    src="/icons/icon-512.webp"
                    alt="Sudoku Race Logo"
                    width={64}
                    height={64}
                    className="h-10 w-10 md:h-12 md:w-12"
                  />
                </div>
              </div>
              <h1 className="mb-3 text-3xl font-bold md:mb-4 md:text-4xl">
                Ready to Race? 🏎️
              </h1>
              <p className="mb-6 text-lg opacity-90 md:mb-8 md:text-xl">
                Share the challenge! Invite friends to race and see who&apos;s
                the fastest Sudoku solver 🏁
              </p>

              {/* Daily Streak Section */}
              <div className="mb-6 md:mb-8">
                <div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-purple-600/20 p-4 backdrop-blur-sm md:p-6">
                  <div className="text-center">
                    <div className="mb-2 flex justify-center md:mb-3">
                      <div className="text-3xl md:text-4xl">🔥</div>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-white md:text-3xl">
                        {dailyStreak}
                      </span>
                      <span className="ml-2 text-base text-white/80 md:text-lg">
                        day streak
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-white/70 md:mb-4 md:text-sm">
                      {dailyStreak === 0
                        ? 'Start your racing streak today!'
                        : dailyStreak === 1
                          ? 'Great start! Keep it going tomorrow!'
                          : 'Keep racing daily to maintain your streak!'}
                    </p>

                    {/* Streak Progress - Show last 7 days */}
                    <div className="flex justify-center space-x-1 md:space-x-2">
                      {Array.from({ length: 7 }, (_, index) => {
                        const dayOffset = 6 - index; // 6, 5, 4, 3, 2, 1, 0 (today)
                        const hasActivity = dayOffset < dailyStreak;
                        return (
                          <div
                            key={index}
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold md:h-8 md:w-8 md:text-sm ${
                              hasActivity
                                ? 'bg-orange-400 text-white'
                                : 'bg-white/20 text-white/40'
                            }`}
                          >
                            {hasActivity ? '🔥' : '○'}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 text-xs text-white/60 md:mt-4">
                      {dailyStreak >= 100 && '⭐ Century champion! '}
                      {dailyStreak >= 30 &&
                        dailyStreak < 100 &&
                        '🏆 Monthly master! '}
                      {dailyStreak >= 7 &&
                        dailyStreak < 30 &&
                        '🎉 Week warrior! '}
                      {dailyStreak > 0 && (
                        <>
                          Next milestone:{' '}
                          {dailyStreak < 7
                            ? '7 days'
                            : dailyStreak < 30
                              ? '30 days'
                              : '100 days'}
                        </>
                      )}
                    </div>
                    <div className="mt-4">
                      <div
                        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30"
                        onClick={() => handleTabChange(Tab.FRIENDS)}
                      >
                        View leaderboard
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Racing Action Buttons */}
              <div className="mx-auto max-w-4xl">
                {/* Daily Challenges - Full Width */}
                <div className="mb-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm md:mb-6 md:p-6">
                  <h3 className="mb-2 text-lg font-bold text-white md:mb-3 md:text-xl">
                    🏁 Daily Challenges
                  </h3>
                  <p className="mb-3 text-sm text-white/80 md:mb-4 md:text-base">
                    Choose your difficulty - race against the clock and your
                    friends! New puzzles at midnight UTC.
                  </p>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <button
                      onClick={() => openSudokuOfTheDay(Difficulty.SIMPLE)}
                      disabled={isLoading}
                      className={`${
                        isLoading ? 'cursor-wait' : 'cursor-pointer'
                      } flex flex-col items-center justify-center rounded-xl bg-white/20 p-3 font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 disabled:opacity-50 md:p-4`}
                    >
                      <span className="mb-1 text-xl md:mb-2 md:text-2xl">
                        ⚡
                      </span>
                      <span className="text-xs md:text-sm">Tricky</span>
                      <div className="mt-1 flex space-x-0.5">
                        <span className="text-xs text-yellow-300">⭐</span>
                      </div>
                    </button>
                    <button
                      onClick={() => openSudokuOfTheDay(Difficulty.EASY)}
                      disabled={isLoading}
                      className={`${
                        isLoading ? 'cursor-wait' : 'cursor-pointer'
                      } relative flex flex-col items-center justify-center rounded-xl bg-white/20 p-3 font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 disabled:opacity-50 md:p-4`}
                    >
                      <span className="mb-1 text-xl md:mb-2 md:text-2xl">
                        🔥
                      </span>
                      <span className="text-xs md:text-sm">Challenging</span>
                      <div className="mt-1 flex space-x-0.5">
                        <span className="text-xs text-yellow-300">⭐⭐</span>
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        openSudokuOfTheDay(Difficulty.INTERMEDIATE)
                      }
                      disabled={isLoading}
                      className={`${
                        isLoading ? 'cursor-wait' : 'cursor-pointer'
                      } relative flex flex-col items-center justify-center rounded-xl bg-white/20 p-3 font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 disabled:opacity-50 md:p-4`}
                    >
                      <span className="mb-1 text-xl md:mb-2 md:text-2xl">
                        🚀
                      </span>
                      <span className="text-xs md:text-sm">Hard</span>
                      <div className="mt-1 flex space-x-0.5">
                        <span className="text-xs text-yellow-300">⭐⭐⭐</span>
                      </div>
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-white/80 md:mb-4 md:text-base">
                    (For easy or fiendish check out the book below!)
                  </p>
                </div>

                {/* Monthly Puzzle Book */}
                {(() => {
                  const currentMonth = new Date(
                    new Date().toISOString()
                  ).toLocaleString('en-US', {
                    month: 'long',
                    timeZone: 'UTC',
                  });

                  return (
                    <div className="mb-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm md:mb-6 md:p-6">
                      <h3 className="mb-2 text-lg font-bold text-white md:mb-3 md:text-xl">
                        📚 {currentMonth} Puzzle Book
                      </h3>
                      <p className="mb-3 text-sm text-white/80 md:mb-4 md:text-base">
                        Each month we publish a new collection of 50 puzzles
                        crafted with multiple solving techniques
                      </p>
                      <div className="flex flex-col items-center rounded-xl bg-white/20 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:p-6">
                        <div className="mb-4 flex flex-col items-center md:mb-0 md:flex-row md:items-center">
                          <button
                            onClick={openBook}
                            className="mb-3 cursor-pointer md:mr-6 md:mb-0"
                          >
                            <BookCover month={currentMonth} size="large" />
                          </button>
                          <div className="text-center md:text-left">
                            <div className="text-lg font-bold text-white md:text-xl">
                              {currentMonth} Edition
                            </div>
                            <div className="text-sm text-white/70 md:text-base">
                              50 Technique-Based Puzzles
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={openBook}
                          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 md:px-8 md:py-4 md:text-base"
                        >
                          Browse Puzzles
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Import & Friends in 2-column grid on desktop */}
                <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                  {/* Import Racing Challenge */}
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm md:p-6">
                    <h3 className="mb-2 text-lg font-bold text-white md:mb-3 md:text-xl">
                      📸 Import Puzzle
                    </h3>
                    <p className="mb-3 text-sm text-white/80 md:mb-4 md:text-base">
                      Scan and share an unsolved puzzle from a book or website -
                      race against the clock and your friends!
                    </p>
                    <Link
                      href="/import"
                      className="inline-flex items-center justify-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 md:px-6 md:py-3 md:text-base"
                    >
                      <Camera className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                      Import Puzzle
                    </Link>
                  </div>

                  {/* Friends Racing */}
                  <div className="rounded-2xl bg-white/8 p-4 backdrop-blur-sm md:p-6">
                    <h3 className="mb-2 text-lg font-bold text-white md:mb-3 md:text-xl">
                      👥 Team Racing
                    </h3>
                    <p className="mb-3 text-sm text-white/80 md:mb-4 md:text-base">
                      Race against{' '}
                      {friendsList?.length
                        ? friendsList.slice(0, 3).join(', ')
                        : 'your racing team'}{' '}
                      and climb the leaderboard!
                    </p>
                    <button
                      onClick={() => handleTabChange(Tab.FRIENDS)}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 md:px-6 md:py-3 md:text-base"
                    >
                      <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                      View Racing Teams
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Racing track decoration */}
            <div className="absolute right-0 bottom-0 left-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
          </div>

          {/* Premium Features Section */}
          <div className="container mx-auto max-w-6xl px-6 py-6 md:py-8">
            <div className="mb-6 md:mb-8">
              <h2 className="mb-2 text-center text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                🏁 Premium Features
              </h2>
              <p className="text-center text-sm text-gray-600 md:text-base dark:text-gray-400">
                Unlock the full Sudoku Race experience
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`group relative rounded-2xl border-2 bg-white/80 p-4 shadow-lg backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl md:p-6 dark:bg-gray-800/80 ${
                    feature.isPremium
                      ? 'cursor-pointer border-yellow-200 hover:border-yellow-300 dark:border-yellow-600'
                      : 'border-green-200 dark:border-green-600'
                  }`}
                  onClick={() => {
                    if (feature.isPremium) {
                      handlePremiumFeatureClick();
                    }
                  }}
                >
                  {feature.isPremium && (
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                      <Star className="h-3 w-3" />
                    </div>
                  )}

                  <div className="mb-3 flex items-center md:mb-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl md:h-12 md:w-12 ${
                        feature.isPremium
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                          : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                      }`}
                    >
                      <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="ml-3 flex-1 md:ml-4">
                      {feature.isPremium ? (
                        <Lock className="float-right h-4 w-4 text-gray-400" />
                      ) : (
                        <CheckCircle className="float-right h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  <h3 className="mb-2 text-base font-semibold text-gray-900 md:text-lg dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 md:text-sm dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom padding to ensure content doesn't get hidden behind footer */}
          <div className="pb-24"></div>
        </div>
      ) : (
        <div className="pt-safe min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto max-w-4xl px-6 pb-24">
            <div className="flex justify-center">
              <ActivityWidget sessions={sessions || []} />
            </div>
            {tab === Tab.MY_PUZZLES && (
              <MyPuzzlesTab sessions={sessions || []} />
            )}
            {tab === Tab.FRIENDS && (
              <FriendsTab
                user={user}
                parties={parties}
                mySessions={sessions || []}
              />
            )}
          </div>
        </div>
      )}
      <Footer>
        <button
          onClick={() => handleTabChange(Tab.START_PUZZLE)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 transition-colors duration-200 active:opacity-70 ${tabBackground(Tab.START_PUZZLE)}`}
        >
          <Zap className="text-theme-primary dark:text-theme-primary-light mb-1 h-6 w-6" />
          <span className="text-center text-xs font-medium">Start Race</span>
        </button>
        <button
          onClick={() => handleTabChange(Tab.MY_PUZZLES)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 transition-colors duration-200 active:opacity-70 ${tabBackground(Tab.MY_PUZZLES)}`}
        >
          <Award className="text-theme-primary dark:text-theme-primary-light mb-1 h-6 w-6" />
          <span className="text-center text-xs font-medium">My Puzzles</span>
        </button>
        <button
          onClick={() => handleTabChange(Tab.FRIENDS)}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center px-5 transition-colors duration-200 active:opacity-70 ${tabBackground(Tab.FRIENDS)}`}
        >
          <Users className="text-theme-primary dark:text-theme-primary-light mb-1 h-6 w-6" />
          <span className="text-center text-xs font-medium">Racing Teams</span>
        </button>
      </Footer>
    </>
  );
}
