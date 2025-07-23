'use client';

import { useThemeColor } from '@/providers/ThemeColorProvider';
import { RevenueCatContext } from '@/providers/RevenueCatProvider';
import { useState, useContext } from 'react';

const ThemeColorSwitch = () => {
  const { themeColor, setThemeColor } = useThemeColor();
  const { isSubscribed, subscribeModal } = useContext(RevenueCatContext) || {};
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { name: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    { name: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    { name: 'purple', bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    { name: 'amber', bg: 'bg-amber-500', hover: 'hover:bg-amber-600' },
    { name: 'cyan', bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
    { name: 'pink', bg: 'bg-pink-500', hover: 'hover:bg-pink-600' },
    { name: 'indigo', bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
    { name: 'orange', bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    { name: 'teal', bg: 'bg-teal-500', hover: 'hover:bg-teal-600' },
    { name: 'slate', bg: 'bg-slate-500', hover: 'hover:bg-slate-600' },
    { name: 'rose', bg: 'bg-rose-500', hover: 'hover:bg-rose-600' },
    { name: 'emerald', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    { name: 'sky', bg: 'bg-sky-500', hover: 'hover:bg-sky-600' },
    { name: 'violet', bg: 'bg-violet-500', hover: 'hover:bg-violet-600' },
    { name: 'lime', bg: 'bg-lime-500', hover: 'hover:bg-lime-600' },
    { name: 'fuchsia', bg: 'bg-fuchsia-500', hover: 'hover:bg-fuchsia-600' },
    { name: 'yellow', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
    { name: 'stone', bg: 'bg-stone-500', hover: 'hover:bg-stone-600' },
    { name: 'zinc', bg: 'bg-zinc-500', hover: 'hover:bg-zinc-600' },
  ];

  const currentColor = colors.find((c) => c.name === themeColor) || colors[0];

  const handleColorClick = (colorName: string) => {
    const colorIndex = colors.findIndex((c) => c.name === colorName);

    if (colorIndex < 2 || isSubscribed) {
      // Free colors (first two) or user is subscribed
      setThemeColor(colorName as any);
      setIsOpen(false);
    } else {
      // Premium color and user not subscribed - show modal with callback
      subscribeModal?.showModalIfRequired(() => {
        setThemeColor(colorName as any);
        setIsOpen(false);
      });
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="Change Theme Color"
        onClick={() => setIsOpen(!isOpen)}
        className={`mx-1 h-8 w-8 cursor-pointer rounded-full p-1.5 transition-colors active:opacity-70 ${currentColor.bg} text-white`}
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
