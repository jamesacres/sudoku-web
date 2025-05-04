'use client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { ChevronLeft } from 'react-feather';

const HeaderBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  return pathname === '/' ? (
    <div className="w-16"></div>
  ) : (
    <button
      className="flex w-16 cursor-pointer items-center text-blue-600 transition-opacity active:opacity-70 dark:text-blue-400"
      type="button"
      onClick={() => router.replace('/')}
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="text-base font-normal">Back</span>
    </button>
  );
};

export default HeaderBack;
