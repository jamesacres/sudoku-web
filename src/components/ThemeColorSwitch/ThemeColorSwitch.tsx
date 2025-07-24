'use client';

import { useThemeColor } from '@/providers/ThemeColorProvider';
import { RevenueCatContext } from '@/providers/RevenueCatProvider';
import { useState, useContext, useEffect } from 'react';
import { SubscriptionContext } from '@/types/subscriptionContext';

const colors = [
  {
    name: 'blue',
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    hex: '#3b82f6',
  },
  {
    name: 'red',
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    hex: '#ef4444',
  },
  {
    name: 'green',
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    hex: '#22c55e',
  },
  {
    name: 'purple',
    bg: 'bg-purple-500',
    hover: 'hover:bg-purple-600',
    hex: '#a855f7',
  },
  {
    name: 'amber',
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    hex: '#f59e0b',
  },
  {
    name: 'cyan',
    bg: 'bg-cyan-500',
    hover: 'hover:bg-cyan-600',
    hex: '#06b6d4',
  },
  {
    name: 'pink',
    bg: 'bg-pink-500',
    hover: 'hover:bg-pink-600',
    hex: '#ec4899',
  },
  {
    name: 'indigo',
    bg: 'bg-indigo-500',
    hover: 'hover:bg-indigo-600',
    hex: '#6366f1',
  },
  {
    name: 'orange',
    bg: 'bg-orange-500',
    hover: 'hover:bg-orange-600',
    hex: '#f97316',
  },
  {
    name: 'teal',
    bg: 'bg-teal-500',
    hover: 'hover:bg-teal-600',
    hex: '#14b8a6',
  },
  {
    name: 'slate',
    bg: 'bg-slate-500',
    hover: 'hover:bg-slate-600',
    hex: '#64748b',
  },
  {
    name: 'rose',
    bg: 'bg-rose-500',
    hover: 'hover:bg-rose-600',
    hex: '#f43f5e',
  },
  {
    name: 'emerald',
    bg: 'bg-emerald-500',
    hover: 'hover:bg-emerald-600',
    hex: '#10b981',
  },
  {
    name: 'sky',
    bg: 'bg-sky-500',
    hover: 'hover:bg-sky-600',
    hex: '#0ea5e9',
  },
  {
    name: 'violet',
    bg: 'bg-violet-500',
    hover: 'hover:bg-violet-600',
    hex: '#8b5cf6',
  },
  {
    name: 'lime',
    bg: 'bg-lime-500',
    hover: 'hover:bg-lime-600',
    hex: '#84cc16',
  },
  {
    name: 'fuchsia',
    bg: 'bg-fuchsia-500',
    hover: 'hover:bg-fuchsia-600',
    hex: '#d946ef',
  },
  {
    name: 'yellow',
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    hex: '#eab308',
  },
  {
    name: 'stone',
    bg: 'bg-stone-500',
    hover: 'hover:bg-stone-600',
    hex: '#78716c',
  },
  {
    name: 'zinc',
    bg: 'bg-zinc-500',
    hover: 'hover:bg-zinc-600',
    hex: '#71717a',
  },
];

const ThemeColorSwitch = () => {
  const { themeColor, setThemeColor } = useThemeColor();
  const { isSubscribed, subscribeModal } = useContext(RevenueCatContext) || {};
  const [isOpen, setIsOpen] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const [rainbowIndex, setRainbowIndex] = useState(0);

  const currentColor = colors.find((c) => c.name === themeColor) || colors[0];

  // Rainbow animation on app load - cycle through theme colors
  useEffect(() => {
    setShowRainbow(true);
    let colorIndex = 0;

    const colorInterval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length;
      setRainbowIndex(colorIndex);
    }, 200); // Change color every 200ms

    const stopTimer = setTimeout(() => {
      setShowRainbow(false);
      clearInterval(colorInterval);
    }, 3000); // Stop after 3 seconds

    return () => {
      clearInterval(colorInterval);
      clearTimeout(stopTimer);
    };
  }, []);

  const handleColorClick = (colorName: string) => {
    const colorIndex = colors.findIndex((c) => c.name === colorName);

    if (colorIndex < 2 || isSubscribed) {
      // Free colors (first two) or user is subscribed
      setThemeColor(colorName as any);
      setIsOpen(false);
    } else {
      // Premium color and user not subscribed - show modal with callback
      subscribeModal?.showModalIfRequired(
        () => {
          setThemeColor(colorName as any);
          setIsOpen(false);
        },
        () => {},
        SubscriptionContext.THEME_COLOR
      );
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="Change Theme Color"
        onClick={() => setIsOpen(!isOpen)}
        className={`mx-1 h-8 w-8 cursor-pointer rounded-full p-1.5 transition-colors active:opacity-70 ${currentColor.bg} text-white`}
        style={
          showRainbow
            ? {
                border: `3px solid ${colors[rainbowIndex].hex}`,
              }
            : undefined
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full"
        >
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-3a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-42 rounded-md bg-white shadow-lg dark:bg-gray-800">
          <div className="flex flex-wrap gap-2 p-2">
            {colors.map((color, index) => {
              const isPremium = index >= 2 && !isSubscribed;
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorClick(color.name)}
                  className={`relative h-8 w-8 rounded-full ${color.bg} ${color.hover} ${
                    themeColor === color.name
                      ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800'
                      : ''
                  }`}
                  aria-label={`Set theme color to ${color.name}${isPremium ? ' (Premium)' : ''}`}
                >
                  {isPremium && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-1 py-0.5 text-xs font-semibold text-white shadow-lg">
                      ✨
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeColorSwitch;
