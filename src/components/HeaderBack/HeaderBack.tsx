'use client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { ArrowLeft } from 'react-feather';

const HeaderBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  return pathname === '/' ? (
    <span className="text-xl font-semibold tracking-tight">Sudoku</span>
  ) : (
    <button type="button" onClick={() => router.back()}>
      <ArrowLeft />
    </button>
  );
};

export default HeaderBack;
