'use client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { ChevronLeft } from 'react-feather';

const HeaderBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  return pathname === '/' ? (
    <div className="flex items-center">
      <span className="inline-flex items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-sm font-semibold text-transparent">
        Sudoku Race
      </span>
    </div>
  ) : (
    <button
      className="text-theme-primary dark:text-theme-primary-light flex w-16 cursor-pointer items-center transition-opacity active:opacity-70"
      type="button"
      onClick={() => router.replace('/')}
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="text-base font-normal">Back</span>
    </button>
  );
};

export default HeaderBack;
