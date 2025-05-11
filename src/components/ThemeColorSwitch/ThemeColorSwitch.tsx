'use client';

import { useThemeColor } from '@/providers/ThemeColorProvider';
import { useState } from 'react';

const ThemeColorSwitch = () => {
  const { themeColor, setThemeColor } = useThemeColor();
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
  ];

  const currentColor = colors.find((c) => c.name === themeColor) || colors[0];

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
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-gray-800">
          <div className="flex flex-wrap gap-2 p-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  setThemeColor(color.name as any);
                  setIsOpen(false);
                }}
                className={`h-8 w-8 rounded-full ${color.bg} ${color.hover} ${
                  themeColor === color.name
                    ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800'
                    : ''
                }`}
                aria-label={`Set theme color to ${color.name}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeColorSwitch;
